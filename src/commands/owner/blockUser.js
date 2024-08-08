require('dotenv').config();
const OWNER_PHONE = process.env.OWNER_PHONE + '@s.whatsapp.net';
const { member } = require('../../mongo-DB/membersDataDb')

module.exports.command = () => {
    let cmd = ["block", "unblock"];
    return { cmd, handler };
}

const handler = async (sock, msg, from, args, msgInfoObj) => {

    const { command, botPhoneJid, sendMessageWTyping } = msgInfoObj;

    if (!msg.message.extendedTextMessage)
        return sendMessageWTyping(from, { text: "❌ Tag / mentioned!" }, { quoted: msg });

    let taggedJid;

    taggedJid = msg.message.extendedTextMessage ?
        msg.message.extendedTextMessage.contextInfo.participant :
        msg.message.extendedTextMessage.contextInfo.mentionedJid[0];

    taggedJid = taggedJid.includes(":") ?
        taggedJid.split(":")[0] :
        taggedJid.split("@")[0];

    console.log(taggedJid, botPhoneJid);

    if ((taggedJid == botPhoneJid.split("@")[0]) || (taggedJid == OWNER_PHONE.split("@")[0]))
        return sendMessageWTyping(from, { text: `_This command can't be used on bot/owner/admin_` }, { quoted: msg });

    if (command == "block") {
        member.updateOne({ _id: taggedJid + "@s.whatsapp.net" }, { $set: { isBlock: true } }).then(() => {
            sendMessageWTyping(from, { text: `❌ Blocked`, }, { quoted: msg });
        });
    }

    if (command == "unblock") {
        member.updateOne({ _id: taggedJid + "@s.whatsapp.net" }, { $set: { isBlock: false } }).then(() => {
            sendMessageWTyping(from, { text: `✅ *Unblocked*` }, { quoted: msg })
        });
    }
}