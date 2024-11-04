const { response } = require('../../utilities/response');
const sellerModel = require('../../models/sellerModel');
class sellerController {
    getAllPeding = async (req, res) => {
        try {
            const { page, perPage, searchValue } = req.query;
            let skipPage = '';
            if (page && perPage) {
                skipPage = parseInt(perPage) * (parseInt(page) - 1);
            }
            if (searchValue && page && perPage) {
                const sellers = await sellerModel.find({
                    $text: { $search: searchValue }, status: 'pending'
                }).skip(skipPage).limit(perPage).sort({ createdAt: -1 });
                const totalSellers = await sellerModel.find({
                    $text: { $search: searchValue }, status: 'pending'
                }).countDocuments();

                response(res, 200, { sellers, totalSellers });
            } else if (searchValue === '' && page && perPage) {
                const sellers = await sellerModel.find({ status: 'pending' }).skip(skipPage).limit(perPage).sort({ createdAt: -1 });
                const totalSellers = await sellerModel.find({ status: 'pending' }).countDocuments();

                response(res, 200, { sellers, totalSellers });
            } else {
                const sellers = await sellerModel.find({ status: 'pending' }).sort({ createdAt: -1 });
                const totalSellers = await sellerModel.find({ status: 'pending' }).countDocuments();

                response(res, 200, { sellers, totalSellers });
            }
        } catch (error) {
            console.log(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    }

    getAllActive = async (req, res) => {
        try {
            const { page, perPage, searchValue } = req.query;
            let skipPage = '';
            if (page && perPage) {
                skipPage = parseInt(perPage) * (parseInt(page) - 1);
            }
            if (searchValue && page && perPage) {
                const sellers = await sellerModel.find({
                    $and: [
                        { status: 'active' },
                        {
                            $or: [
                                { $text: { $search: searchValue } },
                                { name: { $regex: searchValue, $options: 'i' } },
                                { email: { $regex: searchValue, $options: 'i' } }
                            ]
                        }
                    ]
                }).skip(skipPage).limit(perPage).sort({ createdAt: -1 });
                const totalSellers = await sellerModel.find({
                    $and: [
                        { status: 'active' },
                        {
                            $or: [
                                { $text: { $search: searchValue } },
                                { name: { $regex: searchValue, $options: 'i' } },
                                { email: { $regex: searchValue, $options: 'i' } }
                            ]
                        }
                    ]
                }).countDocuments();

                response(res, 200, { sellers, totalSellers });
            } else if (searchValue === '' && page && perPage) {
                const sellers = await sellerModel.find({ status: 'active' }).skip(skipPage).limit(perPage).sort({ createdAt: -1 });
                const totalSellers = await sellerModel.find({ status: 'active' }).countDocuments();

                response(res, 200, { sellers, totalSellers });
            } else {
                const sellers = await sellerModel.find({ status: 'active' }).sort({ createdAt: -1 });
                const totalSellers = await sellerModel.find({ status: 'active' }).countDocuments();

                response(res, 200, { sellers, totalSellers });
            }
        } catch (error) {
            console.log(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    }


    getAllDeactive = async (req, res) => {
        try {
            const { page, perPage, searchValue } = req.query;
            let skipPage = '';
            if (page && perPage) {
                skipPage = parseInt(perPage) * (parseInt(page) - 1);
            }
            if (searchValue && page && perPage) {
                const sellers = await sellerModel.find({
                    $and: [
                        { status: 'deactive' },
                        {
                            $or: [
                                { $text: { $search: searchValue } },
                                { name: { $regex: searchValue, $options: 'i' } },
                                { email: { $regex: searchValue, $options: 'i' } }
                            ]
                        }
                    ]
                }).skip(skipPage).limit(perPage).sort({ createdAt: -1 });
                const totalSellers = await sellerModel.find({
                    $and: [
                        { status: 'deactive' },
                        {
                            $or: [
                                { $text: { $search: searchValue } },
                                { name: { $regex: searchValue, $options: 'i' } },
                                { email: { $regex: searchValue, $options: 'i' } }
                            ]
                        }
                    ]
                }).countDocuments();

                response(res, 200, { sellers, totalSellers });
            } else if (searchValue === '' && page && perPage) {
                const sellers = await sellerModel.find({ status: 'deactive' }).skip(skipPage).limit(perPage).sort({ createdAt: -1 });
                const totalSellers = await sellerModel.find({ status: 'deactive' }).countDocuments();

                response(res, 200, { sellers, totalSellers });
            } else {
                const sellers = await sellerModel.find({ status: 'deactive' }).sort({ createdAt: -1 });
                const totalSellers = await sellerModel.find({ status: 'deactive' }).countDocuments();

                response(res, 200, { sellers, totalSellers });
            }
        } catch (error) {
            console.log(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    }

    getSeller = async (req, res) => {
        try {
            const { sellerId } = req.params;
            const seller = await sellerModel.findById(sellerId);
            if (seller) {
                response(res, 200, { seller });
            } else {
                response(res, 404, { error: 'Seller Not Found' });
            }
        } catch (error) {
            console.log(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    }

    updateStatus = async (req, res) => {
        try {
            const { status, sellerId } = req.body;
            const update = await sellerModel.findByIdAndUpdate(sellerId, { status });
            if (update) {
                const udpatedSeller = await sellerModel.findById(sellerId);
                response(res, 200, { seller: udpatedSeller, message: "Status Updated Successfully" });
            } else {
                response(res, 404, { error: "Status Could Not Been Updated" });
            }
        } catch (error) {
            console.log(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    }
}
module.exports = new sellerController();