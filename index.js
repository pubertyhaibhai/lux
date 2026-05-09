require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const { message } = require("telegraf/filters");
const { botFlow, STYLES } = require("./botFlow");
const db = require("./database");
const http = require("http");

if (!process.env.BOT_TOKEN) {
  console.error("❌ BOT_TOKEN missing!");
  process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);
const userStates = new Map();
const REQUIRED_CHANNEL = "@softluxesupport";

const PACKAGES = {
  "pack_250": { stars: 399, credits: 250, label: "💎 250 Credits" },
  "pack_550": { stars: 799, credits: 550, label: "🔥 550 Credits (Best Value)" }
};

// Middleware to ensure user exists and is joined to channel
async function ensureAccess(ctx, next) {
  const userId = ctx.from.id;
  const username = ctx.from.username || "User";
  db.addUser(userId, username);

  // Skip join check for channel or private messages that aren't bot actions
  if (ctx.chat.type !== 'private') return next();
  
  try {
    const member = await ctx.telegram.getChatMember(REQUIRED_CHANNEL, userId);
    const status = ["member", "administrator", "creator"].includes(member.status);
    if (!status) throw new Error();
    return next();
  } catch (e) {
    return ctx.replyWithMarkdown(
      `⚠️ *Access Denied!*\n\nYou must join our support channel to use this bot.\n\n` +
      `👉 Join: ${REQUIRED_CHANNEL}`,
      Markup.inlineKeyboard([
        [Markup.button.url("🚀 Join Channel", `https://t.me/${REQUIRED_CHANNEL.replace("@", "")}`)],
        [Markup.button.callback("✅ I've Joined", "cmd_check_join")]
      ])
    );
  }
}

bot.catch((err, ctx) => {
  console.error(`❌ Error for ${ctx.updateType}:`, err.message);
});

bot.action("cmd_check_join", async (ctx) => {
  try {
    const member = await ctx.telegram.getChatMember(REQUIRED_CHANNEL, ctx.from.id);
    const status = ["member", "administrator", "creator"].includes(member.status);
    if (status) {
      await ctx.answerCbQuery("✅ Access Granted!");
      await ctx.deleteMessage();
      return ctx.replyWithMarkdown(botFlow.getWelcomeMessage() + "\n\n💰 Your balance: *10 credits*", Markup.keyboard([
          ["👤 My Profile", "💰 Buy Credits"],
          ["🎁 Invite Friends"]
      ]).resize());
    } else {
      await ctx.answerCbQuery("❌ You haven't joined yet!", { show_alert: true });
    }
  } catch (e) {
    console.error("Check join error:", e.message);
    await ctx.answerCbQuery("Error checking membership", { show_alert: true });
  }
});

bot.start(async (ctx) => {
  try {
    const userId = ctx.from.id;
    const username = ctx.from.username || "User";
    const startPayload = ctx.startPayload;

    db.addUser(userId, username);
    const user = db.getUser(userId);
    
    // Referral handling
    if (startPayload && startPayload.startsWith("ref_")) {
      const referrerId = parseInt(startPayload.replace("ref_", ""));
      if (referrerId && referrerId !== userId && !user.referred_by) {
        db.addReferral(userId, referrerId);
        db.addCredits(referrerId, 10);
        try {
          await bot.telegram.sendMessage(referrerId, `🎁 *Referral Bonus!* \n\nSomeone joined using your link. You received 10 credits!`, { parse_mode: "Markdown" });
        } catch (msgErr) {
          console.warn(`Could not send referral bonus to ${referrerId}: ${msgErr.message}`);
        }
      }
    }

    // Membership check
    try {
      const member = await ctx.telegram.getChatMember(REQUIRED_CHANNEL, userId);
      const status = ["member", "administrator", "creator"].includes(member.status);
      if (!status) throw new Error();

      const updatedUser = db.getUser(userId);
      const welcomeText = botFlow.getWelcomeMessage() + `\n\n💰 Your Balance: *${updatedUser.credits} credits*`;

      ctx.replyWithMarkdown(welcomeText, Markup.keyboard([
          ["👤 My Profile", "💰 Buy Credits"],
          ["🎁 Invite Friends"]
      ]).resize());
    } catch (e) {
      ctx.replyWithMarkdown(
          `👋 *Welcome to Soft Luxe* 🔥\n\nYou must join our support channel first to start using the bot!\n\n` +
          `👉 Join: ${REQUIRED_CHANNEL}`,
          Markup.inlineKeyboard([
            [Markup.button.url("🚀 Join Channel", `https://t.me/${REQUIRED_CHANNEL.replace("@", "")}`)],
            [Markup.button.callback("✅ I've Joined", "cmd_check_join")]
          ])
      );
    }
  } catch (err) {
    console.error("Start command error:", err.message);
  }
});

