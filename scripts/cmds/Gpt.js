const axios = require("axios");

module.exports.config = {
  name: "gpt",
  version: "2.0",
  author: "Ajmaul",
  countDown: 5,
  role: 0,
  shortDescription: "ChatGPT AI system",
  longDescription: "Ask anything to GPT AI",
  category: "ai",
  guide: {
    en: "{pn} <your question>\nExample: {pn} What is Bangladesh?"
  }
};

// Use environment variable - set OPENAI_API_KEY in Railway environment variables
const getApiKey = () => process.env.OPENAI_API_KEY || "";

module.exports.onStart = async function ({ api, event, args, message }) {
  const prompt = args.join(" ") || (event.messageReply?.body);

  if (!prompt) {
    return message.reply(
      "💡 Please write your question!\n\nExample:\n.gpt What is Bangladesh?\n.gpt বাংলাদেশ কবে স্বাধীন হয়েছে?"
    );
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    // Fallback to free proxy API when no key set
    try {
      const wait = await message.reply("⏳ GPT thinking...");
      const res = await axios.get(
        `https://kaiz-apis.gleeze.com/api/gpt-4o?ask=${encodeURIComponent(prompt)}&uid=${event.senderID}`
      );
      const answer = res.data?.response || res.data?.message || "No response received.";
      api.unsendMessage(wait.messageID);
      return message.reply(`🤖 GPT:\n\n${answer}`);
    } catch (err) {
      return message.reply("❌ GPT is unavailable. Set OPENAI_API_KEY in Railway environment variables.");
    }
  }

  // Use official OpenAI API when key is available
  try {
    const wait = await message.reply("⏳ GPT ভাবছে...");
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
          "Authorization": `Bearer ${apiKey}`
        }
      }
    );
    const answer = response.data.choices[0].message.content;
    api.unsendMessage(wait.messageID);
    return message.reply(`🤖 GPT:\n\n${answer}`);
  } catch (error) {
    const status = error.response?.status;
    if (status === 401) return message.reply("❌ Invalid OpenAI API key. Please update OPENAI_API_KEY in Railway.");
    if (status === 429) return message.reply("❌ GPT rate limit reached. Try again in a moment.");
    return message.reply("❌ GPT error. Please try again later.");
  }
};
