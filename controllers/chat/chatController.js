const { response } = require("../../utilities/response");
const adminModel = require("../../models/adminModel");
const sellerModel = require("../../models/sellerModel");
const customerModel = require("../../models/customerModel");
const sellerCustomerModel = require("../../models/chat/sellerCustomerModel");
const sellerCustomerMessage = require('../../models/chat/sellerCustomerMsg');
const adminSellerModel = require("../../models/chat/adminSellerModel");
const sellerAdminMessage = require('../../models/chat/sellerAdminMsg');
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
            response(res, 500, { error: 'Internal Server Error' });
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
            response(res, 500, { error: 'Internal Server Error' });
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
            response(res, 500, { error: 'Internal Server Error' });
        }

    }
    getCustomerSellerFriends = async (req, res) => {
        const { sellerId, customerId } = req.params;
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
            response(res, 500, { error: 'Internal Server Error' });
        }

    }

    getSellerAdminFriends = async (req, res) => {
        const { adminId, sellerId } = req.params;
        try {
            if (sellerId) {  //null/undefined check    
                const messages = await sellerAdminMessage.find({
                    $or: [
                        {
                            $and: [{ receiverId: sellerId }, { senderId: adminId }]
                        },
                        {
                            $and: [{ receiverId: adminId }, { senderId: sellerId }]
                        }
                    ]
                });

                const allSellers = await sellerModel.find();
                let MyFriends = await adminSellerModel.findOne({ myId: adminId });
                if (!MyFriends) {
                    //if there is no friend, add them
                    let tempFriends = [];
                    for (let i = 0; allSellers.length > i; i++) {
                        let tempObj = {
                            'fdId': allSellers[i]._id.toString(),
                            'name': allSellers[i].name,
                            'image': allSellers[i].image,
                        }
                        tempFriends.push(tempObj);
                    }
                    await adminSellerModel.create({
                        myId: adminId,
                        'myFriends': tempFriends
                    });

                } else {
                    //Check if there is a new seller who is not a friend yet
                    let tempFriends = MyFriends.myFriends;
                    let update = false;
                    for (let i = 0; allSellers.length > i; i++) {
                        if (!(tempFriends.some((t) => t.fdId === allSellers[i]._id.toString()))) {
                            update = true;
                            tempFriends.push({
                                'fdId': allSellers[i]._id.toString(),
                                'name': allSellers[i].name,
                                'image': allSellers[i].image
                            });
                        }

                    }
                    if (update) {
                        await adminSellerModel.findByIdAndUpdate(adminId, {
                            'myFriends': tempFriends
                        });
                    }
                }
                MyFriends = await adminSellerModel.findOne({ myId: adminId });
                const currentFriend = MyFriends.myFriends.find(s => s.fdId === sellerId);
                response(res, 200, {
                    myFriends: MyFriends.myFriends,
                    currentFriend,
                    messages
                });
            } else {
                const allSellers = await sellerModel.find();
                let MyFriends = await adminSellerModel.findOne({ myId: adminId });
                if (!MyFriends) {
                    //if there is no friend, add them
                    let tempFriends = [];
                    for (let i = 0; allSellers.length > i; i++) {
                        let tempObj = {
                            'fdId': allSellers[i]._id.toString(),
                            'name': allSellers[i].name,
                            'image': allSellers[i].image,
                        }
                        tempFriends.push(tempObj);
                    }
                    await adminSellerModel.create({
                        myId: adminId,
                        'myFriends': tempFriends
                    });

                } else {
                    //Check if there is a new seller who is not a friend yet
                    let tempFriends = MyFriends.myFriends;
                    let update = false;
                    for (let i = 0; allSellers.length > i; i++) {
                        if (!(tempFriends.some((t) => t.fdId === allSellers[i]._id.toString()))) {
                            update = true;
                            tempFriends.push({
                                'fdId': allSellers[i]._id.toString(),
                                'name': allSellers[i].name,
                                'image': allSellers[i].image
                            });
                        }

                    }
                    if (update) {
                        await adminSellerModel.findByIdAndUpdate(adminId, {
                            'myFriends': tempFriends
                        });
                    }
                }
                MyFriends = await adminSellerModel.findOne({ myId: adminId });
                response(res, 200, {
                    myFriends: MyFriends.myFriends
                });
            }
        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }

    }

    sendNewMessageSellerToAdmin = async (req, res) => {
        try {
            const admins = await adminModel.find();
            req.body.adminId = admins[0]._id;
            req.body.sellerId = req.id;
            const { sellerId, newMessageText, adminId, name } = req.body;
            const message = await sellerAdminMessage.create({
                'senderName': name,
                'senderId': sellerId,
                'receiverId': adminId,
                'message': newMessageText
            });

            //Show the most recent chat //admin
            let data = await adminSellerModel.findOne({ 'myId': adminId });
            let myFriends = data.myFriends;
            let indexCurrrentFriend = myFriends.findIndex(f => f.fdId === sellerId);

            while (indexCurrrentFriend > 0) {
                let temp = myFriends[indexCurrrentFriend];
                myFriends[indexCurrrentFriend] = myFriends[indexCurrrentFriend - 1];
                myFriends[indexCurrrentFriend - 1] = temp;
                indexCurrrentFriend--;
            }
            await adminSellerModel.findOneAndUpdate({ 'myId': adminId }, {
                'myFriends': myFriends
            });
            response(res, 200, { message, myFriends });
        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    }

    getMessagesSellerToAdmin = async (req, res) => {
        try {
            const admins = await adminModel.find();
            const adminId = admins[0]._id;
            const sellerId = req.id;
            const messages = await sellerAdminMessage.find({
                $or: [
                    {
                        $and: [{ receiverId: sellerId }, { senderId: adminId }]
                    },
                    {
                        $and: [{ receiverId: adminId }, { senderId: sellerId }]
                    }
                ]
            });
            const currentFriend = {
                'fdId': admins[0]._id.toString(),
                'name': admins[0].name,
                'image': admins[0].image,
            }
            response(res, 200, {
                currentFriend,
                messages
            });
        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    }

    sendNewMessageAdminToSeller = async (req, res) => {
        try {
            req.body.adminId = req.id;
            const { sellerId, newMessageText, adminId, name } = req.body;
            const message = await sellerAdminMessage.create({
                'senderName': name,
                'senderId': adminId,
                'receiverId': sellerId,
                'message': newMessageText
            });

            //Show the most recent chat //admin
            let data = await adminSellerModel.findOne({ 'myId': adminId });
            let myFriends = data.myFriends;
            let indexCurrrentFriend = myFriends.findIndex(f => f.fdId === sellerId);

            while (indexCurrrentFriend > 0) {
                let temp = myFriends[indexCurrrentFriend];
                myFriends[indexCurrrentFriend] = myFriends[indexCurrrentFriend - 1];
                myFriends[indexCurrrentFriend - 1] = temp;
                indexCurrrentFriend--;
            }
            await adminSellerModel.findOneAndUpdate({ 'myId': adminId }, {
                'myFriends': myFriends
            });
            response(res, 200, { message, myFriends });
        } catch (error) {
            console.error(error);
            response(res, 500, { error: 'Internal Server Error' });
        }
    }
}
module.exports = new chatController();