const { Schema, model } = require('mongoose');

const sellerCustomerSchema = new Schema({
    myId: {
        type: String,
        required: true
    },
    myFriends: {
        type: Array,
        required: []
    }, 
    
}, {timestamps: true});
module.exports = model('seller_customers', sellerCustomerSchema);