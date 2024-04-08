module.exports.command = () => {
    let cmd = ["dev", "source"];
    return { cmd, handler };
}

const handler = async (sock, msg, from, args, msgTnfoObj) => {
    const { sendMessageWTyping } = msgTnfoObj;
    sendMessageWTyping(from,
        {
            text: `Contact me: https://t.me/sudoalx`,
        },
        { quoted: msg });
}