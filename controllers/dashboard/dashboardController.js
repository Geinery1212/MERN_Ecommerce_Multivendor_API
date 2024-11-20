const { response } = require("../../utilities/response");
const myShopWallet = require('../../models/myShopWallet');
const productModel = require('../../models/productModel');
const sellerModel = require('../../models/sellerModel');
const customerOrder = require('../../models/customerOrder');
const sellerAdminMessages = require('../../models/chat/sellerAdminMsg');
const sellerCustomerMessage = require('../../models/chat/sellerCustomerMsg');
const sellerWallet = require('../../models/sellerWallet');
const authOrder = require('../../models/authOrder');
const { Types } = require('mongoose');
const { ObjectId } = Types;

class dashboardController {
    getAdminDashboardData = async (req, res) => {
        try {
            if (req.role !== 'admin') {
                response(res, 403, { 'error': 'Unauthorized' });
            }
            const totalSales = await myShopWallet.aggregate([
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' }
                    }
                }
            ]);
            const totalProducts = await productModel.find({}).countDocuments();
            const totalOrders = await customerOrder.find({}).countDocuments();
            const totalSellers = await sellerModel.find({}).countDocuments();
            const recentMessages = await sellerAdminMessages.find({}).limit(3);
            const recentOrders = await customerOrder.find({}).limit(5);
            response(res, 200, {
                totalProducts,
                totalOrders,
                totalSellers,
                recentMessages,
                recentOrders,
                totalSales: totalSales.length > 0 ? totalSales[0].totalAmount : 0,
            });
        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    }
    getSellerDashboardData = async (req, res) => {
        try {
            if (req.role !== 'seller') {
                response(res, 403, { 'error': 'Unauthorized' });
            }
            const id = req.id;
            const totalSales = await sellerWallet.aggregate([
                {
                    $match: {
                        sellerId: {
                            $eq: id
                        }
                    }
                }, {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' }
                    }
                }
            ])
            const totalProducts = await productModel.find({
                sellerId: new ObjectId(`${id}`)
            }).countDocuments();

            const totalOrders = await authOrder.find({
                sellerId: new ObjectId(`${id}`)
            }).countDocuments();

            const totalPendingOrders = await authOrder.find({
                $and: [
                    {
                        sellerId: {
                            $eq: new ObjectId(`${id}`)
                        }
                    },
                    {
                        delivery_status: {
                            $eq: 'pending'
                        }
                    }
                ]
            }).countDocuments();
            console.log(id);
            const recentMessages = await sellerCustomerMessage.find({
                $or: [
                    {
                        senderId: {
                            $eq: id
                        }
                    }, {
                        receiverId: {
                            $eq: id
                        }
                    }
                ]
            }).sort({ createdAt: -1 }).limit(3);

            const recentOrders = await authOrder.find({
                sellerId: new ObjectId(`${id}`)
            }).limit(5);

            response(res, 200, {
                totalProducts,
                totalOrders,
                totalPendingOrders,
                recentOrders,
                recentMessages,
                totalSales: totalSales.length > 0 ? totalSales[0].totalAmount : 0,
            });

        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    }
}
module.exports = new dashboardController();