bot.hears("👤 My Profile", ensureAccess, (ctx) => sendProfile(ctx));
bot.hears("💰 Buy Credits", ensureAccess, (ctx) => sendShop(ctx));
bot.hears("🎁 Invite Friends", ensureAccess, (ctx) => sendProfile(ctx));

bot.command("profile", ensureAccess, (ctx) => sendProfile(ctx));
bot.action("cmd_profile", ensureAccess, (ctx) => sendProfile(ctx));

async function sendProfile(ctx) {
  try {
    const userId = ctx.from.id;
    const user = db.getUser(userId);
    const isPremium = db.isPremium(userId);
    const statusLabel = isPremium ? "👑 Premium" : "🆕 Free User";
    const botInfo = await ctx.telegram.getMe();
    const inviteLink = `https://t.me/${botInfo.username}?start=ref_${userId}`;

    const text = `👤 *Your Soft Luxe Profile*\n\n` +
                 `📊 Status: *${statusLabel}*\n` +
                 `💰 Credits: *${user.credits}*\n` +
                 `🎁 Referral Link: \`${inviteLink}\`\n\n` +
                 `_Share your link to earn 10 credits for every friend who joins!_`;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback("💰 Buy Credits", "cmd_buy")],
      [Markup.button.url("🔗 Share Link", `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent("Check out this amazing AI transformation bot! 🔥")}`)]
    ]);

    if (ctx.callbackQuery) {
      await ctx.editMessageText(text, { parse_mode: "Markdown", ...keyboard });
    } else {
      await ctx.replyWithMarkdown(text, keyboard);
    }
  } catch (err) {
    console.error("Profile error:", err.message);
  }
}

bot.command("buy", ensureAccess, (ctx) => sendShop(ctx));
bot.action("cmd_buy", ensureAccess, (ctx) => sendShop(ctx));

async function sendShop(ctx) {
  try {
    const text = `💰 *Top Up Credits*\n\nSelect a package to purchase credits via Telegram Stars:`;
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback(PACKAGES.pack_250.label + " - 399 ⭐️", "buy_pack_250")],
      [Markup.button.callback(PACKAGES.pack_550.label + " - 799 ⭐️", "buy_pack_550")],
      [Markup.button.callback("⬅️ Back to Profile", "cmd_profile")]
    ]);

    if (ctx.callbackQuery) {
      await ctx.editMessageText(text, { parse_mode: "Markdown", ...keyboard });
    } else {
      await ctx.replyWithMarkdown(text, keyboard);
    }
  } catch (err) {
    console.error("Shop error:", err.message);
  }
}

bot.action(/^buy_(.+)$/, ensureAccess, async (ctx) => {
  try {
    const packKey = ctx.match[1];
    const pack = PACKAGES[packKey];
    if (!pack) return ctx.answerCbQuery("Invalid package.");

    await ctx.replyWithInvoice({
      title: `Purchase ${pack.credits} Credits`,
      description: `Top up your Soft Luxe account with ${pack.credits} image generation credits.`,
      payload: packKey,
      currency: "XTR",
      prices: [{ label: pack.label, amount: pack.stars }],
      provider_token: "" // Empty for Stars
    });
    await ctx.answerCbQuery();
  } catch (err) {
    console.error("Buy error:", err.message);
  }
});

bot.on("pre_checkout_query", (ctx) => ctx.answerPreCheckoutQuery(true));

bot.on("successful_payment", async (ctx) => {
  try {
    const payment = ctx.message.successful_payment;
    const packKey = payment.invoice_payload;
    const pack = PACKAGES[packKey];
    const userId = ctx.from.id;

    if (pack) {
      db.addCredits(userId, pack.credits);
      db.logTransaction(payment.telegram_payment_charge_id, userId, pack.stars, pack.credits);
      await ctx.reply(`✅ *Payment Successful!*\n\n${pack.credits} credits have been added to your account. Enjoy your transformations!`, { parse_mode: "Markdown" });
    }
  } catch (err) {
    console.error("Payment error:", err.message);
  }
});

