const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ==========================================
// 🎯 আপনার গ্রুপের চ্যাট আইডি সমূহ
// ==========================================
const GROUP_1_ID = "2285733362243325"; // জেন/অরিজিনাল গ্রুপ (যেখান থেকে মেসেজ রিসিভ হবে)
const GROUP_2_ID = "3449886188517413"; // টার্গেট গ্রুপ (যেখানে ফরওয়ার্ড হবে)

const apiList = "https://gitlab.com/shahadat-sahu/sahu-api/-/raw/main/API.json";
const getMainAPI = async () => (await axios.get(apiList)).data.simsimi;

module.exports.config = {
  name: "baby",
  version: "1.3.0",
  hasPermssion: 0,
  credits: "ULLASH",
  description: "Group Auto Forwarder & Chatbot",
  commandCategory: "Chat",
  usages: "[message/query]",
  cooldowns: 0,
  prefix: true
};

module.exports.run = async function ({ api, event, args, Users }) {
  // আপনার রানিং কমান্ড কোড
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  try {
    if (!event || !event.threadID) return;

    const currentThreadID = String(event.threadID);
    const targetGroup1 = String(GROUP_1_ID);
    const targetGroup2 = String(GROUP_2_ID);
    const botID = String(api.getCurrentUserID());

    // ১. চেক করা হচ্ছে মেসেজটি কি গ্রুপ ১ থেকে এসেছে এবং সেটি বটের নিজের মেসেজ কিনা
    if (currentThreadID === targetGroup1) {
      if (String(event.senderID) === botID) {
        console.log("[FORWARD SKIP] বটের নিজের মেসেজ হওয়ায় ফরওয়ার্ড করা হচ্ছে না।");
        return;
      }

      const rawText = event.body ? event.body.trim() : "";
      let senderName = "Unknown";
      try {
        senderName = await Users.getNameUser(event.senderID);
      } catch (e) {
        senderName = event.senderID;
      }

      console.log(`\n--------------------------------------------------`);
      console.log(`[FORWARD START] Group 1 (${currentThreadID}) থেকে মেসেজ এসেছে!`);
      console.log(`[USER]: ${senderName} | [TEXT]: ${rawText}`);
      console.log(`[TARGET]: Group 2 (${targetGroup2})-এ পাঠানোর চেষ্টা করা হচ্ছে...`);

      const forwardMsg = `📩 [Group 1 Forward]\n👤 User: ${senderName}\n💬 Message: ${rawText || "Media Attachment"}`;

      // গ্রুপ ২-এ মেসেজ পাঠানো
      api.sendMessage(forwardMsg, targetGroup2, (err, info) => {
        if (err) {
          console.error(`❌ [FORWARD FAILED] গ্রুপ ২ এ পাঠাতে ব্যর্থ!`);
          console.error(`⚠️ Error Details:`, err);
        } else {
          console.log(`✅ [FORWARD SUCCESS] গ্রুপ ২ এ মেসেজ সফলভাবে চলে গেছে! MessageID: ${info.messageID}`);
        }
        console.log(`--------------------------------------------------\n`);
      });

      return; // ফরওয়ার্ড হলে বাকি চ্যাটবট রেসপন্স বন্ধ রাখা হলো
    }

  } catch (err) {
    console.error("[HANDLE EVENT CRITICAL ERROR]:", err);
  }
};
