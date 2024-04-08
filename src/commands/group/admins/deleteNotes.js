const mdClient = require("../../../mongodb");
mdClient.connect();

const group = mdClient.db("MyBotDataDB").collection("Groups");

const deleteAllNotes = async (groupJid, note) => {

    try {
        const res = await group.findOne({ _id: groupJid });
        if (res == null) {
            return [];
        } else {
            // delete all notes by setting notes to an empty array
            await group.updateOne({ _id: groupJid }, {
                $set: { notes: [] }
            });
        }
    } catch (err) {
        console.log(err);
        return [];
    }
}

const handler = async (sock, msg, from, args, msgInfoObj) => {
    const title = args[0];
    try {
        await deleteAllNotes(from, title);
        sock.sendMessage(from, {
            text: "✅ All notes deleted successfully"
        }, { quoted: msg });
    } catch (err) {
        console.log(err);
        sock.sendMessage(from, {
            text: "❌ Error occurred while deleting notes"
        }, { quoted: msg });
    }
};

module.exports.command = () => ({ cmd: ["deleteall"], handler });
