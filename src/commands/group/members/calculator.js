const math = require("mathjs");
const { reactToMessage } = require("../../../utils/sendReaction");


const handler = async (sock, msg, from, args, msgInfoObj) => {
    // react to the message with a loading indicator
    await reactToMessage(from, sock, msg, "🔄");

    const calc = args.join(" ");
    try {
        const result = math.evaluate(calc);
        await reactToMessage(from, sock, msg, "✅");
        sock.sendMessage(from, { text: `📊 ${calc} = ${result}` }, { quoted: msg });
    } catch (err) {
        console.error(err);
        await reactToMessage(from, sock, msg, "❌");
        sock.sendMessage(from, { text: "❌ Error while calculating. Please check your input." }, { quoted: msg });
    }
}

module.exports.command = () => ({ cmd: ["calculator", "calc"], handler });