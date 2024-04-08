const mdClient = require("../../../mongodb");
mdClient.connect();

const group = mdClient.db("MyBotDataDB").collection("Groups");

const getListsOfNotes = async (groupJid) => {
    try {
        const res = await group.findOne({ _id: groupJid });
        if (res == null) {
            return [];
        } else {
            return res.notes || []; // Return the notes array, or an empty array if notes are not found
        }
    } catch (err) {
        console.log(err);
        return [];
    }
};

const getNoteByTitle = async (groupJid, title) => {
    try {
        const res = await group.findOne({ _id: groupJid });
        if (res == null) {
            return null;
        } else {
            const notes = res.notes || [];
            return notes.find(n => n.title === title);
        }
    } catch (err) {
        console.log(err);
        return null;
    }
};

const handler = async (sock, msg, from, args, msgInfoObj) => {
    const noteName = args[0];
    if (!noteName) {
        sock.sendMessage(from, {
            text: `❌ Please provide note title.\n
            Check available notes by sending: *${process.env.PREFIX}notes*
            Syntax: *${process.env.PREFIX}get <note title>*`
        }, { quoted: msg });
        return;
    }
    try {
        const getNote = await getNoteByTitle(from, args[0]);
        if (getNote) {
            sock.sendMessage(from, {
                text: `*🗒️ Note: ${getNote.title}*\n${getNote.content.trim()}`
            }, { quoted: msg });
        } else {
            sock.sendMessage(from, {
                text: "❌ Note not found"
            }, { quoted: msg });
        }
    } catch (err) {
        console.log(err);
        sock.sendMessage(from, {
            text: "❌ Error occurred while fetching note"
        }, { quoted: msg });
    }
};

module.exports.command = () => ({ cmd: ["get"], handler });
