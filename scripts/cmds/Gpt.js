const axios = require("axios");

module.exports.config = {
    name: "gpt",
    version: "1.0.0",
    author: "ALVI",
    countDown: 2,
    role: 0,
    shortDescription: "ChatGPT AI system",
    longDescription: "Ask anything to GPT AI",
    category: "ai",
    guide: {
        en: "gpt <your question>"
    }
};

const API_KEY = "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";

module.exports.onStart = async function ({ api, event, args }) {
    try {
        const prompt = args.join(" ") || (event.messageReply && event.messageReply.body);

        if (!prompt)
            return api.sendMessage(
                "💡 প্রশ্ন লিখুন!\n\nউদাহরণ:\n`gpt বাংলাদেশ কবে স্বাধীন হয়েছে?`",
                event.threadID,
                event.messageID
            );

        const waiting = await api.sendMessage("⏳ GPT ভাবছে...", event.threadID);

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a helpful AI assistant." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.8
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`,
                }
            }
        );

        const answer = response.data.choices[0].message.content;

        api.editMessage(`🤖 GPT উত্তর:\n\n${answer}`, waiting.messageID);

    } catch (error) {
        console.error(error);
        return api.sendMessage("❌ GPT-তে সমস্যা হচ্ছে!", event.threadID, event.messageID);
    }
};
