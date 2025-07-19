const streamControllers = new Map();

function setStreamController(chatId,controller){
    streamControllers.set(chatId,controller);
}

function abortStream(chatId) {
  const controller = streamControllers.get(chatId);
  if (controller) {
    controller.abort();
    streamControllers.delete(chatId);
  }
}

module.exports = { setStreamController, abortStream };