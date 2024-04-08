const mdClient = require("../mongodb");
mdClient.connect();

const bot = mdClient.db("MyBotDataDB").collection("AuthTable");

const createBotData = () => {
    bot.findOne({ _id: "bot" }).then(res => {
        if (res == null) {
            bot.insertOne({
                _id: "bot",
                instaSession_id: "",
            })
        }
    }).catch(err => {
        console.log(err);
    })
}

const getBotData = async () => {
    return await bot.findOne({ _id: "bot" }).then(res => {
        return res;
    }).catch(err => {
        console.log(err);
        return -1;
    });
}

module.exports = { getBotData, createBotData, bot };