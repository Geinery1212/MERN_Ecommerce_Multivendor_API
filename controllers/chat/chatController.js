const { response } = require("../../utilities/response");
const sellerModel = require("../../models/sellerModel");
const userModel = require("../../models/customerModel");
const customerModel = require("../../models/customerModel");
const sellerCustomerModel = require("../../models/chat/sellerCustomerModel");
const sellerCustomerMessage = require('../../models/chat/sellerCustomerMsg');
class chatController {
    addNewFriendSeller = async (req, res) => {
        try {
            const { sellerId, userId } = req.body;

            if (sellerId) {  //null/undefined check
                const seller = await sellerModel.findById(sellerId);
                const user = await customerModel.findById(userId);

                // Check if the seller is already a friend of the user
                const checkSeller = await sellerCustomerModel.findOne({
                    myId: userId,
                    'myFriends.fdId': sellerId
                });

                if (!checkSeller) {
                    await sellerCustomerModel.updateOne({
                        myId: userId,
                    }, {
                        $addToSet: {  // Use $addToSet to avoid duplicate entries
                            myFriends: {
                                fdId: sellerId,
                                name: seller.shopInfo?.shopName,
                                image: seller.image
                            }
                        }
                    });
                }

                // Check if the customer is already a friend of the seller
                const checkCustomer = await sellerCustomerModel.findOne({
                    myId: sellerId,
                    'myFriends.fdId': userId
                });

                if (!checkCustomer) {
                    await sellerCustomerModel.updateOne({
                        myId: sellerId,
                    }, {
                        $addToSet: {  // Use $addToSet to avoid duplicate entries
                            myFriends: {
                                fdId: userId,
                                name: user.name,
                                image: user.image || ""  // Use the user's image if available
                            }
                        }
                    });
                }

                const messages = await sellerCustomerMessage.find({
                    $or: [
                        {
                            $and: [{ receiverId: sellerId }, { senderId: userId }]
                        },
                        {
                            $and: [{ receiverId: userId }, { senderId: sellerId }]
                        }
                    ]
                });

                const MyFriends = await sellerCustomerModel.findOne({ myId: userId });
                const currentFriend = MyFriends.myFriends.find(s => s.fdId === sellerId);
                response(res, 200, {
                    myFriends: MyFriends.myFriends,
                    currentFriend,
                    messages
                });
            } else {
                const MyFriends = await sellerCustomerModel.findOne({ myId: userId });
                response(res, 200, {
                    myFriends: MyFriends.myFriends
                });
            }
        } catch (error) {
            console.error(error);
            response(res, 500, 'Internal Server Error');
        }
    };

    sendNewMessageCustomerToSeller = async (req, res) => {
        console.log(req.body);
        try {
            req.body.userId = req.id;
            const { userId, newMessageText, sellerId, name } = req.body;
            const message = await sellerCustomerMessage.create({
                'senderName': name,
                'senderId': userId,
                'receiverId': sellerId,
                'message': newMessageText
            });

            //Show the most recent chat //customer
            let data = await sellerCustomerModel.findOne({ 'myId': userId });
            let myFriends = data.myFriends;
            let indexCurrrentFriend = myFriends.findIndex(f => f.fdId === sellerId);

            while (indexCurrrentFriend > 0) {
                let temp = myFriends[indexCurrrentFriend];
                myFriends[indexCurrrentFriend] = myFriends[indexCurrrentFriend - 1];
                myFriends[indexCurrrentFriend - 1] = temp;
                indexCurrrentFriend--;
            }
            await sellerCustomerModel.findOneAndUpdate({ 'myId': userId }, {
                myFriends
            });

            //Show the most recent chat //seller
            let data2 = await sellerCustomerModel.findOne({ 'myId': sellerId });
            let myFriends2 = data2.myFriends;
            let indexCurrrentFriend2 = myFriends.findIndex(f => f.fdId === userId);

            while (indexCurrrentFriend2 > 0) {
                let temp = myFriends2[indexCurrrentFriend2];
                myFriends2[indexCurrrentFriend2] = myFriends2[indexCurrrentFriend2 - 1];
                myFriends2[indexCurrrentFriend2 - 1] = temp;
                indexCurrrentFriend2--;
            }
            await sellerCustomerModel.findOneAndUpdate({ 'myId': sellerId }, {
                'myFriends': myFriends2
            });
            response(res, 200, { message, myFriends });
        } catch (error) {
            console.error(error);
            response(res, 500, 'Internal Server Error');
        }
    }
    sendNewMessageSellerToCustomer = async (req, res) => {   
        // console.log(req.body);     
        try {
            req.body.sellerId = req.id;
            const { customerId, newMessageText, sellerId, name } = req.body;
            const message = await sellerCustomerMessage.create({
                'senderName': name,
                'senderId': sellerId,
                'receiverId': customerId,
                'message': newMessageText
            });

            //Show the most recent chat //customer
            let data = await sellerCustomerModel.findOne({ 'myId': customerId });
            let myFriends = data.myFriends;
            let indexCurrrentFriend = myFriends.findIndex(f => f.fdId === sellerId);

            while (indexCurrrentFriend > 0) {
                let temp = myFriends[indexCurrrentFriend];
                myFriends[indexCurrrentFriend] = myFriends[indexCurrrentFriend - 1];
                myFriends[indexCurrrentFriend - 1] = temp;
                indexCurrrentFriend--;
            }
            await sellerCustomerModel.findOneAndUpdate({ 'myId': customerId }, {
                myFriends
            });

            //Show the most recent chat //seller
            let data2 = await sellerCustomerModel.findOne({ 'myId': sellerId });
            let myFriends2 = data2.myFriends;
            let indexCurrrentFriend2 = myFriends.findIndex(f => f.fdId === customerId);

            while (indexCurrrentFriend2 > 0) {
                let temp = myFriends2[indexCurrrentFriend2];
                myFriends2[indexCurrrentFriend2] = myFriends2[indexCurrrentFriend2 - 1];
                myFriends2[indexCurrrentFriend2 - 1] = temp;
                indexCurrrentFriend2--;
            }
            await sellerCustomerModel.findOneAndUpdate({ 'myId': sellerId }, {
                'myFriends': myFriends2
            });
            response(res, 200, { message, 'myFriends': myFriends2 });
        } catch (error) {
            console.error(error);
            response(res, 500, 'Internal Server Error');
        }
        
    }
    getCustomerFriends = async (req, res) => {
        const {sellerId, customerId} = req.params;        
        try {            

            if (customerId) {  //null/undefined check    
                const messages = await sellerCustomerMessage.find({
                    $or: [
                        {
                            $and: [{ receiverId: sellerId }, { senderId: customerId }]
                        },
                        {
                            $and: [{ receiverId: customerId }, { senderId: sellerId }]
                        }
                    ]
                });

                const MyFriends = await sellerCustomerModel.findOne({ myId: sellerId });
                const currentFriend = MyFriends.myFriends.find(s => s.fdId === customerId);
                response(res, 200, {
                    myFriends: MyFriends.myFriends,
                    currentFriend,
                    messages
                });
            } else {
                const MyFriends = await sellerCustomerModel.findOne({ myId: sellerId });
                response(res, 200, {
                    myFriends: MyFriends.myFriends
                });
            }
        } catch (error) {
            console.error(error);
            response(res, 500, 'Internal Server Error');
        }
                
    }
}
module.exports = new chatController();