const moment = require("moment/moment");
const authOrderModel = require('../../models/authOrder');
const customerOrder = require('../../models/customerOrder');
const cartModel = require('../../models/cartModel')
const { response } = require('../../utilities/response');
const { Types } = require('mongoose');
const { ObjectId } = Types;
const { dinero, add, multiply, subtract, toDecimal, allocate, toSnapshot } = require('dinero.js');
const { USD } = require('@dinero.js/currencies');
const myShopWallet = require("../../models/myShopWallet");
const sellerWallet = require("../../models/sellerWallet");
class orderController {
    paymentCheck = async (id) => {
        try {
            const order = await customerOrder.findById(id)
            if (order.payment_status === 'unpaid') {
                await customerOrder.findByIdAndUpdate(id, {
                    delivery_status: 'cancelled'
                })
                await authOrderModel.updateMany({
                    orderId: id
                }, {
                    delivery_status: 'cancelled'
                })
            }
            return true
        } catch (error) {
            console.log(error)
        }
    }

    placeOrder = async (req, res) => {
        try {
            const { price, products, shipping_fee, items, shippingInfo, userId } = req.body;
            let cartIds = [];
            let authorOrderData = []; //Orders per seller
            let customerOrderProduct = []; //All products regardless of the seller.
            const tempDate = moment(Date.now()).format('LLL');

            for (let i = 0; i < products.length; i++) {
                const pro = products[i].products
                for (let j = 0; j < pro.length; j++) {
                    const tempCusPro = pro[j].productInfo;
                    tempCusPro.quantity = pro[j].quantity
                    customerOrderProduct.push(tempCusPro)
                    if (pro[j]._id) {
                        cartIds.push(pro[j]._id)
                    }
                }
            }


            const d_shippingFee = dinero(shipping_fee);
            const d_price = dinero(price);
            let d_totalPrice = add(d_shippingFee, d_price);
            //Order per client
            const order = await customerOrder.create({
                customerId: userId,
                shippingInfo,
                products: customerOrderProduct,
                price: toSnapshot(d_totalPrice).amount,
                payment_status: 'unpaid',
                delivery_status: 'pending',
                date: tempDate
            });

            for (let i = 0; i < products.length; i++) {
                const pro = products[i].products;
                const pri = dinero(products[i].price);
                const sellerId = products[i].sellerId;
                let storePor = []
                for (let j = 0; j < pro.length; j++) {
                    const tempPro = pro[j].productInfo;
                    tempPro.quantity = pro[j].quantity;
                    storePor.push(tempPro);
                }

                authorOrderData.push({
                    orderId: order.id,
                    sellerId,
                    products: storePor,
                    price: toSnapshot(pri).amount,
                    payment_status: 'unpaid',
                    shippingInfo: 'Easy Main Warehouse',
                    delivery_status: 'pending',
                    date: tempDate
                })
            }

            await authOrderModel.insertMany(authorOrderData)
            for (let k = 0; k < cartIds.length; k++) {
                await cartModel.findByIdAndDelete(cartIds[k]);
            }
            setTimeout(() => {
                this.paymentCheck(order.id)
            }, 150000);
            response(res, 200, { message: "Order Placed Successfully", orderId: order.id });
        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    }
    getOrders = async (req, res) => {
        try {
            const { id } = req;
            const { status } = req.params;
            let orders = [];
            if (status !== 'all') {
                orders = await customerOrder.find({
                    customerId: id,
                    delivery_status: status
                })
            } else {
                orders = await customerOrder.find({
                    customerId: id
                });
            }
            response(res, 200, { orders });
        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    }

    getOrder = async (req, res) => {
        try {
            const { id } = req;
            const { orderId } = req.params;

            const order = await customerOrder.findOne({
                _id: orderId,
                customerId: id
            });

            if (!order) {
                response(res, 404, 'Order not found');
            }

            response(res, 200, { order });
        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    };
    confirmOrder = async (req, res) => {
        try {
            const { orderId } = req.params;
            await customerOrder.findByIdAndUpdate(orderId, { payment_status: 'paid' })
            await authOrderModel.updateMany({ orderId: new ObjectId(`${orderId}`) }, {
                payment_status: 'paid', delivery_status: 'pending'
            })
            const cuOrder = await customerOrder.findById(orderId);

            const auOrder = await authOrderModel.find({
                orderId: new ObjectId(`${orderId}`)
            });

            const time = moment(Date.now()).format('l');
            const splitTime = time.split('/');                        

            await myShopWallet.create({
                amount: cuOrder.price,
                month: splitTime[0],
                year: splitTime[2]
            });

            for (let i = 0; i < auOrder.length; i++) {                
                await sellerWallet.create({
                    sellerId: auOrder[i].sellerId.toString(),
                    amount: auOrder[i].price,
                    month: splitTime[0],
                    year: splitTime[2]
                })
            }
            response(res, 200, { message: 'Success' });
        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    }

}
module.exports = new orderController();