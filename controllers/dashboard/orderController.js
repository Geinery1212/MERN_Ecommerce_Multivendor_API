const ordersModel = require('../../models/sellerModel');
const customerOrder = require('../../models/customerOrder');
const authOrderModel = require('../../models/authOrder');
const { response } = require('../../utilities/response');
const { Types } = require('mongoose');
const { ObjectId } = Types;
class orderController {
    getOrdersAdmin = async (req, res) => {
        try {
            if (req.role !== 'admin') {
                response(res, 403, { 'error': 'Unauthorized' });
            } else {
                let { page, searchValue, perPage } = req.query
                page = parseInt(page)
                perPage = parseInt(perPage)

                const skipPage = perPage * (page - 1);
                var orders = [];
                if (searchValue) {
                    orders = await customerOrder.aggregate([
                        {
                            $lookup: {
                                from: 'authororders',
                                localField: "_id",
                                foreignField: 'orderId',
                                as: 'suborders'
                            }
                        },
                        {
                            // Convert `_id` to a string in a new field to enable partial matching
                            $addFields: { idAsString: { $toString: "$_id" } }
                        },
                        {
                            $match: {
                                idAsString: { $regex: searchValue, $options: 'i' }
                            }
                        }
                    ])
                        .skip(skipPage)
                        .limit(perPage)
                        .sort({ createdAt: -1 });
                } else {
                    orders = await customerOrder.aggregate([
                        {
                            //from authororder brig me the seller and save it in suborder
                            $lookup: {
                                from: 'authororders',
                                localField: "_id",
                                foreignField: 'orderId',
                                as: 'suborders'
                            }
                        }
                    ]).skip(skipPage).limit(perPage).sort({ createdAt: -1 });
                }
                const totalOrders = await customerOrder.aggregate([
                    {
                        $lookup: {
                            from: 'authororders',
                            localField: "_id",
                            foreignField: 'orderId',
                            as: 'suborders'
                        }
                    }
                ])

                response(res, 200, { orders, totalOrders: totalOrders.length });

            }
        } catch (error) {
            console.error(error);
            response(res, 500, { 'error': 'Internal Server Error' });
        }
    }

    getOrdersSeller = async (req, res) => {
        try {
            let sellerId = req.id;
            if (req.role !== 'seller') {
                response(res, 403, { 'error': 'Unauthorized' });
            } else {
                let { page, searchValue, perPage } = req.query
                page = parseInt(page)
                perPage = parseInt(perPage)

                const skipPage = perPage * (page - 1);
                var orders = [];
                if (searchValue) {
                    orders = await authOrderModel.aggregate([
                        {
                            $match: {
                                sellerId: ObjectId.isValid(sellerId) ? new ObjectId(`${sellerId}`) : null,
                            }
                        },
                        {
                            // Convert `_id` to a string in a new field to enable partial matching
                            $addFields: { idAsString: { $toString: "$_id" } }
                        },
                        {
                            $match: {
                                idAsString: { $regex: searchValue, $options: 'i' }
                            }
                        }
                    ])
                        .skip(skipPage)
                        .limit(perPage)
                        .sort({ createdAt: -1 });
                } else {
                    orders = await authOrderModel.find({
                        sellerId,
                    }).skip(skipPage).limit(perPage).sort({ createdAt: -1 })

                }
                const totalOrders = await authOrderModel.find({
                    sellerId
                }).countDocuments();
                response(res, 200, { orders, totalOrders });

            }
        } catch (error) {
            console.error(error);
            response(res, 500, { 'error': 'Internal Server Error' });
        }
    }

    getOrderAdmin = async (req, res) => {
        try {
            if (req.role !== 'admin') {
                response(res, 403, { 'error': 'Unauthorized' });
            } else {
                const { orderId } = req.params;
                const order = await customerOrder.aggregate([
                    {
                        $match: { _id: new ObjectId(`${orderId}`) }
                    },
                    {
                        $lookup: {
                            from: 'authororders',
                            localField: "_id",
                            foreignField: 'orderId',
                            as: 'suborders'
                        }
                    },
                    {
                        $lookup: {
                            from: 'customers',
                            localField: "customerId",
                            foreignField: '_id',
                            as: 'customer'
                        }
                    }
                ])
                response(res, 200, { order: order[0] });
            }
        } catch (error) {
            console.error(error);
            response(res, 500, { 'error': 'Internal Server Error' });
        }
    }
    updateOrderStatusAdmin = async (req, res) => {
        try {
            if (req.role !== 'admin') {
                response(res, 403, { 'error': 'Unauthorized' });
            } else {
                const { orderId } = req.params;
                const { status } = req.body;
                console.log(orderId, status);
                const updatedOrder = await customerOrder.findByIdAndUpdate(orderId, {
                    delivery_status: status
                }, { new: true });
                response(res, 200, { message: 'Status Updated Sucessfully', order: updatedOrder });
            }
        } catch (error) {
            response(res, 500, { 'error': 'Internal Server Error' });

        }

    }


    getOrderSeller = async (req, res) => {
        try {
            if (req.role !== 'seller') {
                response(res, 403, { 'error': 'Unauthorized' });
            } else {
                const { orderId } = req.params;
                const sellerId = req.id;
                const order = await authOrderModel.find({
                    sellerId: ObjectId.isValid(sellerId) ? new ObjectId(`${sellerId}`) : null,
                    _id: ObjectId.isValid(orderId) ? new ObjectId(`${orderId}`) : null,
                });
                response(res, 200, { order: order[0] });
            }
        } catch (error) {
            console.error(error);
            response(res, 500, { 'error': 'Internal Server Error' });
        }
    }
    updateOrderStatusSeller = async (req, res) => {
        try {
            if (req.role !== 'seller') {
                return response(res, 403, { 'error': 'Unauthorized' });
            }

            const { orderId } = req.params;
            const { status } = req.body;
            const sellerId = req.id;

            // Check if order belongs to seller
            const order = await authOrderModel.findOne({ _id: orderId, sellerId });
            if (!order) {
                return response(res, 403, { 'error': 'Unauthorized: Order not found for this seller' });
            }          

            const updatedOrder = await authOrderModel.findByIdAndUpdate(orderId, {
                delivery_status: status
            }, { new: true });

            response(res, 200, { message: 'Status Updated Successfully', order: updatedOrder });
        } catch (error) {
            response(res, 500, { 'error': 'Internal Server Error' });
        }
    };

}
module.exports = new orderController();