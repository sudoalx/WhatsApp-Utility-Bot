const { getGroupData, group } = require('../../../mongo-DB/groupDataDb');

const handler = async (sock, msg, from, args, msgInfoObj) => {
    const { sendMessageWTyping } = msgInfoObj;
    const evv = msgInfoObj.evv;
    const groupData = await getGroupData(from);
    let welMess = groupData.welcome;

    if (args[0] == "reset") {
        await group.updateOne({ _id: from }, { $set: { welcome: "" } });
        sendMessageWTyping(from, { text: "Welcome message reseted." }, { quoted: msg });
    } else if (!args[0]) {
        sendMessageWTyping(from, { text: welMess ? `Welcome message: ${welMess}` : "No welcome message set. Use the welcome command followed by a message to set a welcome message." }, { quoted: msg });
    } else {
        await group.updateOne({ _id: from }, { $set: { welcome: evv } });
        sendMessageWTyping(from, { text: `Welcome message set: ${evv}` }, { quoted: msg });
    }
}

module.exports.command = () => ({ cmd: ["welcome"], handler });
