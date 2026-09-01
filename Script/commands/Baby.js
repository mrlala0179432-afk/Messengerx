const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ==========================================
// 🎯 আপনার দেওয়া গ্রুপের চ্যাট আইডি সমূহ
// ==========================================
const GROUP_1_ID = "2285733362243325";
const GROUP_2_ID = "2233286770781887";

const apiList = "https://gitlab.com/shahadat-sahu/sahu-api/-/raw/main/API.json";
const getMainAPI = async () => (await axios.get(apiList)).data.simsimi;

// LALA.json ফাইল পড়ার ফাংশন
function getLocalReply(userQuery) {
  try {
    const filePath = path.join(__dirname, "LALA.json");
    if (!fs.existsSync(filePath)) return null;

    const rawData = fs.readFileSync(filePath, "utf8");
    const customData = JSON.parse(rawData);
    const query = userQuery.toLowerCase().trim();

    if (Array.isArray(customData)) {
      for (const item of customData) {
        if (item.user && item.user.toLowerCase().trim() === query) {
          return item.mime || item.ans || item.reply;
        }
      }
    } else if (customData && typeof customData === "object") {
      for (const key in customData) {
        if (key.toLowerCase().trim() === query) {
          return customData[key];
        }
      }
    }
  } catch (e) {
    console.error("LALA.json পড়তে সমস্যা হয়েছে:", e.message);
  }
  return null;
}

module.exports.config = {
  name: "baby",
  version: "1.0.7",
  hasPermssion: 0,
  credits: "ULLASH",
  description: "Cute AI Baby Chatbot | Talk, Teach & Chat with Emotion ☢️",
  commandCategory: "Chat",
  usages: "[message/query]",
  cooldowns: 0,
  prefix: true
};

