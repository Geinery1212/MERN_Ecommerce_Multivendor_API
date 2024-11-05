const stripeModel = require('../../models/stripeModel');
const sellerModel = require('../../models/sellerModel');
const { v4: uuidv4 } = require('uuid');
const { response } = require('../../utilities/response');
const stripe = require('stripe')(process.env.STRIPE_KEY);

class paymentController {
    createStripeConnectAccount = async (req, res) => {
        const { id } = req;
        const uid = uuidv4();
        try {
            const stripeInfo = await stripeModel.findOne({ sellerId: id });
            if (stripeInfo) {
                await stripeModel.deleteOne({ sellerId: id });
                const account = await stripe.accounts.create({ type: 'express' })
                const accountLink = await stripe.accountLinks.create({
                    account: account.id,
                    refresh_url: `${process.env.BASE_URL_SELLER_SIDE}/refresh`,
                    return_url: `${process.env.BASE_URL_SELLER_SIDE}/success?activeCode=${uid}`,
                    type: 'account_onboarding'
                });

                await stripeModel.create({
                    sellerId: id,
                    stripeId: account.id,
                    code: uid
                });
                response(res, 201, { url: accountLink.url });
            } else {
                const account = await stripe.accounts.create({ type: 'express' });
                const accountLink = await stripe.accountLinks.create({
                    account: account.id,
                    refresh_url: `${process.env.BASE_URL_SELLER_SIDE}/refresh`,
                    return_url: `${process.env.BASE_URL_SELLER_SIDE}/success?activeCode=${uid}`,
                    type: 'account_onboarding'
                });
                await stripeModel.create({
                    sellerId: id,
                    stripeId: account.id,
                    code: uid
                });
                response(res, 201, { url: accountLink.url });
            }

        } catch (error) {
            console.error('Stripe connect account error: ' + error.message);
            response(res, 500, { error: 'Internal Server Error' });
        }
    }

    activeStripeConnectAccount = async (req, res) => {
        try {
            const { activeCode } = req.params;
            const id = req.id;
            const userStripeInfo = await stripeModel.findOne({ code: activeCode })
            if (userStripeInfo) {
                await sellerModel.findByIdAndUpdate(id, {
                    payment: 'active'
                })
                response(res, 200, { message: 'payment Active' });
            } else {
                response(res, 404, { error: 'payment Active Fails' });
            }

        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    }

    createPaymentOrder = async (req, res) => {
        const { totalPrice } = req.body
        try {
            // console.log("This is the total price: ", totalPrice);
            const payment = await stripe.paymentIntents.create({
                amount: totalPrice,
                currency: 'usd',
                automatic_payment_methods: {
                    enabled: true
                }
            });
            // console.log('clientSecret', payment)
            response(res, 200, { clientSecret: payment.client_secret })
        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    }
}
module.exports = new paymentController();