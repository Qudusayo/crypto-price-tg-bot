require("dotenv").config();
const { Telegraf } = require("telegraf");
const axios = require("axios");

const bot = new Telegraf(process.env.BOT_TOKEN);
const apiKey = process.env.CRYPTO_COMPARE_API_KEY;
const apiUrl = process.env.CRYPTO_COMPARE_API_URL;

// Functio to send start message
const sendStartMessage = (ctx) => {
  let startMessage = "Welcome!, This bot gives you cryptocurrency information!";
  return bot.telegram.sendMessage(ctx.chat.id, startMessage, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Crypto Prices", callback_data: "price" }],
        [{ text: "CoinMarketCap", url: "https://coinmarketcap.com" }],
        [{ text: "Bot Info", callback_data: "info" }],
      ],
    },
  });
};

// Triggers on bot start
bot.command("start", (ctx) => {
  sendStartMessage(ctx); // Sends start message
});

// Listen to "start" call_backs
bot.action("start", (ctx) => {
  try {
    ctx.deleteMessage(); // Removes Previous message
    sendStartMessage(ctx); // Sends start message
  } catch (error) {
    console.log(error);
    ctx.reply("Error Encountered"); // Reply user incase error encountered
  }
});

// Inline keyboard display for user to select coin to check pricing for
bot.action("price", (ctx) => {
  let priceMessage =
    "Get Price Information. Select one of the cryptocurrencies below";
  ctx.deleteMessage();
  bot.telegram.sendMessage(ctx.chat.id, priceMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "BTC", callback_data: "price-BTC" },
          { text: "ETH", callback_data: "price-ETH" },
        ],
        [
          { text: "BNB", callback_data: "price-BNB" },
          { text: "BCH", callback_data: "price-BCH" },
        ],
        [{ text: "Back to Main Menu", callback_data: "start" }],
      ],
    },
  });
});

// Fetch choosen coin price and send response to the user
let priceActionList = ["price-BTC", "price-ETH", "price-BNB", "price-BCH"];
bot.action(priceActionList, async (ctx) => {
  let symbol = ctx.match[0].split("-")[1]; // User seclected price SYMBOL

  try {
    // API Call to get Price in Nigerian Naira ( NGN )
    let res = await axios.get(
      `${apiUrl}?fsyms=${symbol}&tsyms=NGN&api_key=${apiKey}`
    );
    // Responde object of NGN result
    let data = res.data.DISPLAY[symbol].NGN;

    let message = `
Symbol:  ${symbol}
Price: ${data.PRICE}
Open: ${data.OPENDAY}
High: ${data.HIGHDAY}
Low: ${data.LOWDAY}
Supply: ${data.SUPPLY}
Market Cap: ${data.MKTCAP}
    `;

    ctx.deleteMessage(); // Removes Previous message

    // Send a new Message to the client
    bot.telegram.sendMessage(ctx.chat.id, message, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Back to Previous Menu", callback_data: "price" }],
        ],
      },
    });
  } catch (error) {
    console.log(error);
    ctx.reply("Error Encountered");
  }
});

// Keyboard Display
bot.action("info", (ctx) => {
  bot.telegram.sendMessage(ctx.chat.id, "Bot info", {
    reply_markup: {
      keyboard: [
        [{ text: "Credits" }, { text: "API" }],
        [{ text: "Remove Keyboard" }],
      ],
      one_time_keyboard: true,
    },
  });
});

// Responds to Keyboard markup click from the info action
bot.hears("Credits", (ctx) => {
  ctx.reply(`
This Bot was made by Qudusayo
Following : https://youtu.be/N1C9lGtE2FU
`);
});

// Responds to Keyboard markup click from the info action
bot.hears("API", (ctx) => {
  ctx.reply(`
This Bot uses CryptoCompare API
https://min-api.cryptocompare.com/
`);
});

// Responds to Keyboard markup click to remove keyboard
bot.hears("Remove Keyboard", (ctx) => {
  bot.telegram.sendMessage(ctx.chat.id, "Removed Keyboard", {
    reply_markup: {
      remove_keyboard: true,
    },
  });
});

bot.launch();
