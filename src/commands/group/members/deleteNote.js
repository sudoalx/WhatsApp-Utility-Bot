const mdClient = require("../../../mongodb");
mdClient.connect();

const group = mdClient.db("MyBotDataDB").collection("Groups");

const deleteNote = async (groupJid, note) => {
    // use title as unique identifier
    // if title exists, delete the note
    try {
        const res = await group.findOne({ _id: groupJid });
        if (res == null) {
            return [];
        } else {
            const notes = res.notes || [];
            const index = notes.findIndex(n => n.title === note);
            if (index !== -1) {
                notes.splice(index, 1);
            }
            await group.updateOne({ _id: groupJid }, {
                $set: { notes }
            });
            return notes;
        }
    } catch (err) {
        console.log(err);
        return [];
    }
}

const handler = async (sock, msg, from, args, msgInfoObj) => {
    const title = args[0];
    try {
        await deleteNote(from, title);
        sock.sendMessage(from, {
            text: "✅ Note deleted successfully"
        }, { quoted: msg });
    } catch (err) {
        console.log(err);
        sock.sendMessage(from, {
            text: "❌ Error occurred while deleting note"
        }, { quoted: msg });
    }
};

module.exports.command = () => ({ cmd: ["del"], handler });
