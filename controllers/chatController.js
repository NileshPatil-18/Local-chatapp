const pool = require('../db');
const axios = require('axios');
const { setStreamController, abortStream } = require('../streams/streamManager');

exports.createChat = async(req, res)=>{
    try{
        const {title} = req.body;
        console.log('Incoming chat title:', title);

        //  const chatTitle = title && title.trim() ? title : 'New Chat';

        const result = await pool.query(
            'INSERT INTO chats(title) VALUES ($1) RETURNING *',
            [title || 'New Chat'],
            

        );
        res.json(result.rows[0]);
        console.log("third")

    }catch(err){
        console.log('error creating chat',err);
        res.status(500).send('server error');
    }
};


exports.getChats = async(req,res)=>{
    try {
        const result = await pool.query(
            'SELECT * FROM chats ORDER BY created_at DESC'
        );
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error fetching chats',error);
        res.status(500).send('Server error');
    }
} 

exports.getChatMessages = async(req,res)=>{
    try {
         const {chatId} = req.params;
         const result = await pool.query(
            'SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
            [chatId]
        )
        res.json(result.rows);
        
    } catch (error) {
        console.error("Error getting chat:",error);
        res.status(500).send("internal server error")
        
    }
};

exports.sendMessage = async (req,res)=>{
        const {chatId} = req.params;
        const {content} = req.body;

        if (!content || !content.trim()) {
        return res.status(400).json({ error: "Message content is required" });
  }
    try {
        await pool.query(
            'INSERT INTO messages (chat_id,role,content)VALUES ($1,$2,$3)',
            [chatId,'user',content]
        );

    } catch (err) {
        console.error('error while sending msg:',err);
        res.status(500).send("server error")
    }

    const controller = new AbortController();
    setTimeout(() => controller.abort(), 60000); // 60 seconds timeout
    setStreamController(chatId, controller);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let fullResponse = "";

  try{
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
    method: 'POST',
    signal: controller.signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "gemma3:1b", 
      prompt: content,
      stream: true,
    }),
  });

  

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const json = JSON.parse(line.slice(6));
        if (json.response) {
          fullResponse += json.response;
          res.write(`data: ${json.response}\n\n`);
            }
         }
        }
    }

    await pool.query(
        'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)',
        [chatId, 'assistant', fullResponse]
    );

  res.end();

  }catch(err){
     console.error("Streaming error:", err.message);
    res.write(`data: Error occurred: ${err.message}\n\n`);
    res.end();
  }

}

exports.stopMessage = async (req, res) => {
  const { chatId } = req.params;
  abortStream(chatId);
  res.json({ status: "aborted" });
};

