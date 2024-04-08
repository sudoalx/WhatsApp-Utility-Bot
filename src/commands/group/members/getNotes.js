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

const handler = async (sock, msg, from, args, msgInfoObj) => {
    try {
        const groupNotes = await getListsOfNotes(from);
        const allNotes = "*🗒️ List of Notes*\n" + groupNotes.map(
            note => '- ' + '```' + note.title + '```'
        ).join("\n")
        sock.sendMessage(from, {
            text: `${allNotes}\n\nTo get a note, send: *${process.env.PREFIX}get <note title>*
            `
        }, { quoted: msg });
    } catch (err) {
        console.log(err);
        sock.sendMessage(from, {
            text: "❌ Error occurred while fetching notes"
        }, { quoted: msg });
    }
};

module.exports.command = () => ({ cmd: ["notes"], handler });
