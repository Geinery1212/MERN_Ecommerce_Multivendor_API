const stripeModel = require('../../models/stripeModel');
const sellerModel = require('../../models/sellerModel');
const { v4: uuidv4 } = require('uuid');
const { response } = require('../../utilities/response');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const sellerWallet = require('../../models/sellerWallet');
const withdrawRequestModel = require('../../models/withdrawRequestModel');
const { Types } = require('mongoose');
const { ObjectId } = Types;

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
    getSellerPaymentDetails = async (req, res) => {
        try {
            const sellerId = req.id;
            const payments = await sellerWallet.find({ sellerId });
            const pendingWithdraws = await withdrawRequestModel.find({
                $and: [
                    {
                        sellerId: {
                            $eq: sellerId
                        }
                    },
                    {
                        status: {
                            $eq: 'pending'
                        }
                    }
                ]
            });

            const successWithdraws = await withdrawRequestModel.find({
                $and: [
                    {
                        sellerId: {
                            $eq: sellerId
                        }
                    },
                    {
                        status: {
                            $eq: 'success'
                        }
                    }
                ]
            });

            const pendingAmount = this.sumAmount(pendingWithdraws);
            const amountWithdrawn = this.sumAmount(successWithdraws);
            const totalAmount = this.sumAmount(payments);

            let availableAmount = 0;

            if (totalAmount > 0) {
                availableAmount = totalAmount - (pendingAmount + amountWithdrawn)
            }


            response(res, 200, {
                totalAmount,
                pendingAmount,
                amountWithdrawn,
                availableAmount,
                pendingWithdraws,
                successWithdraws
            });


        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    }
    sumAmount = (data) => {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum = sum + data[i].amount;
        }
        return sum
    }
    sendWithdrawalRequestSeller = async (req, res) => {
        try {
            const sellerId = req.id;
            const { amount } = req.body;

            const withdrawal = await withdrawRequestModel.create({
                sellerId,
                amount: parseInt(amount)
            });

            response(res, 200, { withdrawal, message: 'Withdrawal Request Send' });
        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    }
    getPaymentRequests = async (req, res) => {
        try {
            if (req.role !== 'admin') {
                return response(res, 403, { error: 'Unauthorized' });
            }
            const pendingWithdraws = await withdrawRequestModel.find({
                $and: [
                    {
                        status: {
                            $eq: 'pending'
                        }
                    }
                ]
            });

            response(res, 200, { pendingWithdraws });
        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    }

    confirmPaymentRequest = async (req, res) => {
        try {
            if (req.role !== 'admin') {
                return response(res, 403, { error: 'Unauthorized' });
            }
            const { paymentId } = req.body;            
            const payment = await withdrawRequestModel.findById(paymentId)
            const { stripeId } = await stripeModel.findOne({
                sellerId: new ObjectId(`${payment.sellerId}`)
            })            
            const balance = await stripe.balance.retrieve();            

            await stripe.transfers.create({
                amount: payment.amount,
                currency: 'usd',
                destination: stripeId
            });

            await withdrawRequestModel.findByIdAndUpdate(paymentId, { status: 'success' });
            response(res, 200, { payment, message: 'Request Confirm Success' });
        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    }
}
module.exports = new paymentController();