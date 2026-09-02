const fs = require("fs-extra");
const { resolve } = require("path");

// ডাটাবেজ ফোল্ডার ও ফাইল পাথ সেটআপ
const dbFolderPath = resolve(__dirname, "../database");
const dbFilePath = resolve(dbFolderPath, "data.json");

// ডাটাবেজ ফোল্ডার ও ফাইল না থাকলে অটো তৈরি করবে
if (!fs.existsSync(dbFolderPath)) {
  fs.mkdirSync(dbFolderPath, { recursive: true });
}

if (!fs.existsSync(dbFilePath)) {
  fs.writeFileSync(dbFilePath, JSON.stringify({}, null, 2));
}

// টার্মাক্স-বান্ধব লাইটওয়েট ডাটাবেজ মেথড
const JSONDatabase = {
  get(key) {
    try {
      const data = fs.readJsonSync(dbFilePath);
      return key ? data[key] : data;
    } catch (err) {
      return null;
    }
  },

  set(key, value) {
    try {
      const data = fs.readJsonSync(dbFilePath);
      data[key] = value;
      fs.writeJsonSync(dbFilePath, data, { spaces: 2 });
      return true;
    } catch (err) {
      console.error("Database Write Error:", err.message);
      return false;
    }
  },

  delete(key) {
    try {
      const data = fs.readJsonSync(dbFilePath);
      delete data[key];
      fs.writeJsonSync(dbFilePath, data, { spaces: 2 });
      return true;
    } catch (err) {
      return false;
    }
  }
};

// আগের Sequelize অবজেক্টের বিকল্প হিসেবে হ্যান্ডলার সাপোর্ট
module.exports.sequelize = JSONDatabase;
module.exports.Sequelize = JSONDatabase;
