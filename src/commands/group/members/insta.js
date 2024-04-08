const snapsave = require("insta-downloader");

const handler = async (sock, msg, from, args, msgInfoObj) => {
    const { prefix, sendMessageWTyping, ig } = msgInfoObj;

    if (args.length === 0) return sendMessageWTyping(from, { text: `❌ URL is empty! \nSend ${prefix}insta url` }, { quoted: msg });
    let urlInsta = args[0];

    if (!(urlInsta.includes("instagram.com/p/") ||
        urlInsta.includes("instagram.com/reel/") ||
        urlInsta.includes("instagram.com/tv/")))
        return sendMessageWTyping(from,
            { text: `❌ Wrong URL! Only Instagram posted videos, tv and reels can be downloaded.` },
            { quoted: msg }
        );

    if (urlInsta.includes("?")) urlInsta = urlInsta.split("/?")[0];
    console.log(urlInsta);
    snapsave(urlInsta).then(async res => {

        if (res.status) {
            const data = [...new Set(res.data.map(item => item.url))];
            for (const element of data) {

                setTimeout(() => {
                    const url = element;
                    if (url.includes("jpg") || url.includes("png") || url.includes("jpeg") || url.includes("webp")) {
                        sock.sendMessage(from,
                            { image: { url: url } },
                            { quoted: msg }
                        );
                    } else {
                        sock.sendMessage(from,
                            { video: { url: url } },
                            { quoted: msg }
                        );
                    }
                }, 1000 * 1);
            }
        } else {
            sendMessageWTyping(from, { text: "No Data Found!!" }, { quoted: msg });
        }
    })
}

module.exports.command = () => ({ cmd: ["insta", "i"], handler });