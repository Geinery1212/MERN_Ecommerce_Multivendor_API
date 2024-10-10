const { Schema, model } = require('mongoose');

const adminSellerSchema = new Schema({
    myId: {
        type: String,
        required: true
    },
    myFriends: {
        type: Array,
        required: []
    }, 
    
}, {timestamps: true});
module.exports = model('admin_sellers', adminSellerSchema);