module.exports.run = async function ({ api, event, args, Users }) {
  try {
    const uid = event.senderID;
    const senderName = await Users.getNameUser(uid);
    const rawQuery = args.join(" ").trim();

    if (!rawQuery) {
      const ran = ["Bolo baby", "hum"];
      const r = ran[Math.floor(Math.random() * ran.length)];
      return api.sendMessage(r, event.threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "simsimi"
          });
        }
      });
    }

    const command = args[0].toLowerCase().trim();

    // ----------------------------------------------------
    // ✨ ১. গ্রুপের ID বের করার কমান্ড (#id বা id)
    // ----------------------------------------------------
    if (command === "#id" || command === "id") {
      return api.sendMessage(`🆔 This Group/Chat ID: ${event.threadID}`, event.threadID, event.messageID);
    }

    // ----------------------------------------------------
    // ✨ ২. গ্রুপ ১-এ মেসেজ পাঠানোর লজিক (#1)
    // ----------------------------------------------------
    if (command === "#1" || command === "1") {
      const msgToSend = args.slice(1).join(" ");
      if (!msgToSend.trim()) {
        return api.sendMessage("⚠️ গ্রুপ ১-এ পাঠানোর জন্য কোনো মেসেজ লেখেননি! (যেমন: #1 hi)", event.threadID, event.messageID);
      }
      return api.sendMessage(msgToSend, String(GROUP_1_ID), (err) => {
        if (err) {
          return api.sendMessage(`❌ গ্রুপ ১-এ মেসেজ পাঠাতে ব্যর্থ হয়েছে! Error: ${err.message}`, event.threadID, event.messageID);
        }
        return api.sendMessage(`✅ মেসেজটি সফলভাবে গ্রুপ ১-এ পাঠানো হয়েছে!`, event.threadID, event.messageID);
      });
    }

    // ----------------------------------------------------
    // ✨ ৩. গ্রুপ ২-এ মেসেজ পাঠানোর লজিক (#2)
    // ----------------------------------------------------
    if (command === "#2" || command === "2") {
      const msgToSend = args.slice(1).join(" ");
      if (!msgToSend.trim()) {
        return api.sendMessage("⚠️ গ্রুপ ২-এ পাঠানোর জন্য কোনো মেসেজ লেখেননি! (যেমন: #2 hi)", event.threadID, event.messageID);
      }
      return api.sendMessage(msgToSend, String(GROUP_2_ID), (err) => {
        if (err) {
          return api.sendMessage(`❌ গ্রুপ ২-এ মেসেজ পাঠাতে ব্যর্থ হয়েছে! Error: ${err.message}`, event.threadID, event.messageID);
        }
        return api.sendMessage(`✅ মেসেজটি সফলভাবে গ্রুপ ২-এ পাঠানো হয়েছে!`, event.threadID, event.messageID);
      });
    }

    // ----------------------------------------------------
    // 🎯 অন্যান্য বিশেষ কাস্টম কমান্ডসমূহ
    // ----------------------------------------------------
    const simsim = await getMainAPI();

    if (["remove", "rm"].includes(command)) {
      const parts = rawQuery.replace(/^(remove|rm)\s*/i, "").split(" - ");
      if (parts.length < 2) return api.sendMessage("Use: remove [Question] - [Reply]", event.threadID, event.messageID);
      const [ask, ans] = parts.map(p => p.trim());
      const res = await axios.get(`${simsim}/delete?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}`);
      return api.sendMessage(res.data.message, event.threadID, event.messageID);
    }

    if (command === "list") {
      const res = await axios.get(`${simsim}/list`);
      if (res.data.code === 200) {
        return api.sendMessage(
          `♾ Total Questions Learned: ${res.data.totalQuestions}\n★ Total Replies Stored: ${res.data.totalReplies}\nDeveloper: ${res.data.author}`,
          event.threadID, event.messageID
        );
      } else return api.sendMessage(`Error: ${res.data.message}`, event.threadID, event.messageID);
    }

    if (command === "edit") {
      const parts = rawQuery.replace(/^edit\s*/i, "").split(" - ");
      if (parts.length < 3) return api.sendMessage("Use: edit [Q] - [Old] - [New]", event.threadID, event.messageID);
      const [ask, oldReply, newReply] = parts.map(p => p.trim());
      const res = await axios.get(`${simsim}/edit?ask=${encodeURIComponent(ask)}&old=${encodeURIComponent(oldReply)}&new=${encodeURIComponent(newReply)}`);
      return api.sendMessage(res.data.message, event.threadID, event.messageID);
    }

    if (command === "teach") {
      const parts = rawQuery.replace(/^teach\s*/i, "").split(" - ");
      if (parts.length < 2) return api.sendMessage("Use: teach [Q] - [Reply]", event.threadID, event.messageID);
      const [ask, ans] = parts.map(p => p.trim());
      const groupID = event.threadID;
      let groupName = event.threadName ? event.threadName : "";
      try {
        if (!groupName && groupID != uid) {
          const threadInfo = await api.getThreadInfo(groupID);
          if (threadInfo?.threadName) groupName = threadInfo.threadName;
        }
      } catch {}

      let teachUrl = `${simsim}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&senderID=${uid}&senderName=${encodeURIComponent(senderName)}&groupID=${encodeURIComponent(groupID)}`;
      if (groupName) teachUrl += `&groupName=${encodeURIComponent(groupName)}`;
      const res = await axios.get(teachUrl);
      return api.sendMessage(res.data.message, event.threadID, event.messageID);
    }

    // ১. LALA.json চেক করবে
    const localReply = getLocalReply(rawQuery);
    if (localReply) {
      return api.sendMessage(localReply, event.threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "simsimi"
          });
        }
      }, event.messageID);
    }

    // ২. AI / Simsimi API চেক করবে
    const query = rawQuery.toLowerCase();
    const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
    const replies = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

    for (const rep of replies) {
      await new Promise(resolve => {
        api.sendMessage(rep, event.threadID, (err, info) => {
          if (!err) {
            global.client.handleReply.push({
              name: module.exports.config.name,
              messageID: info.messageID,
              author: event.senderID,
              type: "simsimi"
            });
          }
          resolve();
        }, event.messageID);
      });
    }

  } catch (err) {
    return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleReply = async function ({ api, event, Users, handleReply }) {
  try {
    const senderName = await Users.getNameUser(event.senderID);
    const replyText = event.body ? event.body.toLowerCase().trim() : "";
    if (!replyText) return;

    if (handleReply.type === "food_check") {
      if (replyText.includes("হ্যাঁ") || replyText.includes("খাইছি") || replyText.includes("হ্যা")) {
        return api.sendMessage("ভালো 😊", event.threadID, event.messageID);
      } else if (replyText.includes("না") || replyText.includes("খাই নাই") || replyText.includes("নাই")) {
        return api.sendMessage("কেন খাও নাই? 🥺", event.threadID, event.messageID);
      }
    }

    const localReply = getLocalReply(replyText);
    if (localReply) {
      return api.sendMessage(localReply, event.threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "simsimi"
          });
        }
      }, event.messageID);
    }

    const simsim = await getMainAPI();
    const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(replyText)}&senderName=${encodeURIComponent(senderName)}`);
    const replies = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

    for (const rep of replies) {
      await new Promise(resolve => {
        api.sendMessage(rep, event.threadID, (err, info) => {
          if (!err) {
            global.client.handleReply.push({
              name: module.exports.config.name,
              messageID: info.messageID,
              author: event.senderID,
              type: "simsimi"
            });
          }
          resolve();
        }, event.messageID);
      });
    }

  } catch (err) {
    return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  try {
    const raw = event.body ? event.body.toLowerCase().trim() : "";
    if (!raw) return;

    const senderName = await Users.getNameUser(event.senderID);
    const senderID = event.senderID;
    const simsim = await getMainAPI();

    const greetings = [
      "বেশি bot Bot করলে leave নিবো কিন্তু😒😒",
      "শুনবো না😼 তুমি আমার বস সাহু কে প্রেম করাই দাও নাই🥺পচা তুমি🥺",
      "আমি আবাল দের সাথে কথা বলি না,ok😒",
      "এতো ডেকো না,প্রেম এ পরে যাবো তো🙈",
      "Bolo Babu, তুমি কি আমার বস সাহু কে ভালোবাসো? 🙈💋",
      "বার বার ডাকলে মাথা গরম হয়ে যায় কিন্তু😑",
      "হ্যা বলো😒, তোমার জন্য কি করতে পারি😐😑?",
      "এতো ডাকছিস কেন?গালি শুনবি নাকি? 🤬",
      "I love you janu🥰",
      "আরে Bolo আমার জান ,কেমন আছো?😚",
      "আজ বট বলে অসম্মান করছি,😰😿",
      "Hop beda😾,Boss বল boss😼",
      "চুপ থাক ,নাই তো তোর দাত ভেগে দিবো কিন্তু",
      "আমাকে না ডেকে মেয়ে হলে বস সাহুর ইনবক্সে চলে যা 🌚😂 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://www.facebook.com/100044713412032",
      "আমাকে বট না বলে , বস সাহু কে জানু বল জানু 😘",
      "বার বার Disturb করছিস কোনো😾,আমার জানুর সাথে ব্যাস্ত আছি😋",
      "আরে বলদ এতো ডাকিস কেন🤬",
      "আমাকে ডাকলে ,আমি কিন্তু কিস করে দিবো😘",
      "আমারে এতো ডাকিস না আমি মজা করার mood এ নাই এখন😒",
      "হ্যাঁ জানু , এইদিক এ আসো কিস দেই🤭 😘",
      "দূরে যা, তোর কোনো কাজ নাই, শুধু bot bot করিস 😉😋🤣",
      "তোর কথা তোর বাড়ি কেউ শুনে না ,তো আমি কোনো শুনবো ?🤔😂",
      "আমাকে ডেকো না,আমি বস সাহুর সাথে ব্যাস্ত আছি",
      "কি হলো , মিস্টেক করচ্ছিস নাকি🤣",
      "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
      "জান মেয়ে হলে বস সাহুর ইনবক্সে চলে যাও 😍🫣💕 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://www.facebook.com/100044713412032",
      "কালকে দেখা করিস তো একটু 😈",
      "হা বলো, শুনছি আমি 😏",
      "আর কত বার ডাকবি ,শুনছি তো",
      "হুম বলো কি বলবে😒",
      "বলো কি করতে পারি তোমার জন্য",
      "আমি তো অন্ধ কিছু দেখি না🐸 😎",
      "আরে বোকা বট না জানু বল জানু😌",
      "বলো জানু 🌚",
      "তোর কি চোখে পড়ে না আমি ব্যাস্ত আছি😒",
      "হুম জান তোমার ওই খানে উম্মহ😑😘",
      "আহ শুনা আমার তোমার অলিতে গলিতে উম্মাহ😇😘",
      "jang hanga korba😒😬",
      "হুম জান তোমার অইখানে উম্মমাহ😷😘",
      "আসসালামু আলাইকুম বলেন আপনার জন্য কি করতে পারি..!🥰",
      "ভালোবাসার নামক আবলামি করতে চাইলে বস সাহুর ইনবক্সে গুতা দিন ~🙊😘🤣 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://www.facebook.com/100044713412032",
      "আমাকে এতো না ডেকে বস সাহু এর কে একটা গফ দে 🙄",
      "আমাকে এতো না ডেকছ কেন ভলো টালো বাসো নাকি🤭🙈",
      "🌻🌺💚-আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ-💚🌺🌻",
      "আমি এখন বস সাহু এর সাথে বিজি আছিআমাকে ডাকবেন না-😕😏 ধন্যবাদ-🤝🌻",
      "আমাকে না ডেকে আমার বস সাহু কে একটা জি এফ দাও-😽🫶🌺",
      "ঝাং থুমালে আইলাপিউ পেপি-💝😽",
      "উফফ বুঝলাম না এতো ডাকছেন কেনো-😤😡😈",
      "জান তোমার বান্ধবী রে আমার বস সাহুর হাতে তুলে দিবা-🙊🙆‍♂",
      "আজকে আমার মন ভালো নেই তাই আমারে ডাকবেন না-😪🤧",
      "ঝাং 🫵থুমালে য়ামি রাইতে পালুপাসি উম্মম্মাহ-🌺🤤💦",
      "চুনা ও চুনা আমার বস সাহু এর হবু বউ রে কেও দেকছো খুজে পাচ্ছি না😪🤧😭",
      "স্বপ্ন তোমারে নিয়ে দেখতে চাই তুমি যদি আমার হয়ে থেকে যাও-💝🌺🌻",
      "জান হাঙ্গা করবা-🙊😝🌻",
      "জান মেয়ে হলে চিপায় আসো বস সাহুর থেকে অনেক ভালোবাসা শিখছি তোমার জন্য-🙊🙈😽",
      "ইসস এতো ডাকো কেনো লজ্জা লাগে তো-🙈🖤🌼",
      "আমার বস সাহুর পক্ষ থেকে তোমারে এতো এতো ভালোবাসা-🥰😽🫶 আমার বস সাহু ইসলামে'র জন্য দোয়া করবেন-💝💚🌺🌻",
      "- ভালোবাসা নামক আবলামি করতে মন চাইলে আমার বস সাহু এর ইনবক্স চলে যাও-🙊🥱👅 🌻𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊 𝐈𝐃 𝐋𝐈𝐍𝐊 🌻:- https://www.facebook.com/100044713412032",
      "আমার জান তুমি শুধু আমার আমি তোমারে ৩৬৫ দিন ভালোবাসি-💝🌺😽",
      "কিরে প্রেম করবি তাহলে বস সাহুর ইনবক্সে গুতা দে 😘🤌 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://www.facebook.com/100044713412032",
      "জান আমার বস সাহু কে বিয়ে করবা-🙊😘🥳",
      "-আন্টি-🙆-আপনার মেয়ে-👰‍♀️-রাতে আমারে ভিদু কল দিতে বলে🫣-🥵🤤💦",
      "oii-🥺🥹-এক🥄 চামচ ভালোবাসা দিবা-🤏🏻🙂",
      "-আপনার সুন্দরী বান্ধুবীকে ফিতরা হিসেবে আমার বস সাহু কে দান করেন-🥱🐰🍒",
      "-ও মিম ও মিম-😇-তুমি কেন চুরি করলা সাদিয়ার ফর্সা হওয়ার ক্রীম-🌚🤧",
      "-অনুমতি দিলাম-𝙋𝙧𝙤𝙥𝙤𝙨𝙚 কর বস সাহু কে-🐸😾🔪",
      "-𝙂𝙖𝙮𝙚𝙨-🤗-যৌবনের কসম দিয়ে আমারে 𝐁𝐥𝐚𝐜𝐤𝐦𝐚𝐢𝐥 করা হচ্ছে-🥲🤦‍♂️🤧",
      "-𝗢𝗶𝗶 আন্টি-```javascript
      "-আপনার সুন্দর মেয়েটারে আমার বস সাহুর কাছে সোপে দেন-👰‍♀️😍🙈",
      "-মানুষের শখ কতো অদ্ভুত-👀-কারো বিড়ি খাওয়ার-🚬-আর আমার বিড়ি দিয়ে কারো পিঠ ছ্যাকা দিতে মন চায়-🥴🐸🙈",
      "শুনছেন ভাই মানুষ না ভালোবাসা পাওয়ার পর পরিবর্তন হয়ে যায়-🙂🍂"
    ];

    if (raw === "bot" || raw === "বট") {
      const reply = greetings[Math.floor(Math.random() * greetings.length)];
      return api.sendMessage(reply, event.threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "simsimi"
          });
        }
      }, event.messageID);
    }

    if (raw === "খাইছো" || raw === "খাইছ" || raw === "খাইছিস" || raw === "খাইছো?") {
      return api.sendMessage("হুম খাইছি, তুমি খাইছো? 🙈", event.threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "food_check"
          });
        }
      }, event.messageID);
    }

    if (raw === "কি কর" || raw === "কি করো" || raw === "কী করো" || raw === "ki koro" || raw === "ki kor") {
      const activityReplies = [
        "এইতো বসে আছি 🙈 তুমি কি করো?",
        "আপনার কথা ভাবছিলাম 🙈",
        "কিছু না, শুয়ে শুয়ে ফ্যান গুনছি 🐸",
        "তোমার সাথে কথা বলছি ❤️"
      ];
      const selected = activityReplies[Math.floor(Math.random() * activityReplies.length)];
      return api.sendMessage(selected, event.threadID, event.messageID);
    }

  } catch (err) {
    console.error("HandleEvent Error:", err);
  }
};
