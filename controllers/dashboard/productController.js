const formidable = require('formidable');
const cloudinary = require('cloudinary').v2;
const { response } = require('../../utilities/response');
const productModel = require('../../models/productModel');

class productController {
    add = async (req, res) => {
        const form = formidable({ multiples: true });

        form.parse(req, async (err, fields, files) => {
            const { id } = req;
            if (err) {
                response(res, 400, { error: 'Something went wrong' })
            } else {
                let {
                    name, description, discount, price, brand,
                    stock, shopName, category
                } = fields;
                console.log(files);
                let { images } = files;
                name = name.trim();
                let slug = name.split(' ').join('-');
                cloudinary.config({
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    api_secret: process.env.CLOUDINARY_SECRET_KEY,
                    secure: true
                });
                try {
                    let allUrlImages = [];
                    if (images) {
                        if (!Array.isArray(images)) {
                            images = [images]
                        }
                    }
                    for (let index = 0; index < images.length; index++) {
                        const result = await cloudinary.uploader.upload(images[index].filepath,
                            { folder: 'products' }
                        );
                        if (result) {
                            allUrlImages = [...allUrlImages, result.url];
                        }
                    }

                    await productModel.create({
                        sellerId: id,
                        name: name,
                        brand: brand,
                        slug: slug,
                        shopName: shopName,
                        category: category.trim(),
                        description: description.trim(),
                        stock: parseInt(stock),
                        price: parseInt(price),
                        discount: parseInt(discount),
                        images: allUrlImages
                    });
                    response(res, 201, { category, message: 'Product Added Successfully' })
                } catch (error) {
                    console.error(error);
                    response(res, 500, { error: 'Internal Servel Error' });
                }
            }
        })
    }

    getAll = async (req, res) => {
        const { page, perPage, searchValue } = req.query;
        const sellerId = req.id;
        let skipPage = '';
        try {
            if (page && perPage) {
                skipPage = parseInt(perPage) * (parseInt(page) - 1);
            }
            if (searchValue && page && searchValue) {
                const products = await productModel.find({
                    $text: { $search: searchValue }, sellerId: sellerId
                }).skip(skipPage).limit(perPage).sort({ createdAt: -1 });

                const totalProducts = await productModel.find({
                    $text: { $search: searchValue }, sellerId: sellerId
                }).countDocuments();

                response(res, 200, { products, totalProducts });
            } else if (searchValue === '' && page && perPage) {
                const products = await productModel.find({ sellerId: sellerId }).skip(skipPage).limit(perPage).sort({ createdAt: -1 });

                const totalProducts = await productModel.find({ sellerId: sellerId }).countDocuments();

                response(res, 200, { products, totalProducts });
            } else {
                const products = await productModel.find({ sellerId: sellerId }).sort({ createdAt: -1 });

                const totalProducts = await productModel.find({ sellerId: sellerId }).countDocuments();

                response(res, 200, { products, totalProducts });
            }
        } catch (error) {
            console.log(error);
            response(res, 500, { error: 'Internal Servel Error' });
        }
    }
    getProduct = async (req, res) => {
        const { productId } = req.params;
        try {
            const product = await productModel.findById(productId);
            if (product) {
                response(res, 200, { product });
            } else {
                response(res, 404, { error: 'Product Not Found' });
            }
        } catch (error) {
            console.log(error);
            response(res, 500, { error: 'Internal Servel Error' });
        }
    }
    update = async (req, res) => {
        try {
            let {
                name, description, discount, price, brand,
                stock, category, productId
            } = req.body;
            name = name.trim();
            let slug = name.split(' ').join('-');
            await productModel.findByIdAndUpdate(productId, {
                name, description, discount, price, brand,
                stock, slug, category
            });
            const product = await productModel.findById(productId);
            response(res, 200, { product, message: 'Product Updated Successfully' });


        } catch (error) {
            console.log(error);
            response(res, 500, { error: 'Internal Servel Error' });

        }
    }

    updateImage = async (req, res) => {
        try {
            const form = formidable({ multiples: true });

            form.parse(req, async (err, fields, files) => {
                // console.log(fields);
                // console.log(files);
                if (err) {
                    response(res, 400, { error: 'Something went wrong' })
                } else {
                    let { oldImage, productId } = fields;
                    let { newImage } = files;
                    cloudinary.config({
                        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                        api_key: process.env.CLOUDINARY_API_KEY,
                        api_secret: process.env.CLOUDINARY_SECRET_KEY,
                        secure: true
                    });
                    const result = await cloudinary.uploader.upload(newImage.filepath,
                        { folder: 'products' }
                    );

                    if (result) {
                        let { images } = await productModel.findById(productId);
                        let index = images.findIndex(img => img === oldImage);
                        images[index] = result.url;
                        await productModel.findByIdAndUpdate(productId, { images });

                        const product = await productModel.findById(productId);
                        response(res, 200, { product, message: 'Product Image Updated' });
                    } else {
                        response(res, 404, { error: 'Image Upload Fails' });
                    }
                }
            })


        } catch (error) {
            console.log(error);
            response(res, 500, { error: 'Internal Servel Error' });

        }
    }
}
module.exports = new productController();