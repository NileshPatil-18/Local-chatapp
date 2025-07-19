const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

app.use(express.json());
const dotenv = require('dotenv');
 dotenv.config();

const chatRoutes = require('./routes/chatRoutes');
app.use('/api/',chatRoutes);

// const messageRoutes = require('./routes/messageRoutes');
// app.use('/api/', messageRoutes);



const PORT = process.env.PORT || 5000;

app.listen(PORT,()=> console.log(`server running on port ${PORT}`));