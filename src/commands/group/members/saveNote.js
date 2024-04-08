const mdClient = require("../../../mongodb");
mdClient.connect();

const group = mdClient.db("MyBotDataDB").collection("Groups");

const createNote = async (groupJid, note) => {
    // use title as unique identifier
    // if title already exists, update the note
    try {
        const res = await group.findOne({ _id: groupJid });
        if (res == null) {
            return [];
        } else {
            const notes = res.notes || [];
            const index = notes.findIndex(n => n.title === note.title);
            if (index === -1) {
                notes.push(note);
            } else {
                notes[index] = note;
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

const formatNotes = (notes) => {
    // the notes is an array of strings
    // the first string is the title notes[0]
    // notes[0] might contain a line break, we need to pass the content after the line break as the content and append the rest of the strings to the content
    const title = notes[0].split("\n")[0].trim();
    const content = notes[0].split("\n").slice(1).join("\n").replaceAll(" ", "") + " " + notes.slice(1).join(" ").trim();
    // the rest of the strings are the content notes[1:]
    return {
        title,
        content
    }
}

const handler = async (sock, msg, from, args, msgInfoObj) => {
    const formattedNotes = formatNotes(args)
    const { title, content } = formattedNotes;
    if (!title || !content) {
        sock.sendMessage(from, {
            text: "❌ Invalid note format. Please provide a title and content"
        }, { quoted: msg });
        return;
    }
    const note = {
        title,
        content
    };

    try {
        await createNote(from, note);
        sock.sendMessage(from, {
            text: "✅ Note saved successfully"
        }, { quoted: msg });
    } catch (err) {
        console.log(err);
        sock.sendMessage(from, {
            text: "❌ Error occurred while saving note"
        }, { quoted: msg });
    }
};

module.exports.command = () => ({ cmd: ["save"], handler });
