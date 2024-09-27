const formidable = require('formidable');
const cloudinary = require('cloudinary').v2;
const { response } = require('../../utilities/response');
const categoryModel = require('../../models/categoryModel');
const productModel = require('../../models/productModel');
const filterProducts = require('../../utilities/filterProducts');
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
    formatProduct = (products) => {
        const returnArray = [];
        let i = 0
        while (i < products.length) {
            const tempArray = [];
            let j = i;
            while (j < i + 3) {
                if (products[j]) {
                    tempArray.push(products[j]);
                }
                j++;
            }
            returnArray.push(tempArray);
            i = j;
        }
        return returnArray;
    }
    getProducts = async (req, res) => {
        try {
            const products1 = await productModel.find({}).limit(12).sort({
                createdAt: -1
            })
            const products2 = await productModel.find({}).limit(9).sort({
                createdAt: -1
            })
            const latest_products = this.formatProduct(products2);

            const products3 = await productModel.find({}).limit(9).sort({
                rating: -1
            })
            const topRated_products = this.formatProduct(products3);

            const products4 = await productModel.find({}).limit(9).sort({
                discount: -1
            })
            const discount_products = this.formatProduct(products4);

            response(res, 200, {
                products: products1,
                latest_products,
                topRated_products,
                discount_products
            })

        } catch (error) {
            console.log(error);
            response(res, 500, { error: 'Internal Servel Error' });
        }
    }

    getPriceRangeProduct = async (req, res) => {
        try {
            const priceRange = {
                min: 0,
                max: 0,
            }
            const products = await productModel.find().limit(9).sort({
                createdAt: -1
            })
            const latest_products = this.formatProduct(products);
            const getForPrice = await productModel.find().sort({
                'price': 1
            })
            if (getForPrice.length > 0) {
                priceRange.max = getForPrice[getForPrice.length - 1].price
                priceRange.min = getForPrice[0].price
            }
            response(res, 200, {
                latest_products,
                priceRange
            });
        } catch (error) {
            console.log(error);
            response(res, 500, { error: 'Internal Servel Error' });
        }
    }

    getFilteredProduts = async (req, res) => {
        try {
            const perPage = 12;
            req.query.perPage = perPage;
            const products = await productModel.find().sort({
                createdAt: -1
            })
            const totalProducts = new filterProducts(products, req.query).searchQuery().categoryQuery().ratingQuery().priceQuery().sortByPrice().countProducts();

            const result = new filterProducts(products, req.query).searchQuery().categoryQuery().ratingQuery().priceQuery().sortByPrice().skip().limit().getProducts();

            response(res, 200, {
                products: result,
                totalProducts,
                perPage
            })
        } catch (error) {
            console.log(error);
            response(res, 500, { error: 'Internal Servel Error' });
        }
    }
    getProductDetails = async (req, res) => {
        const { slug } = req.params;

        try {
            const product = await productModel.findOne({ slug });
            const relatedProducts = await productModel.find({
                $and: [
                    {
                        _id: {
                            $ne: product.id
                        }
                    },
                    {
                        category: {
                            $eq: product.category
                        }
                    }

                ]
            }).limit(12);

            const moreProducts = await productModel.find({
                $and: [
                    {
                        _id: {
                            $ne: product._id
                        }
                    },
                    {
                        sellerId: {
                            $eq: product.sellerId
                        }
                    }
                ]
            }).limit(3);

            response(res, 200, { product, relatedProducts, moreProducts });
        } catch (error) {
            console.error('Error fetching product:', error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    };

}
module.exports = new homeController();