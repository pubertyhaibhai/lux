require("dotenv").config();
const { Telegraf } = require("telegraf");
console.log("Token:", process.env.BOT_TOKEN);
const bot = new Telegraf(process.env.BOT_TOKEN);
console.log("Launching test bot...");
bot.launch()
  .then(() => {
    console.log("✅ Bot connected!");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Bot error:", err);
    process.exit(1);
  });
setTimeout(() => {
  console.log("Timeout reached, bot still launching...");
  process.exit(1);
}, 10000);
