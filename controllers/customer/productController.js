const moment = require('moment');
const { response } = require('../../utilities/response');
const reviewModel = require('../../models/reviewModel');
const productModel = require('../../models/productModel');
const { mongo: { ObjectId } } = require('mongoose')
class productController {
    saveReview = async (req, res) => {
        const { productId, rating, review, userName } = req.body
        try {
            await reviewModel.create({
                productId,
                userName,
                rating,
                review,
                date: moment(Date.now()).format('LL')
            })
            let rat = 0;
            const reviews = await reviewModel.find({
                productId
            })
            for (let i = 0; i < reviews.length; i++) {
                rat = rat + reviews[i].rating
            }
            let productRating = 0
            if (reviews.length !== 0) {
                productRating = (rat / reviews.length).toFixed(1)
            }
            await productModel.findByIdAndUpdate(productId, {
                rating: productRating
            })
            response(res, 201, {
                message: "Review Added Successfully"
            })

        } catch (error) {
            console.error(error)
            response(res, 500, { error: 'Internal Server Error' });
        }
    }

    getReviews = async (req, res) => {
        try {
            const { productId, pageNumber } = req.params;
            const limit = 5;
            const skipItems = limit * (pageNumber - 1);
            let getRating = await reviewModel.aggregate([
                {
                    $match: {
                        productId: ObjectId.isValid(productId) ? new ObjectId(`${productId}`) : null,
                        rating: { $ne: [] }
                    }
                },
                {
                    $group: {
                        _id: "$rating",
                        count: { $sum: 1 }
                    }
                }
            ]);

            let ratingReviews = [{
                rating: 5,
                sum: 0
            },
            {
                rating: 4,
                sum: 0
            },
            {
                rating: 3,
                sum: 0
            },
            {
                rating: 2,
                sum: 0
            },
            {
                rating: 1,
                sum: 0
            }];

            for (let i = 0; i < ratingReviews.length; i++) {
                for (let j = 0; j < getRating.length; j++) {
                    if (ratingReviews[i].rating === getRating[j]._id) {
                        ratingReviews[i].sum = getRating[j].count
                        break
                    }
                }
            }
            const getAll = await reviewModel.find({
                productId
            });            
            const reviews = await reviewModel.find({
                productId
            }).skip(skipItems).limit(limit).sort({ createdAt: -1 });

            response(res, 200, {
                reviews,
                totalReviews: getAll.length,
                ratingReviews
            });

        } catch (error) {
            console.log(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    }
}
module.exports = new productController();