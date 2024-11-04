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
var allSellers = [];
var allAdmins = [];
const addCustomer = (socketId, userInfo) => {    
    const check = allCustomers.some(u => u.customerId === userInfo.id);
    if (!check) {
        allCustomers.push({
            'customerId': userInfo.id,
            socketId,
            userInfo
        });
    }
}

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

const addAdmin = (socketId, userInfo) => {
    const check = allSellers.some(u => u.adminId === userInfo._id);
    if (!check) {
        allAdmins.push({
            'adminId': userInfo._id,
            socketId,
            userInfo
        });
    }    
}

const findCustomer = async (customerId) => {
    return allCustomers.find(c => c.customerId === customerId)
}
const findSeller = async (sellerId) => {
    return allSellers.find(c => c.sellerId === sellerId)
}

const findAdmin = async (adminId) => {
    return allAdmins.find(c => c.adminId === adminId)
}
const removeUsers = (socketId) => {
    allSellers = allSellers.filter(c => c.socketId !== socketId);
    allCustomers = allCustomers.filter(c => c.socketId !== socketId);
    allAdmins = allAdmins.filter(c => c.socketId !== socketId);
}

io.on('connection', (soc) => {
    // console.log('Socket is running');
    soc.on('add_customer', (userInfo) => {        
        addCustomer(soc.id, userInfo);
        io.emit('activeCustomers', allCustomers);
        io.emit('activeSellers', allSellers);
    });
    soc.on('add_seller', (userInfo) => {
        addSeller(soc.id, userInfo);
        io.emit('activeCustomers', allCustomers);
        io.emit('activeSellers', allSellers);        
        io.emit('activeAdmins', allAdmins);        
    });
    soc.on('add_admin', (userInfo) => {
        addAdmin(soc.id, userInfo);        
        io.emit('activeSellers', allSellers);  
        io.emit('activeAdmins', allAdmins);              
    });

    soc.on('send_seller_message', async (msg) => {    
        const customer = await findCustomer(msg.receiverId);
        const admin = await findAdmin(msg.receiverId);
        if (customer) {            
            // Emit message to the customer
            soc.to(customer.socketId).emit('seller_message', msg)
        }else if(admin){
            // Emit message to the admin
            soc.to(admin.socketId).emit('seller_message', msg)
        }
    });

    soc.on('send_customer_message', async (msg) => {
        const seller = await findSeller(msg.receiverId);        
        if (seller && msg) {            
            // Emit message to the seller
            soc.to(seller.socketId).emit('customer_message', msg)
        }
    });

    soc.on('send_admin_message', async (msg) => {
        const seller = await findSeller(msg.receiverId);        
        if (seller && msg) {            
            // Emit message to the seller
            soc.to(seller.socketId).emit('admin_message', msg)
        }
    });

    soc.on('disconnect', () => {
        removeUsers(soc.id);
        io.emit('activeCustomers', allCustomers);
        io.emit('activeSellers', allSellers);
        io.emit('activeAdmins', allAdmins);        
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
app.use('/api', require('./routes/dashboard/orderRoutes'));
app.use('/api/customer', require('./routes/customer/homeRoutes'));
app.use('/api/customer', require('./routes/customer/authRoutes'));
app.use('/api/customer', require('./routes/customer/cartRoutes'));
app.use('/api/customer', require('./routes/customer/orderRoutes'));
app.use('/api/customer', require('./routes/customer/dashboardRoutes'));
app.use('/api/customer', require('./routes/customer/wishlistRoutes'));
app.use('/api/customer', require('./routes/customer/productRoutes'));
app.use('/api/chat', require('./routes/chat/chatRoutes'));
app.use('/api/payment', require('./routes/payment/paymentRoutes'));
//Initialize the port and listen
server.listen(port, () => console.log(`Server is running on port ${port}`));