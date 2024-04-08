const { getGroupData, group } = require('../../mongo-DB/groupDataDb');

const handler = async (sock, msg, from, args, msgInfoObj) => {
    const { sendMessageWTyping } = msgInfoObj;
    const groupData = await getGroupData(from);
    let botStatus = groupData ? groupData.isBotOn : false;

    if (args[0] == "on" || args[0] == "true") {
        await group.updateOne({ _id: from }, { $set: { isBotOn: true } });
        sendMessageWTyping(from, {
            text: "Bot is now enabled in this group."
        }, { quoted: msg });
    } else if (args[0] == "off" || args[0] == "false") {
        await group.updateOne({ _id: from }, { $set: { isBotOn: false } });
        sendMessageWTyping(from, {
            text: "Bot is now disabled in this group."
        }, { quoted: msg });
    } else {
        sendMessageWTyping(from, {
            text: `Bot is currently ${botStatus ? "enabled" : "disabled"} in this group.\nUse ${process.env.PREFIX}authorize on/off to enable/disable the bot.`
        }, { quoted: msg });
    }

}

module.exports.command = () => ({ cmd: ["authorize"], handler });