// Step 1: User sends a photo
bot.on(message("photo"), ensureAccess, async (ctx) => {
  try {
    const userId = ctx.from.id;
    const user = db.getUser(userId);

    if (user.credits < 10) {
      return ctx.replyWithMarkdown(
        `❌ *Insufficient Credits!*\n\nGenerating an image costs *10 credits*.\n` +
        `You currently have *${user.credits}* credits.\n\n` +
        `Invite friends or buy credits to continue!`,
        Markup.inlineKeyboard([
          [Markup.button.callback("💰 Buy Credits", "cmd_buy"), Markup.button.callback("🎁 Invite Friends", "cmd_profile")]
        ])
      );
    }

    try {
      const photo = ctx.message.photo.pop();
      const fileLink = await ctx.telegram.getFileLink(photo.file_id);
      const chatId = ctx.chat.id;

      userStates.set(chatId, { image_url: fileLink.href });

      await ctx.reply(
        "📸 *Image Captured!* 🔥\n\nSelect your transformation style. Each generation costs *10 credits*.",
        { 
          parse_mode: "Markdown",
          ...botFlow.getStyleKeyboard() 
        }
      );
    } catch (error) {
      console.error("Photo Error:", error.message);
      ctx.reply("❌ Error receiving photo. Please try again.");
    }
  } catch (err) {
    console.error("Photo handler error:", err.message);
  }
});

// Step 2: User selects a style -> Immediate Processing
bot.action(/^style_(.+)$/, ensureAccess, async (ctx) => {
  try {
    const styleKey = ctx.match[1];
    const chatId = ctx.chat.id;
    const userId = ctx.from.id;
    const state = userStates.get(chatId);
    const user = db.getUser(userId);

    if (!state || !state.image_url) {
      return ctx.answerCbQuery("Please send a new photo first!");
    }

    if (user.credits < 10) {
      return ctx.answerCbQuery("Insufficient credits! Invite friends or buy credits to continue.");
    }

    await ctx.answerCbQuery("Processing... 10 credits will be deducted.");
    
    const processingMsg = await ctx.reply(
      `⚙️ *AI is processing your request...*\n\n` +
      `🎭 Style: ${styleKey}\n` +
      `_This usually takes 30-60 seconds. Please wait..._`,
      { parse_mode: "Markdown" }
    );

    try {
      const outputUrl = await botFlow.processImage(state.image_url, styleKey);

      db.deductCredits(userId, 10);
      const updatedUser = db.getUser(userId);

      await ctx.replyWithPhoto(
        { url: outputUrl },
        {
          caption: `✨ *Transformation Complete!*\n\nStyle: ${styleKey}\n💰 Remaining Credits: *${updatedUser.credits}*`,
          parse_mode: "Markdown"
        }
      );
      userStates.delete(chatId);
    } catch (error) {
      console.error("Processing Error:", error.message);
      ctx.reply("❌ Transformation failed. Credits were not deducted. Please try again with a different photo.");
    } finally {
      try {
        await ctx.telegram.deleteMessage(chatId, processingMsg.message_id);
      } catch (e) {}
    }
  } catch (err) {
    console.error("Style action error:", err.message);
  }
});

bot.on(message("text"), ensureAccess, (ctx) => {
  try {
    ctx.reply("📸 Send a photo first to start the transformation!");
  } catch (err) {
    console.error("Text handler error:", err.message);
  }
});

// Setup HTTP server FIRST before launching bot
const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌐 HTTP server listening on port ${PORT}`);
});

server.on('error', (err) => {
  console.error(`❌ Server error: ${err.message}`);
  process.exit(1);
});

// Launch bot AFTER server is ready
console.log("🚀 Starting Soft Luxe Bot...");
bot.launch({
  polling: {
    timeout: 30,
    allowedUpdates: ["message", "callback_query", "pre_checkout_query"]
  }
})
  .then(() => {
    console.log("✅ Soft Luxe Telegram bot is online!");
  })
  .catch((err) => {
    console.error("❌ Bot launch failed:", err);
    process.exit(1);
  });

// Self-ping to keep alive on Render (Free Tier)
const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
if (RENDER_URL) {
  console.log(`📡 Self-ping enabled for: ${RENDER_URL}`);
  setInterval(() => {
    http.get(RENDER_URL, (res) => {
      console.log(`📡 Ping: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error(`📡 Ping error: ${err.message}`);
    });
  }, 14 * 60 * 1000); // Every 14 minutes
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('⚠️ Shutting down gracefully...');
  bot.stop('SIGINT');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
