const { response } = require('../../utilities/response');
const customerOrder = require('../../models/customerOrder');

class dashboardController {
    getIndexData = async (req, res) => {
        const { id } = req;

        try {
            const recentOrders = await customerOrder.find({
                customerId: id
            }).limit(5)
            const pendingOrders = await customerOrder.find({
                customerId: id, delivery_status: 'pending'
            }).countDocuments()
            const totalOrders = await customerOrder.find({
                customerId: id
            }).countDocuments()
            const cancelledOrders = await customerOrder.find({
                customerId: id, delivery_status: 'cancelled'
            }).countDocuments()
            response(res, 200, {
                recentOrders,
                pendingOrders,
                totalOrders,
                cancelledOrders
            })
        } catch (error) {
            console.log(error);
            response(res, 500, { 'error': 'Internal Server Error' });
        }
    }
}
module.exports = new dashboardController();