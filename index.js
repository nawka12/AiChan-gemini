require('dotenv').config()

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
]});

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

client.on('messageCreate', async function(message){
    try {
        if(message.author.bot || !message.content.toLowerCase().startsWith("ai!") || message.content.toLowerCase() == ("ai!") ) return;
        
        const input = message.content.slice(3);
        if(message.content.toLowerCase().startsWith("ai!")){
            async function run(){
                const model = genAI.getGenerativeModel({ model: "gemini-pro"});

                const chat = model.startChat({
                    history: [
                        {
                            role: "user",
                            parts: "Hi! Can you introduce yourself?",
                        },
                        {
                            role: "model",
                            parts: "Hello! I am Ai-chan, a helpful assistant in the form of a Discord bot. My name is taken from Kizuna Ai, a virtual YouTuber. Nice to meet you!.",
                        },
                    ],
                    generationConfig: {
                        maxOutputTokens: 256,
                    },
                });
                const msg = input;
                message.channel.sendTyping();
                const result = await chat.sendMessage(msg);
                const response = await result.response;
                // Check if the response was blocked due to SAFETY
                if (response.promptFeedback && response.promptFeedback.blockReason === 'SAFETY') {
                    // Handle the case where the response was blocked
                    message.reply("Your question has been blocked by the system due to safety concerns.");
                } else {
                    const replyFrom = response.text();
                    message.reply(
                        `${replyFrom}\n\n\`\`\`Powered by Gemini Pro free tier\`\`\``
                    );
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
