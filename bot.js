const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Инициализация Telegram бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.setMyCommands([
    {command: '/info', description: 'Номера экстренных служб'},
    {command: '/flooded', description: 'Затопил квартиру'},
    {command: '/report', description: 'Сообщить о проблеме'},
    {command: '/help', description: 'Получить справку'},
]);

const emergencyNumbers = `
[240\\-03\\-98](tel:+84732400398) УК Здоровья диспетчер
[233\\-17\\-54](tel:+84732331754) УК Здоровья
[89202295966](tel:+79202295966) Аварийная служба УК
`;

bot.on('new_chat_members', (msg) => {
    const newMembers = msg.new_chat_members;
    const chatId = msg.chat.id;

    newMembers.forEach((member) => {
        const firstName = member.first_name;
        const welcomeMessage = `Привет, ${firstName}! Добро пожаловать в чат!`;
        bot.sendMessage(chatId, welcomeMessage);
    });
});

// Обработчик команды /info
bot.onText(/\/info/, (msg) => {
    bot.sendMessage(msg.chat.id, `Полезные номера:\n${emergencyNumbers}`, { parse_mode: 'MarkdownV2' });
});

// Обработчик команды /help
bot.onText(/\/help/, (msg) => {
    const commandsList = `Блок находится в разработке`;
    bot.sendMessage(msg.chat.id, commandsList);
});

bot.onText(/\/flooded/, async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username || msg.from.first_name; // Проверяем наличие никнейма
    const message = `Не волнуйтесь, ${username}, и следуйте инструкции!`; // Сообщение с никнеймом
    const floodMessage = 'https://www.teploluxe.ru/articles/zashchita-ot-potopa/chto-delat-esli-vy-zatopili-sosedey-snizu/' // Пример ссылки, замените на свою
    const checkName = `⚠️⚠️⚠️Внимание! ${username} сообщил о потопе в доме! Срочно перекройте воду и вызовите слесаря!` //

    try {
        // Отправляем сообщение с предупреждением и ссылкой
        await bot.sendMessage(chatId, message);
        await bot.sendMessage(chatId, floodMessage);
        const pinnedMessage = await bot.sendMessage(chatId, checkName);

        // Закрепляем сообщение в чате
        await bot.pinChatMessage(chatId, pinnedMessage.message_id);
    } catch (error) {
        console.error('Ошибка при отправке сообщения или закреплении:', error.message);
    }
});

// Обработчик команды /report_issue
bot.onText(/\/report/, (msg) => {
    const chatId = msg.chat.id;
    const opts = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Сообщить о проблеме',
                        callback_data: 'report_issue'
                    }
                ]
            ]
        }
    };
    bot.sendMessage(chatId, 'Нажмите кнопку ниже, чтобы добавить описание и сообщить о проблеме:', opts);
});

// Обработчик callback_data для report_issue
bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    const chatId = message.chat.id;

    if (callbackQuery.data === 'report_issue') {
        bot.sendMessage(chatId, 'Пожалуйста, опишите проблему:');
        bot.once('message', (msg) => {
            const issue = msg.text;
            const username = msg.from.username || msg.from.first_name;
            const reportMessage = `🛠 ${username} сообщил о проблеме: ${issue}`;
            bot.sendMessage(chatId, reportMessage)
                .catch((error) => console.error('Ошибка при отправке сообщения:', error.message));
        });
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('Bot is running...');
});



console.log('Bot is running...');
