const adminModel = require('../../models/adminModel');
const sellerModel = require('../../models/sellerModel');
const sellerCustomerModel = require('../../models/chat/sellerCustomerModel');
const { response } = require('../../utilities/response');
const bcrypt = require('bcrypt');
const { createToken } = require('../../utilities/token');
const formidable = require('formidable');
const cloudinary = require('cloudinary').v2;

class authController {
    adminLogin = async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return response(res, 400, { error: 'Email and Password are Required' });
        }
        try {
            const admin = await adminModel.findOne({ email: email }).select('+password');
            if (admin) {
                const match = await bcrypt.compare(password, admin.password);
                if (match) {
                    const token = await createToken({
                        id: admin.id,
                        role: admin.role
                    });
                    res.cookie('accessToken', token, {
                        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    });
                    response(res, 200, { token, message: "Login Success" });

                } else {
                    response(res, 404, { error: "Password Wrong" });
                }
            } else {
                response(res, 404, { error: "Email not Found" });
            }
        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    };
    getUserInfo = async (req, res) => {
        const { id, role } = req;
        try {
            if (role == 'admin') {
                const user = await adminModel.findById(id);
                response(res, 200, { userInfo: user });
            } else if (role == 'seller') {
                const user = await sellerModel.findById(id);
                response(res, 200, { userInfo: user });
            }
        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    };
    sellerRegister = async (req, res) => {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return response(res, 400, { error: 'Name, email, and password are required' });
        }

        try {
            // Check if the email is already registered
            const existingUser = await sellerModel.findOne({ email });
            if (existingUser) {
                return response(res, 404, { error: 'Email Already Registered' });
            }

            // Create new seller
            const hashedPassword = await bcrypt.hash(password, 10);
            const seller = await sellerModel.create({
                name,
                email,
                password: hashedPassword,
                method: 'manually',
                shopInfo: {}
            });

            // Create related customer record, for the chat
            await sellerCustomerModel.create({ myId: seller._id });

            // Generate authentication token
            const token = await createToken({ id: seller._id });

            // Set token as a cookie
            res.cookie('accessToken', token, {
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
                // httpOnly: true, // Secure cookie
                // sameSite: 'strict' // CSRF protection
            });

            response(res, 201, { token, message: "Register Success" });

        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    };
    sellerLogin = async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return response(res, 400, { error: 'Email and Password are Required' });
        }
        try {
            const seller = await sellerModel.findOne({ email: email }).select('+password');
            if (seller) {
                const match = await bcrypt.compare(password, seller.password);
                if (match) {
                    const token = await createToken({
                        id: seller._id,
                        role: seller.role
                    });
                    res.cookie('accessToken', token, {
                        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    });
                    response(res, 200, { token, message: "Login Success" });

                } else {
                    response(res, 404, { error: "Password Wrong" });
                }
            } else {
                response(res, 404, { error: "Email not Found" });
            }
        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    };
    profileImageUpload = async (req, res) => {
        try {
            const { id } = req;
            const form = formidable({ multiples: true });

            form.parse(req, async (err, fields, files) => {
                // console.log(fields);
                // console.log(files);
                if (err) {
                    response(res, 400, { error: 'Something went wrong' })
                } else {
                    let { image } = files;
                    cloudinary.config({
                        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                        api_key: process.env.CLOUDINARY_API_KEY,
                        api_secret: process.env.CLOUDINARY_SECRET_KEY,
                        secure: true
                    });
                    const result = await cloudinary.uploader.upload(image.filepath,
                        { folder: 'profile' }
                    );

                    if (result) {
                        await sellerModel.findByIdAndUpdate(id, {
                            image: result.url
                        });
                        const userInfo = await sellerModel.findById(id);
                        response(res, 201, { userInfo, message: 'Profile Image Uploaded' });
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

    addShopData = async (req, res) => {
        try {
            const { shopName, state, district, subdistrict } = req.body;
            const { id } = req;
            await sellerModel.findByIdAndUpdate(id, { shopInfo: { shopName, state, district, subdistrict } });
            const userInfo = await sellerModel.findById(id);
            response(res, 200, { userInfo, message: 'Shop Info Added Successfully' });

        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    };

    logout = async (req, res) => {
        try {
            res.cookie('accessToken', null, {
                expires: new Date(Date.now())
            })
            response(res, 200, { message: 'Logout Success' });
        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    };
}
module.exports = new authController();