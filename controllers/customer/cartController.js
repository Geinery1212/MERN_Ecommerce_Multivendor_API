const cartModel = require('../../models/cartModel');
const { response } = require('../../utilities/response');
const { Types } = require('mongoose');
const { ObjectId } = Types;
const { dinero, add, multiply, subtract, toDecimal, allocate } = require('dinero.js');
const { USD } = require('@dinero.js/currencies');
class cartController {
    add = async (req, res) => {
        try {
            let { userId, productId, quantity } = req.body;
            const product = await cartModel.findOne({
                $and: [{
                    productId: {
                        $eq: productId
                    },
                    userId: {
                        $eq: userId
                    }
                }]
            });
            if (product) {
                response(res, 500, { error: 'Product Already Added To Cart' });
            } else {
                const product = await cartModel.create({
                    userId,
                    productId,
                    quantity
                });
                response(res, 201, { message: 'Added To Cart Successfully', product });
            }
        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    };

    getProducts = async (req, res) => {
        try {
            const commission = 5; // Commission percentage
            let { userId } = req.params;
            let buy_product_items = 0;
            let calculated_price = dinero({ amount: 0, currency: USD });
            let cart_products_count = 0;

            const cart_products = await cartModel.aggregate([
                {
                    $match: {
                        userId: {
                            $eq: new ObjectId(`${userId}`)
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'products'
                    }
                }
            ]);

            const outofstock_products = cart_products.filter(p => p.products[0].stock < p.quantity);
            for (let i = 0; i < outofstock_products.length; i++) {
                cart_products_count += outofstock_products[i].quantity;
            }

            const stockProduct = cart_products.filter(p => p.products[0].stock >= p.quantity);
            for (let i = 0; i < stockProduct.length; i++) {
                const { quantity } = stockProduct[i];
                cart_products_count = buy_product_items + quantity;

                buy_product_items += quantity;
                const { price, discount } = stockProduct[i].products[0];
                let productPrice = dinero({ amount: price, currency: USD });

                if (discount !== 0) {
                    productPrice = subtract(productPrice, multiply(productPrice, discount / 100));
                }
                calculated_price = add(calculated_price, multiply(productPrice, quantity));
            }

            let p = [];
            let unique = [...new Set(stockProduct.map(p => p.products[0].sellerId.toString()))];
            for (let i = 0; i < unique.length; i++) {
                let price = dinero({ amount: 0, currency: USD });
                for (let j = 0; j < stockProduct.length; j++) {
                    const tempProduct = stockProduct[j].products[0];
                    if (unique[i] === tempProduct.sellerId.toString()) {
                        let pri = dinero({ amount: tempProduct.price, currency: USD });

                        if (tempProduct.discount !== 0) {
                            const withoutDiscount = 100 - tempProduct.discount;
                            const [discountAmount, remainingAmount] = allocate(pri, [tempProduct.discount, withoutDiscount]);
                            pri = subtract(pri, discountAmount);
                        }
                        let withoutComission = 100 - commission;
                        const [d1, d2] = allocate(pri, [commission, withoutComission]);
                        //TODO: RECheck the comission 
                        pri = subtract(pri, d1);
                        price = add(price, multiply(pri, stockProduct[j].quantity));

                        p[i] = {
                            sellerId: unique[i],
                            shopName: tempProduct.shopName,
                            price: price,
                            products: p[i] ? [
                                ...p[i].products,
                                {
                                    _id: stockProduct[j]._id,
                                    quantity: stockProduct[j].quantity,
                                    productInfo: tempProduct
                                }
                            ] : [{
                                _id: stockProduct[j]._id,
                                quantity: stockProduct[j].quantity,
                                productInfo: tempProduct
                            }]
                        };
                    }
                }
            }
            let shipping_fee = dinero({ amount: 20 * p.length * 100, currency: USD });
            response(res, 200, {
                cart_products: p,
                price: calculated_price,
                cart_products_count,
                buy_product_items,
                shipping_fee: shipping_fee,
                outofstock_products
            });
        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    };
    deleteProduct = async (req, res) => {
        try {
            const { id } = req;
            const { cartId } = req.params;
            const deletedProduct = await cartModel.findByIdAndDelete(cartId);

            if (!deletedProduct) {
                return response(res, 404, { error: 'Product not found in cart' });
            }

            response(res, 200, { message: 'Deleted successfully' });
        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    }

    quantityInc = async (req, res) => {
        try {
            const { cartId } = req.body;
            const updateCart = await cartModel.findByIdAndUpdate(
                cartId,
                { $inc: { quantity: 1 } },
                { new: true } // Return the updated document
            );

            if (!updateCart) {
                return response(res, 404, { message: 'Product Not Found' });
            }

            response(res, 200, { message: 'Quantity Updated Successfully', cart: updateCart });
        } catch (error) {
            response(res, 500, { error: 'Internal Server Error' });
        }
    }

    quantityDec = async (req, res) => {
        try {
            const { cartId } = req.body;
            const updateCart = await cartModel.findByIdAndUpdate(
                cartId,
                { $inc: { quantity: -1 } },
                { new: true } // Return the updated document
            );

            if (!updateCart) {
                return response(res, 404, { message: 'Product Not Found' });
            }

            response(res, 200, { message: 'Quantity Updated Successfully', cart: updateCart });
        } catch (error) {
            response(res, 500, { error: 'Internal Server Error' });
        }
    }

}
module.exports = new cartController();