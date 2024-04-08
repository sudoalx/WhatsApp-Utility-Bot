module.exports.command = () => {
    let cmd = ["delete", "d", "dd"];
    return { cmd, handler };
}

const handler = async (sock, msg, from, args, msgInfoObj) => {
    let { botNumberJid, sendMessageWTyping, groupAdmins, senderJid } = msgInfoObj;

    try {

        if (!msg.message.extendedTextMessage) {
            return sendMessageWTyping(from, { text: `❌ Tag a message of to delete.` }, { quoted: msg });
        }

        if (!(msg.message.extendedTextMessage.contextInfo.participant == botNumberJid)) {

            if (!groupAdmins.includes(senderJid))
                return sendMessageWTyping(from, { text: `❌ Only admins can delete others' message` }, { quoted: msg });

            if (!groupAdmins.includes(botNumberJid))
                return sendMessageWTyping(from, { text: `❌ Bot needs to be an admin in order to delete others' messages` }, { quoted: msg });
        }

        let options = {
            remoteJid: from,
            fromMe: false,
            id: msg.message.extendedTextMessage.contextInfo.stanzaId,
            participant: msg.message.extendedTextMessage.contextInfo.participant
        }

        if ((msg.message.extendedTextMessage.contextInfo.participant == botNumberJid)) {
            options.remoteJid = botNumberJid;
            options.fromMe = true;
        }

        sock.sendMessage(
            from,
            { delete: options }
        )

    } catch (err) {
        console.log(err);
        sendMessageWTyping(from, { text: err.toString() }, { quoted: msg });
    }
}