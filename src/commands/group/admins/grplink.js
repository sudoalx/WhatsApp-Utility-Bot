const handler = async (sock, msg, from, args, msgInfoObj) => {
    const { groupAdmins, sendMessageWTyping } = msgInfoObj;

    if (!groupAdmins.includes(msgInfoObj.botPhoneJid)) {
        return sendMessageWTyping(from, { text: `❌ I'm not an admin here` }, { quoted: msg });
    }

    try {
        const gc_invite_code = await sock.groupInviteCode(from);
        const gc_link = `https://chat.whatsapp.com/${gc_invite_code}`;
        sock.sendMessage(from, { text: gc_link, detectLinks: true }, { quoted: msg });
    } catch (err) {
        sendMessageWTyping(from, { text: err.toString() }, { quoted: msg });
        console.error(err);
    }
};

module.exports.command = () => ({ cmd: ["link"], handler });
