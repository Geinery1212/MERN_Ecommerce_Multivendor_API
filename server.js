require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { dbConnect } = require('./utilities/db');
const port = process.env.PORT;
const socket = require('socket.io');
const http = require('http');
const { userInfo } = require('os');
const server = http.createServer(app);
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 204 // For legacy browsers (some versions of IE) to avoid CORS errors
};
app.use(cors(corsOptions));
const io = socket(server, {
    cors: {
        origin: "*",
        credentials: true
    }
});
var allCustomers = [];
const addUser = (socketId, userInfo) => {
    const check = allCustomers.some(u => u.customerId === userInfo.id);
    if (!check) {
        allCustomers.push({
            'customerId': userInfo.id,
            socketId,
            userInfo
        });
    }
}

var allSellers = [];
const addSeller = (socketId, userInfo) => {
    const check = allSellers.some(u => u.sellerId === userInfo._id);
    if (!check) {
        allSellers.push({
            'sellerId': userInfo._id,
            socketId,
            userInfo
        });
    }
}

const findCustomer = async (customerId) => {
    return allCustomers.find(c => c.customerId === customerId)
}
const removeSeller = (socketId) => {
    allSellers = allSellers.filter(c => c.socketId !== socketId);
}

io.on('connection', (soc) => {
    // console.log('Socket is running');
    soc.on('add_user', (userInfo) => {
        addUser(soc.id, userInfo);
        io.emit('activeSellers', allSellers);
    });
    soc.on('add_seller', (userInfo) => {
        addSeller(soc.id, userInfo);
        io.emit('activeSellers', allSellers);
    });
    soc.on('send_seller_message',async (msg) => {
        const customer = await findCustomer(msg.receiverId);
        // console.log('we are inside send seller messsage', customer, msg.receiverId)
        // console.log(allCustomers)
        console.log(customer);
        if (customer) {
            console.log(customer);
            soc.to(customer.socketId).emit('seller_message', msg)
        }
    });    
    soc.on('disconnect', () => {
        // removeSeller(soc.id);
        io.emit('activeSellers', allSellers);
    });
});

app.use(cookieParser());
app.use(bodyParser.json()); // Parse incoming JSON payloads
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
//Connect database
dbConnect();
//Add routes
app.use('/api', require('./routes/dashboard/authRoutes'));
app.use('/api', require('./routes/dashboard/categoryRoutes'));
app.use('/api', require('./routes/dashboard/productRoutes'));
app.use('/api', require('./routes/dashboard/sellerRoutes'));
app.use('/api/customer', require('./routes/customer/homeRoutes'));
app.use('/api/customer', require('./routes/customer/authRoutes'));
app.use('/api/customer', require('./routes/customer/cartRoutes'));
app.use('/api/customer', require('./routes/customer/orderRoutes'));
app.use('/api/customer', require('./routes/customer/dashboardRoutes'));
app.use('/api/customer', require('./routes/customer/wishlistRoutes'));
app.use('/api/customer', require('./routes/customer/productRoutes'));
app.use('/api/chat', require('./routes/chat/chatRoutes'));
//Initialize the port and listen
server.listen(port, () => console.log(`Server is running on port ${port}`));