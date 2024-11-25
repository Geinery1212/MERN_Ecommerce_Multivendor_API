const formidable = require('formidable');
const cloudinary = require('cloudinary').v2;
const { response } = require('../../utilities/response');
const categoryModel = require('../../models/categoryModel');
class categoryController {

    generateSlug = async (name, id) => {
        let slug = name.trim().toLowerCase().split(' ').join('-');
        let uniqueSlug = slug;
        let count = 1;


        while (await categoryModel.exists({ slug: uniqueSlug, _id: { $ne: id } })) {
            uniqueSlug = `${slug}-${count}`;
            count++;
        }

        return uniqueSlug;
    };

    add = async (req, res) => {
        const form = formidable();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                response(res, 404, { error: 'Something went wrong' })
            } else {
                let { name } = fields;
                let { image } = files;
                name = name.trim();
                const slug = await this.generateSlug(name, null);
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
                    response(res, 500, { error: 'Internal Server Error' });
                }
            }
        });
    }
    update = async (req, res) => {
        const { id } = req.params;
        const form = formidable();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                response(res, 404, { error: 'Something went wrong' })
            } else {
                let { name } = fields;
                let { image } = files;
                name = name.trim();
                const slug = await this.generateSlug(name, id);
                cloudinary.config({
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    api_secret: process.env.CLOUDINARY_SECRET_KEY,
                    secure: true
                });
                try {
                    if (image) {
                        const result = await cloudinary.uploader.upload(image.filepath,
                            { folder: 'categories' }
                        );

                        if (result) {
                            const category = await categoryModel.findByIdAndUpdate(id, {
                                name, slug, image: result.url
                            }, { new: true });
                            if (category) {
                                response(res, 201, { category, message: 'Category Updated Successfully' })
                            } else {
                                response(res, 404, { error: 'Error Updating Category' });
                            }
                        } else {
                            response(res, 404, { error: 'Error Uploading Image' });
                        }
                    } else {

                        const category = await categoryModel.findByIdAndUpdate(id, {
                            name, slug
                        }, { new: true });
                        if (category) {
                            response(res, 201, { category, message: 'Category Updated Successfully' })
                        } else {
                            response(res, 404, { error: 'Error Updating Category' });
                        }

                    }
                } catch (error) {
                    console.error(error);
                    response(res, 500, { error: 'Internal Server Error' });
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
            response(res, 500, { error: 'Internal Server Error' });
        }
    }
    deleteCategory = async (req, res) => {
        try {
            const { id } = req.params;
            const deleteCategory = await categoryModel.findByIdAndDelete(id);
            const totalCategories = await categoryModel.find().countDocuments();
            if (!deleteCategory) {
                response(res, 404, { error: 'Category not found' });
            }
            response(res, 200, { message: 'Category Deleted Successfully', id, totalCategories });
        } catch (error) {
            console.log(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    }
}
module.exports = new categoryController();