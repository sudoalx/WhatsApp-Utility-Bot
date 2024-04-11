const mdClient = require("../../../mongodb");
mdClient.connect();

const group = mdClient.db("MyBotDataDB").collection("Groups");

const whitelistCountry = async (groupJid, country) => {
    try {
        const res = await group.findOne({ _id: groupJid });
        if (!country) return res.countryExclusive || [];
        if (res == null) {
            return [];
        } else {
            let countryExclusive = res.countryExclusive || [];
            const index = countryExclusive.findIndex(c => c === country);
            if (index === -1) {
                countryExclusive.push(country);
            }
            // Update the document with the modified array
            await group.updateOne({ _id: groupJid }, { $set: { countryExclusive: countryExclusive } });
            return countryExclusive;
        }
    } catch (err) {
        console.log(err);
        return [];
    }
}


const resetWhitelist = async (groupJid) => {
    // reset the countryExclusive array
    try {
        const res = await group.findOne({ _id: groupJid });
        if (res == null) {
            return [];
        } else {
            await group.updateOne({ _id: groupJid }, {
                $set: { countryExclusive: [] }
            });
            return [];
        }
    }
    catch (err) {
        console.log(err);
        return [];
    }
}


const handler = async (sock, msg, from, args, msgInfoObj) => {
    const { sendMessageWTyping } = msgInfoObj;
    const country = args[0];
    const groupJid = from;

    if (!country) {
        const countryExclusive = await whitelistCountry(groupJid, country);
        sendMessageWTyping(from, {
            text: `❌ *Error:* Country code not provided\n*Syntax:* ${process.env.PREFIX}whitelist <country code>\n*Example:* ${process.env.PREFIX}whitelist 1\nTo reset the whitelist, use ${process.env.PREFIX}whitelist reset\n*Current whitelist:* ${countryExclusive.length === 0 ? "None" : countryExclusive.join(", ")}\n\nTo get the list of country codes, visit: https://countrycode.org/`
        }, { quoted: msg });
        return;
    }

    if (country === "reset") {
        try {
            const countryExclusive = await resetWhitelist(groupJid);
            sendMessageWTyping(from, {
                text: `Reset whitelist\nCurrent whitelist: ${countryExclusive.length === 0 ? "None" : countryExclusive.join(", ")}`
            }, { quoted: msg });
        } catch (err) {
            console.log(err);
            sendMessageWTyping(from, {
                text: `❌ *Error:* ${err.toString()}`
            }, { quoted: msg });
        }
        return;
    }

    try {
        const countryExclusive = await whitelistCountry(groupJid, country);
        sendMessageWTyping(from, {
            text: `*Whitelisted country:* ${country}\n*Current whitelist:* ${countryExclusive.join(", ")}`
        }, { quoted: msg });
    } catch (err) {
        console.log(err);
        sendMessageWTyping(from, {
            text: `❌ *Error:* ${err.toString()}`
        }, { quoted: msg });
    }

};

module.exports.command = () => ({ cmd: ["whitelist"], handler });
