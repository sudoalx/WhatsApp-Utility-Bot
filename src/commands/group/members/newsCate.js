const handler = async (sock, msg, from, args, msgInfoObj) => {
    const { prefix, sendMessageWTyping } = msgInfoObj;
    const typeOfNews = ['world', 'national', 'business', 'sports', 'politics', 'technology', 'startup', 'entertainment', 'miscellaneous', 'hatke', 'science', 'automobile'];

    sendMessageWTyping(from, {
        text: typeOfNews.map((e, i) => `${i + 1}. ${e}`).join("\n"),
    }, { quoted: msg });
}

module.exports.command = () => ({ cmd: ["categories", "cate"], handler })