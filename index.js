require('dotenv').config()

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
]});

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

client.on('messageCreate', async function(message) {
    try {
        if (message.author.bot || !message.content.toLowerCase().startsWith("ap!") || message.content.toLowerCase() == ("ao!")) return;

        const input = message.content.slice(3);
        if (message.content.toLowerCase().startsWith("ap!")) {
            async function run() {
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });

                const chat = model.startChat({
                    history: [{
                        role: "user",
                        parts: "Hi! Can you introduce yourself?",
                    }, {
                        role: "model",
                        parts: "Hello! I am Ai-chan, a helpful assistant in the form of a Discord bot. My name is taken from Kizuna Ai, a virtual YouTuber. Nice to meet you!.",
                    }],
                });

                const msg = input;

                // Get the response from the AI model
                const result = await chat.sendMessage(msg);
                const response = await result.response;

                // Split the response into chunks of appropriate lengths without cutting words
                const replyDari = response.text();
                const maxCharacterLimit = 1500;
                const chunks = [];
                let currentChunk = '';

                for (const word of replyDari.split(/\s+/)) {
                    if ((currentChunk + ' ' + word).length <= maxCharacterLimit) {
                        currentChunk += ' ' + word;
                    } else {
                        chunks.push(currentChunk.trim());
                        currentChunk = word;
                    }
                }

                if (currentChunk.trim().length > 0) {
                    chunks.push(currentChunk.trim());
                }

                // Send the message directly if there's only one chunk
                if (chunks.length === 1) {
                    await message.reply(`${chunks[0]}\n\n\`\`\`Powered by Gemini Pro free tier\`\`\``);
                } else if (chunks.length > 1) {
                    // Send the first chunk using message.reply and subsequent chunks using message.channel.send
                    await message.reply(chunks[0]);
                    for (let i = 1; i < chunks.length - 1; i++) {
                        message.channel.sendTyping();
                        await message.channel.send(chunks[i]);
                    }
                    // Send the last chunk with the "Powered by Gemini Pro free tier" message
                    await message.channel.send(`${chunks[chunks.length - 1]}\n\n\`\`\`Powered by Gemini Pro free tier\`\`\``);
                }
            }
            run();
        }
    } catch (error) {
        console.error(error);
        message.reply(`There was an error processing your request.`);
        return;
    }
});

client.login(process.env.DISCORD_TOKEN);
console.log("Ai-chan is Online");
