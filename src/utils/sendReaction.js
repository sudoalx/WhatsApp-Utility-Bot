const reactToMessage = async (from, sock, msg, emoji) => {
    const reactonMessage = {
        react: {
            text: emoji,
            key: msg.key
        }
    }
    return sock.sendMessage(from, reactonMessage);
}

module.exports = {
    reactToMessage
}