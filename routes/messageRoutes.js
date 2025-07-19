const express = require('express');
const router = express.Router();
const { sendMessage } = require('../controllers/messageController');

router.post('/messages', sendMessage);

module.exports = router;
