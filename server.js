require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { dbConnect } = require('./utilities/db');
const port = process.env.PORT;

app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
//Connect database
dbConnect();
//Add routes
app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/dashboard/categoryRoutes'));
//Initialize the port and listen
app.listen(port, () => console.log(`Server is running on port ${port}`));