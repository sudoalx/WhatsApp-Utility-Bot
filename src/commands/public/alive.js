
const reactToMessage = async (from, sock, msg, emoji) => {
    const reactonMessage = {
        react: {
            text: emoji,
            key: msg.key
        }
    }
    return sock.sendMessage(from, reactonMessage);
}

const handler = async (sock, msg, from, args, msgInfoObj) => {
    const { sendMessageWTyping } = msgInfoObj;
    await reactToMessage(from, sock, msg, "🔄");
    const uptime = process.uptime();
    // Response time calculation
    const start = process.hrtime();
    const diff = process.hrtime(start);
    const responseTime = (diff[0] * 1e9 + diff[1]) / 1e6;
    const response = `*🎾 Pong!*\n\n*Response Time:* ${responseTime.toFixed(2)}ms\n*Uptime:* ${uptime.toFixed(2)}s`;
    return sendMessageWTyping(from, { text: response }, { quoted: msg });
};

module.exports.command = () => ({ cmd: ["alive", "ping"], handler });