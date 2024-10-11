const customerModel = require('../../models/customerModel');
const sellerCustomerModel = require('../../models/chat/sellerCustomerModel');
const { response } = require('../../utilities/response');
const bcrypt = require('bcrypt');
const { createToken } = require('../../utilities/token');
const formidable = require('formidable');
const cloudinary = require('cloudinary').v2;

class authController {
    customerRegister = async (req, res) => {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return response(res, 400, { error: 'Name, email, and password are required' });
            }
            // Check if the email is already registered
            const existingUser = await customerModel.findOne({ email });
            if (existingUser) {
                return response(res, 404, { error: 'Email Already Registered' });
            }

            // Create new customer
            const hashedPassword = await bcrypt.hash(password, 10);
            const customer = await customerModel.create({
                name: name.trim(),
                email: email.trim(),
                password: hashedPassword,
                method: 'manually'
            });

            // Create related customer record, for the chat
            await sellerCustomerModel.create({ myId: customer._id });

            // Generate authentication token
            const token = await createToken({
                id: customer._id,
                name: customer.name,
                email: customer.email,
                method: customer.method,
                role: 'customer'
            });

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
    customerLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return response(res, 400, { error: 'Email and Password are Required' });
            }
            const customer = await customerModel.findOne({ email: email }).select('+password');
            if (customer) {
                const match = await bcrypt.compare(password, customer.password);
                if (match) {
                    const token = await createToken({
                        id: customer._id,
                        name: customer.name,
                        email: customer.email,
                        method: customer.method,
                        role: 'customer'
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
    customerLogout = async (req, res) => {
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