const mongoose = require('mongoose');
module.exports.dbConnect = async()=>{
    try {
        await mongoose.connect(process.env.DB_URL);
        console.info("Database is connected");
    } catch (error) {
        console.error(error.message);
    }
}