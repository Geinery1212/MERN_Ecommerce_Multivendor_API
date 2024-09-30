const { response } = require("../../utilities/response");
const sellerModel = require("../../models/sellerModel");
const userModel = require("../../models/customerModel");
const customerModel = require("../../models/customerModel");
const sellerCustomerModel = require("../../models/chat/sellerCustomerModel");
const sellerCustomerMessage = require('../../models/chat/sellerCustomerMsg');
class chatController {
    addNewFriendSeller = async (req, res) => {
        const session = await sellerCustomerModel.startSession();
        try {
            session.startTransaction();
            const { sellerId, userId } = req.body;
            if (sellerId != '') {                
                const seller = await sellerModel.findById(sellerId);
                const user = await customerModel.findById(userId);
                const checkSeller = await sellerCustomerModel.findOne({
                    myId: userId,
                    'myFriends.fdId': sellerId
                });
                if (!checkSeller) {                    
                    await sellerCustomerModel.updateOne({
                        myId: userId,

                    }, {
                        $push: {
                            myFriends: {
                                fdId: sellerId,
                                name: seller.shopInfo?.shopName,
                                image: seller.image
                            }
                        }
                    });
                }

                const checkCustomer = await sellerCustomerModel.findOne({
                    myId: sellerId,
                    'myFriends.fdId': userId
                });

                if (!checkCustomer) {
                    await sellerCustomerModel.updateOne({
                        myId: sellerId,

                    }, {
                        $push: {
                            myFriends: {
                                fdId: userId,
                                name: user.name,
                                image: ""
                            }
                        }
                    });
                }

                const messages = await sellerCustomerMessage.find({
                    $or: [
                        {
                            $and: [{
                                receverId: { $eq: sellerId }
                            }, {
                                senderId: {
                                    $eq: userId
                                }
                            }]
                        },
                        {
                            $and: [{
                                receverId: { $eq: userId }
                            }, {
                                senderId: {
                                    $eq: sellerId
                                }
                            }]
                        }
                    ]
                });

                const MyFriends = await sellerCustomerModel.findOne({
                    myId: userId
                });

                const currentFriend = MyFriends.myFriends.find(s => s.fdId === sellerId);
                await session.commitTransaction();
                response(res, 200, {
                    'myFriends': MyFriends.myFriends,
                    currentFriend,
                    messages
                });

            } else {
                const MyFriends = await sellerCustomerModel.findOne({
                    myId: userId
                });
                await session.commitTransaction();
                response(res, 200, {
                    MyFriends: MyFriends.myFriends
                });
            }
        } catch (error) {
            await session.abortTransaction();
            console.error(error);
            response(res, 500, 'Internal Server Error');
        }finally{
            session.endSession();
        }
    }
}
module.exports = new chatController();