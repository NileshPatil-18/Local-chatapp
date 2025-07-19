const pool = require('../db');
const axios = require('axios');

exports.sendMessage = async(req, res)=>{
    try {
        const {chat_id,content} = req.body;

        const userMessage = await pool.query(
            'INSERT INTO messages(chat_id,role,content) VALUES($1,$2,$3)RETURNING *',
            [chat_id,'user',content]
        );

        const previousMessages = await pool.query(
            'SELECT role, content FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
            [chat_id] 
        );

        const formattedMessages = previousMessages.rows.map(msg => ({
            role: msg.role,
            content: msg.content
        })); 

        const ollamaResponse = await axios.post(
            `${process.env.OLLAMA_URL}`,
            {
                model: 'gemma:1b',
                stream: false,
                messages: formattedMessages
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
            );

        const assistantContent = ollamaResponse.data.message.content;
        
        const assistantMessage = await pool.query(
            'INSERT INTO messages(chat_id, role, content) VALUES ($1, $2, $3) RETURNING *',
            [chat_id, 'assistant', assistantContent]
            );

            // 6. Return both messages
            res.json({
            user: userMessage.rows[0],
            assistant: assistantMessage.rows[0]
            });
        
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).send('server error');
        
    }
}