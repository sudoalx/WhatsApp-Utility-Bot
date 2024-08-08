const handler = async (sock, msg, from, args, msgInfoObj) => {
    const { groupAdmins, botPhoneJid: botPhoneJid, sendMessageWTyping } = msgInfoObj;
    if (!groupAdmins.includes(botPhoneJid)) {
        return sendMessageWTyping(from, { text: `❌ I'm not an admin here` }, { quoted: msg });
    }

    if (!args[0]) {
        return sendMessageWTyping(from, { text: `❌ *Provide on/off status*` }, { quoted: msg });
    }

    args[0] = args[0].toLowerCase();
    try {
        if (args[0] === 'off') {
            sock.groupSettingUpdate(from, 'announcement');
            sendMessageWTyping(from, { text: `✅ *Only admins can send messages*` }, { quoted: msg });
        } else if (args[0] === 'on') {
            sock.groupSettingUpdate(from, 'not_announcement');
            sendMessageWTyping(from, { text: `✅ *All members can send messages*` }, { quoted: msg });
        } else {
            return sendMessageWTyping(from, { text: `❌ *Provide the right arguments*` }, { quoted: msg });
        }
    } catch (err) {
        sendMessageWTyping(from, { text: err.toString() }, { quoted: msg });
        console.error(err);
    }
};

module.exports.command = () => ({ cmd: ["chat"], handler })
