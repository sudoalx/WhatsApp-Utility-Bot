const { reactToMessage } = require("../../../utils/sendReaction");

const handler = async (sock, msg, from, args, msgInfoObj) => {
    const { sendMessageWTyping, evv } = msgInfoObj;
    reactToMessage(from, sock, msg, "🔄");
    if (!args[0]) return sendMessageWTyping(from, { text: 'Provide name.' }, { quoted: msg });
    try {
        await sock.groupUpdateSubject(from, evv);
        await sendMessageWTyping(from, { text: `✅ Group name changed to ${args.join(" ")}` }, { quoted: msg });
        reactToMessage(from, sock, msg, "✅");
    } catch (err) {
        reactToMessage(from, sock, msg, "❌");
        sendMessageWTyping(from, { text: `❌ Error changing group name: ${err}` }, { quoted: msg });
    }
}

module.exports.command = () => ({ cmd: ['setname', "rename"], handler });