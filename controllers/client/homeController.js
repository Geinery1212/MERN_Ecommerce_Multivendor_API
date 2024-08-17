const formidable = require('formidable');
const cloudinary = require('cloudinary').v2;
const { response } = require('../../utilities/response');
const categoryModel = require('../../models/categoryModel');
const productModel = require('../../models/productModel');
class homeController {
    getAllCategories = async (req, res) => {
        try {
            const categories = await categoryModel.find().sort({ createdAt: -1 });
            response(res, 200, { categories });
        } catch (error) {
            console.log(error);
            response(res, 500, { error: 'Internal Servel Error' });
        }
    }
    formatProduct = () => {

    }
    getProducts = async (req, res) => {
        try {
            const products1 = await productModel.find({}).limit(12).sort({
                createdAt: -1
            })
            const products2 = await productModel.find({}).limit(9).sort({
                createdAt: -1
            })
            const latest_product = this.formatProduct(products2);

            const products3 = await productModel.find({}).limit(9).sort({
                rating: -1
            })
            const topRated_product = this.formatProduct(products3);

            const products4 = await productModel.find({}).limit(9).sort({
                discount: -1
            })
            const discount_product = this.formatProduct(products4);

            responseReturn(res, 200, {
                products: products1,
                latest_product,
                topRated_product,
                discount_product
            })

        } catch (error) {
            console.log(error.message)
        }
    }
}
module.exports = new homeController();