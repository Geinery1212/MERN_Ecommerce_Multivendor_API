const formidable = require('formidable');
const cloudinary = require('cloudinary').v2;
const { response } = require('../../utilities/response');
const categoryModel = require('../../models/categoryModel');
class categoryController {
    add = async (req, res) => {
        const form = formidable();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                response(res, 404, { error: 'Something went wrong' })
            } else {
                let { name } = fields;
                let { image } = files;
                name = name.trim();
                const slug = name.split(' ').join('-');
                cloudinary.config({
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    api_secret: process.env.CLOUDINARY_SECRET_KEY,
                    secure: true
                });
                try {
                    const result = await cloudinary.uploader.upload(image.filepath,
                        { folder: 'categories' }
                    );
                    if (result) {
                        const category = await categoryModel.create({
                            name, slug, image: result.url
                        });
                        if (category) {
                            response(res, 201, { category, message: 'Category Added Successfully' })
                        } else {
                            response(res, 404, { error: 'Error Uploading Image' });
                        }
                    } else {
                        response(res, 404, { error: 'Error Uploading Image' });
                    }
                } catch (error) {
                    response(res, 500, { error: 'Internal Servel Error' });
                }
            }
        });
    }
    getAll = async (req, res) => {
        const { page, perPage, searchValue } = req.query;
        let skipPage = '';
        try {
            if (page && perPage) {
                skipPage = parseInt(perPage) * (parseInt(page) - 1);
            }
            if (searchValue && page && searchValue) {
                const categories = await categoryModel.find({
                    $text: { $search: searchValue }
                }).skip(skipPage).limit(perPage).sort({ createdAt: -1 });

                const totalCategories = await categoryModel.find({
                    $text: { $search: searchValue }
                }).countDocuments();

                response(res, 200, { categories, totalCategories });
            } else if (searchValue === '' && page && perPage) {
                const categories = await categoryModel.find().skip(skipPage).limit(perPage).sort({ createdAt: -1 });

                const totalCategories = await categoryModel.find().countDocuments();

                response(res, 200, { categories, totalCategories });
            } else {
                const categories = await categoryModel.find().sort({ createdAt: -1 });

                const totalCategories = await categoryModel.find().countDocuments();

                response(res, 200, { categories, totalCategories });
            }
        } catch (error) {
            console.log(error);
            response(res, 500, { error: 'Internal Servel Error' });
        }
    }
}
module.exports = new categoryController();