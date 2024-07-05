const adminModel = require('../models/adminModel');
const { response } = require('../utilities/response');
const bcrypt = require('bcrypt');
const { createToken } = require('../utilities/token');

class authControllers {
    admin_login = async (req, res) => {
        const { email, password } = req.body;
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
                response(res, 404, { error: "Email not found" });
            }
        } catch (error) {
            response(res, 500, { error: error.message });
        }
    }
    getUser = async (req, res) => {
        const { id, role } = req;
        try {
            if(role == 'admin'){
                const user = await adminModel.findById(id);
                response(res,200, {userInfo: user});
            }else{
                console.log("it is not admin");

            }
        } catch (error) {

        }
    }
}
module.exports = new authControllers();