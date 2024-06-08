const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.setMyCommands([
  { command: "/info", description: "Номера экстренных служб" },
  { command: "/flooded", description: "Затопил квартиру" },
  { command: "/report", description: "Сообщить о проблеме" },
  { command: "/request_help", description: "Запросить помощь" },
  { command: "/help", description: "Получить справку" },
]);

const emergencyNumbers = `
[211\\-01\\-89](tel:84732400389) УК Здоровья
[240\\-03\\-98](tel:84732400398) УК Здоровья диспетчер
[233\\-17\\-54](tel:84732331754) УК Здоровья слесарь
[89202295966](tel:89202295966) Аварийная служба УК
`;

bot.on("new_chat_members", (msg) => {
  const chatId = msg.chat.id;
  msg.new_chat_members.forEach((member) => {
    const welcomeMessage = `Привет, ${member.first_name}! Добро пожаловать в чат!`;
    bot.sendMessage(chatId, welcomeMessage);
  });
});

bot.onText(/\/info/, (msg) => {
  bot.sendMessage(msg.chat.id, `Полезные номера:\n${emergencyNumbers}`, {
    parse_mode: "MarkdownV2",
  });
});

bot.onText(/\/request_help/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    await bot.sendMessage(userId, "Чем нужно помочь?");
    bot.once("message", async (responseMsg) => {
      if (responseMsg.chat.id === userId) {
        const helpRequest = responseMsg.text;
        const username = msg.from.username || msg.from.first_name;
        const helpMessage = `🆘 ${username} просит о помощи: ${helpRequest}`;

        const pinnedMessage = await bot.sendMessage(chatId, helpMessage);
        await bot.pinChatMessage(chatId, pinnedMessage.message_id);
      }
    });
  } catch (error) {
    console.error(
      "Ошибка при отправке сообщения или закреплении:",
      error.message,
    );
  }
});

bot.onText(/\/help/, (msg) => {
  const commandsList = `Блок находится в разработке`;
  bot.sendMessage(msg.chat.id, commandsList);
});

bot.onText(/\/flooded/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || msg.from.first_name;
  const message = `Не волнуйтесь, ${username}, и следуйте инструкции!`;
  const floodMessage =
    "https://www.teploluxe.ru/articles/zashchita-ot-potopa/chto-delat-esli-vy-zatopili-sosedey-snizu/";
  const checkName = `⚠️⚠️⚠️Внимание! ${username} сообщил о потопе в доме! Срочно перекройте воду и вызовите слесаря!`;

  try {
    await bot.sendMessage(chatId, message);
    await bot.sendMessage(chatId, floodMessage);
    const pinnedMessage = await bot.sendMessage(chatId, checkName);
    await bot.pinChatMessage(chatId, pinnedMessage.message_id);
  } catch (error) {
    console.error(
      "Ошибка при отправке сообщения или закреплении:",
      error.message,
    );
  }
});

bot.onText(/\/report/, (msg) => {
  const chatId = msg.chat.id;
  const opts = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Сообщить о проблеме",
            callback_data: "report_issue",
          },
        ],
      ],
    },
  };
  bot.sendMessage(
    chatId,
    "Нажмите кнопку ниже, чтобы добавить описание и сообщить о проблеме:",
    opts,
  );
});

bot.on("callback_query", async (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;

  if (callbackQuery.data === "report_issue") {
    try {
      await bot.sendMessage(chatId, "Пожалуйста, опишите проблему:");
      bot.once("message", async (msg) => {
        const issue = msg.text;
        const username = msg.from.username || msg.from.first_name;
        const reportMessage = `🛠 ${username} сообщил о проблеме: ${issue}`;
        await bot.sendMessage(chatId, reportMessage);
      });
    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error.message);
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log("Bot is running...");
});
