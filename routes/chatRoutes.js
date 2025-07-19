const express = require('express');
const router = express.Router();

const {
    createChat,
    sendMessage,
    getChats,
    getChatMessages,
    stopMessage
}= require('../controllers/chatController');

    router.post('/chat',createChat);
    router.post('/chat/:chatId/message',sendMessage);
    router.post('/chat/:chatId/stop',stopMessage);
    router.get('/chats',getChats);
    router.get('/chat/:chatId/messages',getChatMessages);

module.exports = router;