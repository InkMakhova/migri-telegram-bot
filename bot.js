// imports
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const he = require('he');
require('dotenv').config();

const TOKEN = process.env.BOT_TOKEN;
const ENDPOINT = 'https://networkmigri.boost.ai/api/chat/v2';

// create Telegram bot
const bot = new TelegramBot(TOKEN, { polling: true });

// Handle '/start' command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Enter your diary number like this: xxxx/xxx/xxxx');
});

// Handle user message
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = he.decode(msg.text);

  const isValidFormat = /^(\d{4})\/(\d{3})\/(\d{4})$/.test(userMessage);
  // User input matches the desired format
  if (isValidFormat) {
    // Start Kamu chatbot request
    const startData = {
      command: 'START',
      filter_values: ['enterfinland.fi', 'english_start_language'],
      language: 'en-US'
    };
    const firstResponse = await axios.post(ENDPOINT, startData);
    const conversationId = firstResponse?.data?.conversation?.id;
    const id = firstResponse?.data?.response?.elements
      .find(el => el['type'] === 'links')
      .payload
      .links
      .find(link => link.text === 'My place in queue' || link.text === 'Minun jonopaikkani')
      .id;

    // Second necessary request with action link id
    const nextData = {
      client_timezone: 'Europe/Helsinki',
      command: 'POST',
      conversation_id: conversationId,
      filter_values: ['enterfinland.fi', 'english_start_language'],
      id: id,
      type: 'action_link'
    };
    const secondResponse = await axios.post(ENDPOINT,nextData);
    console.log(secondResponse.status);

    // Final request with diary number from the user
    const finalizedData = {
      client_timezone: 'Europe/Helsinki',
      command: 'POST',
      conversation_id: conversationId,
      filter_values: ['enterfinland.fi', 'english_start_language'],
      type: 'text',
      value: userMessage
    };
    const lastResponse = await axios.post(ENDPOINT, finalizedData);
    const elements = lastResponse.data.response.elements;
    const jsonElement = elements.find(el => el['type'] === 'json');
    if (jsonElement) {
      const queueCount = jsonElement
        .payload
        .json
        .data
        .counterValue;
      bot.sendMessage(chatId, `The application status with this diary number is: ${queueCount}`);
    } else {
      bot.sendMessage(chatId, 'I\'m afraid I can’t check your place in queue. The reason can be that: place in queue information is not available for applications of this type at all OR you submitted your application TODAY');
    }
  } else {
    if (userMessage !== '/start') {
      // User input does not match the desired format
      bot.sendMessage(chatId, 'Please provide the diary number in the format: xxxx/xxx/xxxx');
    }
  }
});
