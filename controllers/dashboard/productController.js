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
                response(res, 404, { error: 'Something went wrong' })
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
}
module.exports = new productController();