const { Schema, model } = require('mongoose');

const sellerAdminMsgSchema = new Schema({
    senderName: {
        type: String,
        required: true
    },
    senderId: {
        type: String,
        required: true
    },      
    receiverId: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },  
    status: {
        type: String,
        default: 'unseen'
    },
}, {timestamps: true});
module.exports = model('seller_admin_msgs', sellerAdminMsgSchema);