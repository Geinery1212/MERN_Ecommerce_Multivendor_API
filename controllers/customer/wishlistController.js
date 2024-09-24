const cartModel = require('../../models/cartModel');
const wishlistModel = require('../../models/wishlistModel');
const { response } = require('../../utilities/response');
const { Types } = require('mongoose');
class wishlistController {
    add = async (req, res) => {
        try {
            const { slug } = req.body
            const product = await wishlistModel.findOne({ slug })
            req.body.userId = req.id;
            if (product) {
                response(res, 404, {
                    error: 'Product Is Already In Wishlist'
                })
            } else {
                await wishlistModel.create(req.body)
                response(res, 201, {
                    message: 'Product Add to Wishlist Success'
                })
            }
        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    };

    getAll = async (req, res) => {
        try {
            const userId = req.id;
            if (!userId) {
                return response(res, 400, { error: 'Longin first' });
            }

            const wishlist = await wishlistModel.find({ userId });

            return response(res, 200, { wishlist });
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            return response(res, 500, { error: 'Internal Server Error' });
        }
    };

    deleteOne = async (req, res) => {
        try {
            const userId = req.id;
            const { wishlistId } = req.params;

            // Check if user is authenticated
            if (!userId) {
                return response(res, 400, { error: 'Login first' });
            }

            // Find the wishlist item by its ID
            const wishlist = await wishlistModel.findById(wishlistId);
            
            if (!wishlist) {
                return response(res, 404, { error: 'We Cannot Remove The Product' });
            }

            if (wishlist.userId.toString() !== userId) {
                return response(res, 403, { error: 'Unauthorized Action' });
            }
            await wishlistModel.findByIdAndDelete(wishlistId);
            return response(res, 200, { message: 'Product Removed Successfully' });

        } catch (error) {
            console.error('Error deleting wishlist item:', error);
            return response(res, 500, { error: 'Internal Server Error' });
        }
    }



}
module.exports = new wishlistController();