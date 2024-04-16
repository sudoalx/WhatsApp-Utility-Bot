require('dotenv').config()
const mongoClient = require('./mongodb');
const fs = require('fs')
const util = require('util')
const readdir = util.promisify(fs.readdir)
const express = require('express')
const P = require('pino')
const NodeCache = require('node-cache')


const app = express()

app.use(express.urlencoded({ extended: true }))

const port = process.env.PORT || 8888

app.get('/', (req, res) => {
    res.send({
        message: 'Bot is running... :)',
        timestamp: new Date(),
    })
})

app.listen(port, () => {
    console.log('\nWeb-server running!\n');

    const hostUrl = process.env.HOST_URL || '';

    if (hostUrl !== '') {
        const axios = require('axios');
        console.log('Pinging server every 15 minutes:', hostUrl);

        const intervalId = setInterval(() => {
            axios.get(hostUrl)
                .then((response) => {
                    console.log('Initial self-request successful:', response.data.timestamp);
                })
                .catch((error) => {
                    console.error('Initial self-request error:', error.message);
                    clearInterval(intervalId);
                });
        }, 900000); // 15 minutes in milliseconds
    }
});

const {
    default: makeWASocket,
    delay,
    DisconnectReason,
    fetchLatestBaileysVersion,
    useMultiFileAuthState,
    makeInMemoryStore,
    makeCacheableSignalKeyStore,
    isJidBroadcast,
} = require('@whiskeysockets/baileys')

const cache = new NodeCache()
const msgRetryCounterMap = new NodeCache()
const logger = P({ level: 'silent' })
const store = makeInMemoryStore({ logger: logger })
store?.readFromFile('./baileys_store_multi.json')
const interval2 = setInterval(() => {
    store?.writeToFile('./baileys_store_multi.json')
}, 10000),
    {
        createMembersData,
        getMemberData,
        member,
    } = require('./mongo-DB/membersDataDb'),
    { createGroupData, getGroupData, group } = require('./mongo-DB/groupDataDb'),
    { getBotData, createBotData, bot } = require('./mongo-DB/botDataDb'),
    { stickerForward, forwardGroup } = require('./utils/stickerForward')
const { getGroupAdmins } = require('./utils/getGroupAdmins')

const LOGS_CHANNEL = process.env.LOGS_CHANNEL ?? myNumber
const myNumber = process.env.myNumber + '@s.whatsapp.net',
    prefix = process.env.PREFIX || '/',
    moderatos = [
        '' + process.env.myNumber,
        '' + process.env.botNumber,
    ]


let commandsPublic = {},
    commandsMembers = {},
    commandsAdmins = {},
    commandsOwners = {}

const addCommands = async () => {
    async function loadCommands(directory, commandsObject) {
        const files = await readdir(directory);
        for (const file of files) {
            if (file.endsWith('.js')) {
                const { command } = require(directory + file);
                const { cmd, handler } = command();
                for (const cmdName of cmd) {
                    commandsObject[cmdName] = handler;
                }
            }
        }
    }

    await loadCommands('./commands/public/', commandsPublic);
    await loadCommands('./commands/group/members/', commandsMembers);
    await loadCommands('./commands/group/admins/', commandsAdmins);
    await loadCommands('./commands/owner/', commandsOwners);

    // Delete old media files
    const extensionsToDelete = ['.webp', '.jpeg', '.mp3', '.mp4', '.jpg', '.png', '.gif'];
    const directory = './';
    const files = await readdir(directory);

    files.forEach((file) => {
        const extension = file.substring(file.lastIndexOf('.'));
        if (extensionsToDelete.includes(extension)) {
            fs.unlinkSync(directory + file);
        }
    });

}


const authNameInDatabase = 'auth';
const authInfoDir = './baileys_auth_info';
const credsFilePath = `${authInfoDir}/creds.json`;
const storeFilePath = 'baileys_store_multi.json';

async function fetchAuth(action) {
    try {
        if (action === 'logout' || action === 'error') {
            await Promise.all([
                fs.rm(credsFilePath, { force: true, recursive: true }),
                fs.rm(storeFilePath, { force: true, recursive: true })
            ]);
        }

        if (!fs.existsSync(authInfoDir)) {
            console.log('Auth directory not found, creating...');
            fs.mkdir(authInfoDir);
        }

        const collection = mongoClient.db('MyBotDataDB').collection('AuthTable');
        let data = await collection.findOne({ _id: authNameInDatabase });

        if (!data) {
            console.log('Auth not found in the database');
            await collection.insertOne({ _id: authNameInDatabase, sessionAuth: '' });
            data = { sessionAuth: '' };
        }

        let sessionAuth = data.sessionAuth;

        if (sessionAuth !== '') {
            sessionAuth = JSON.stringify(JSON.parse(sessionAuth));
            if (action === 'start') {
                fs.writeFile(credsFilePath, sessionAuth, (err) => {
                    if (err) {
                        console.error('Error writing file:', err);
                    } else {
                        console.log('File written successfully');
                    }
                });
            } else if (action === 'reconnecting') {
                console.log('Auth already written');
            }
        } else {
            console.log('Session Auth Empty');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


async function updateLogin() {
    let collection = mongoClient.db('MyBotDataDB').collection('AuthTable');
    try {
        let authData = fs.readFileSync('baileys_auth_info/creds.json');
        authData = JSON.parse(authData);
        authData = JSON.stringify(authData);
        await collection.updateOne(
            { _id: authNameInDatabase },
            { $set: { sessionAuth: authData } }
        );
    } catch (error) {
        console.log('Error updating the database:', error);
    }
}


const startSock = async (connectionType) => {
    await addCommands()

    const { version, isLatest } =
        await fetchLatestBaileysVersion()

    console.log(
        `Using version: ${version.join('.')}, latest: ${isLatest}\n`
    )

    console.log('ConnectionType:', connectionType)
    await fetchAuth(connectionType)

    const { state: authState, saveCreds: saveAuthCreds } =
        await useMultiFileAuthState('baileys_auth_info');

    const socket = makeWASocket({
        version: version,
        logger: logger,
        printQRInTerminal: true,
        auth: {
            creds: authState.creds,
            keys: makeCacheableSignalKeyStore(authState.keys, logger),
        },
        msgRetryCounterMap: msgRetryCounterMap,
        generateHighQualityLinkPreview: true,
        shouldIgnoreJid: (jid) => isJidBroadcast(jid),
        getMessage: getMessage,
    });

    store?.bind(socket.ev);

    let updateInterval = setInterval(() => {
        updateLogin();
    }, 30000);


    const sendTypingIndicator = async (jid, message, options) => {
        await socket.presenceSubscribe(jid);
        await delay(500);
        await socket.sendPresenceUpdate('composing', jid);
        await delay(2000);
        await socket.sendPresenceUpdate('paused', jid);
        await socket.sendMessage(jid, message, {
            ...options,
            mediaUploadTimeoutMs: 3600000,
        });
    }
    const createMockMessage = (chat, content) => {
        return {
            key: {
                remoteJid: chat.id,
                fromMe: false,
                id: '810B5GH29EE7481fakeid',
                participant: '0@s.whatsapp.net',
            },
            messageTimestamp: 1122334455,
            pushName: 'WhatsApp',
            message: { conversation: content },
        }
    }
    const messagesArray = []
    const messageProcessingInterval = setInterval(async () => {
        if (messagesArray.length > 0) {
            processMessage(messagesArray.shift())
        }
    }, 500)
    const processMessage = async (incomingUser) => {
        const sendMessageWithMentions = async (messageText) => {

            try {
                await socket.sendMessage(LOGS_CHANNEL, {
                    text: messageText,
                    mentions: incomingUser.message.extendedTextMessage
                        ? incomingUser.message.extendedTextMessage.contextInfo.mentionedJid
                        : '',
                });
            } catch (error) {
                console.log('Error sending message:', error);
            }
        };

        const remoteJid = incomingUser.key.remoteJid;
        const messageJson = JSON.stringify(incomingUser.message);
        const messageType = Object.keys(incomingUser.message)[0];
        messageType === 'stickerMessage' &&
            forwardGroup != '' &&
            stickerForward(socket, incomingUser, remoteJid)
        let userId = socket.user.id
        userId = userId.includes(':')
            ? userId.split(':')[0] + '@s.whatsapp.net'
            : userId
        let messageContent;

        switch (messageType) {
            case 'conversation':
                messageContent = incomingUser.message.conversation;
                break;
            case 'imageMessage':
                messageContent = incomingUser.message.imageMessage?.caption || '';
                break;
            case 'videoMessage':
                messageContent = incomingUser.message.videoMessage?.caption || '';
                break;
            case 'extendedTextMessage':
                messageContent = incomingUser.message.extendedTextMessage?.text || '';
                break;
            case 'buttonsResponseMessage':
                messageContent = incomingUser.message.buttonsResponseMessage?.selectedDisplayText || '';
                break;
            case 'templateButtonReplyMessage':
                messageContent = incomingUser.message.templateButtonReplyMessage?.selectedDisplayText || '';
                break;
            case 'listResponseMessage':
                messageContent = incomingUser.message.listResponseMessage?.title || '';
                break;
            default:
                messageContent = '';
                break;
        }

        switch (messageType) {
            case 'buttonsResponseMessage':
                if (incomingUser.message.buttonsResponseMessage?.selectedButtonId === 'eva') {
                    messageContent = ensurePrefix(messageContent);
                }
                break;
            case 'templateButtonReplyMessage':
                if (!messageContent.startsWith(prefix)) {
                    messageContent = prefix + messageContent;
                }
                break;
            case 'listResponseMessage':
                if (incomingUser.message.listResponseMessage?.singleSelectReply?.selectedRowId === 'eva') {
                    messageContent = ensurePrefix(messageContent);
                }
                break;
            default:
                break;
        }

        function ensurePrefix(content) {
            return content.startsWith(prefix) ? content : prefix + content;
        }

        if (messageContent[1] == ' ') {
            messageContent = messageContent[0] + messageContent.slice(2)
        }
        const trimmedContent = messageContent.trim().split(/ +/).slice(1).join(' ')
        const commandReceived = messageContent.slice(1).trim().split(/ +/).shift().toLowerCase()
        const argumentsMsg = messageContent.trim().split(/ +/).slice(1)
        const isPrefixedCommand = messageContent.startsWith(prefix)

        if (
            !isPrefixedCommand &&
            (messageType == 'videoMessage' || messageType == 'stickerMessage')
        ) {
            return
        }
        const isGroupChat = remoteJid.endsWith('@g.us');
        const participantId = isGroupChat ? incomingUser.key.participant : incomingUser.key.remoteJid;
        const senderId = incomingUser.key.fromMe ? userId : participantId;
        const senderName = incomingUser.key.fromMe ? socket.user.name : incomingUser.pushName;

        if (messageType === 'conversation' || messageType === 'extendedTextMessage') {
            member.updateOne(
                { _id: senderId },
                { $inc: { totalMessages: 1 }, $set: { username: senderName } }
            );
            createMembersData(senderId, senderName);
        }

        let groupMetadata = ''
        if (
            isGroupChat &&
            (messageType == 'conversation' || messageType == 'extendedTextMessage')
        ) {
            groupMetadata = cache.get(remoteJid + ':groupMetadata')
            if (!groupMetadata) {
                groupMetadata = await socket.groupMetadata(remoteJid);
                const cacheExpiry = 3600; // Cache expiry time in seconds
                const cacheKey = remoteJid + ':groupMetadata';
                cache.set(cacheKey, groupMetadata, cacheExpiry);
                createGroupData(remoteJid, groupMetadata);
            }

            // Update member count and name if member already exists in the group
            group.updateOne(
                {
                    _id: remoteJid,
                    'members.id': senderId,
                },
                {
                    $inc: { 'members.$.count': 1 },
                    $set: { 'members.$.name': senderName },
                }
            )
                .then((result) => {
                    // If no match found, add the member to the group
                    if (result.matchedCount === 0) {
                        group.updateOne(
                            { _id: remoteJid },
                            {
                                $push: {
                                    members: {
                                        id: senderId,
                                        name: senderName,
                                        count: 1,
                                    },
                                },
                            }
                        );
                    }
                });

            // Increment total message count for the group
            group.updateOne({ _id: remoteJid }, { $inc: { totalMsgCount: 1 } });

        }
        incomingUser.message.extendedTextMessage &&
            incomingUser.message.extendedTextMessage.contextInfo?.mentionedJid ==
            userId &&
            socket.sendMessage(
                remoteJid,
                { sticker: fs.readFileSync('./media/tag.webp') },
                { quoted: incomingUser }
            )
        // Extract phone number from participantId
        const incomingPhoneNumber = participantId.includes(':')
            ? participantId.split(':')[0]
            : participantId.split('@')[0];

        const memberData = await getMemberData(participantId)
        const groupData = isGroupChat ? await getGroupData(remoteJid) : ''

        if (isGroupChat && messageType === 'imageMessage' && groupData?.isAutoStickerOn && incomingUser.message.imageMessage.caption === '') {
            console.log('Sticker Created');
            commandsPublic.sticker(socket, incomingUser, remoteJid, argumentsMsg, {
                senderJid: participantId,
                type: messageType,
                content: messageJson,
                isGroup: isGroupChat,
                sendMessageWTyping: sendTypingIndicator,
                evv: trimmedContent,
            });
        }

        if (memberData?.isBlock) {
            return
        }

        // Check if the message type is conversation or extended text message
        if (['conversation', 'extendedTextMessage'].includes(messageType)) {
            // Extract the command from the message content
            const command = messageContent.split(' ')[0].toLowerCase();
            // Check if the command is 'eva' or 'gemini'
            if (['eva', 'gemini'].includes(command)) {
                // Check if the user is blocked
                if (memberData?.isBlock) {
                    return sendMessageWithMentions('User Blocked: ' + participantId);
                }
                // Check if the chat bot is enabled in the group
                const isChatBotEnabled = groupData?.isChatBotOn || false;
                // Execute the command if the chat bot is enabled
                if (isChatBotEnabled) {
                    commandsPublic.eva(socket, incomingUser, remoteJid, argumentsMsg, {
                        evv: trimmedContent,
                        sendMessageWTyping: sendTypingIndicator,
                        isGroup: isGroupChat,
                    });
                }
            }
        }


        if (!isPrefixedCommand) {
            return
        }

        await socket.readMessages([incomingUser.key])
        const groupAdmins = isGroupChat ? getGroupAdmins(groupMetadata.participants) : ''
        const isGroupAdmin = groupAdmins.includes(participantId) || false



        const messageInfo = {
            prefix,
            type: messageType,
            content: messageJson,
            evv: trimmedContent,
            command: commandReceived,
            isGroup: isGroupChat,
            senderJid: participantId,
            groupMetadata,
            groupAdmins,
            botNumberJid: userId,
            sendMessageWTyping: sendTypingIndicator,
            ownerSend: sendMessageWithMentions,
        };

        console.log(
            '[COMMAND]',
            commandReceived,
            '[FROM]',
            incomingPhoneNumber,
            '[name]',
            incomingUser.pushName,
            '[IN]',
            isGroupChat ? groupMetadata.subject : 'DM',
            '[JID]',
            remoteJid
        )

        sendMessageWithMentions(
            '\uD83D\uDCDD: ' +
            prefix +
            commandReceived +
            ' by ' +
            incomingUser.pushName +
            '(+' +
            incomingPhoneNumber +
            ') in ' +
            (isGroupChat ? groupMetadata.subject : 'DM') + ' (' + remoteJid + ')'
        )

        if (isGroupChat) {
            let isBotEnabled = groupData ? await groupData.isBotOn : false;

            if (
                !isBotEnabled &&
                !(commandReceived.startsWith('group') || commandReceived.startsWith('dev') || commandReceived.startsWith('authorize'))
            ) {
                return sendTypingIndicator(remoteJid, {
                    text:
                        '```The bot is disabled by default\nAsk the owner to activate.\n\nUse ```' +
                        prefix +
                        'dev',
                });
            }

            let blockedCommands = await groupData?.cmdBlocked;

            if (commandReceived !== '') {
                if (blockedCommands.includes(commandReceived)) {
                    return sendTypingIndicator(
                        remoteJid,
                        { text: 'Command disabled for this group.' },
                        { quoted: incomingUser }
                    );
                }
            }
        }

        if (commandsPublic[commandReceived]) {
            return commandsPublic[commandReceived](
                socket,
                incomingUser,
                remoteJid,
                argumentsMsg,
                messageInfo
            )
        } else if (commandsMembers[commandReceived]) {
            return isGroupChat || incomingUser.key.fromMe
                ? commandsMembers[commandReceived](
                    socket,
                    incomingUser,
                    remoteJid,
                    argumentsMsg,
                    messageInfo
                )
                : sendTypingIndicator(
                    remoteJid,
                    {
                        text: '```\u274C This command only works on group chats!```',
                    },
                    { quoted: incomingUser }
                )
        } else if (commandsAdmins[commandReceived]) {
            if (!isGroupChat) {
                return sendTypingIndicator(
                    remoteJid,
                    {
                        text: '```\u274C This command only works on group chats!```',
                    },
                    { quoted: incomingUser }
                )
            } else {
                return isGroupAdmin || moderatos.includes(incomingPhoneNumber)
                    ? commandsAdmins[commandReceived](
                        socket,
                        incomingUser,
                        remoteJid,
                        argumentsMsg,
                        messageInfo
                    )
                    : sendTypingIndicator(
                        remoteJid,
                        { text: '```\uD83E\uDD2D You are not an admin!```' },
                        { quoted: incomingUser }
                    )
            }
        } else {
            // Check if the command exists in the owner's commands
            const ownerCommandExists = commandsOwners[commandReceived];

            if (ownerCommandExists) {
                // Check if the sender is a moderator or the owner
                const isModeratorOrOwner = moderatos.includes(incomingPhoneNumber) || myNumber == participantId;

                if (isModeratorOrOwner) {
                    // Execute the owner's command
                    return commandsOwners[commandReceived](
                        socket,
                        incomingUser,
                        remoteJid,
                        argumentsMsg,
                        messageInfo
                    );
                } else {
                    // Send a message indicating that the user is not the owner
                    return sendTypingIndicator(
                        remoteJid,
                        { text: '```\uD83E\uDD2D You are not the owner!```' },
                        { quoted: incomingUser }
                    );
                }
            } else {
                // Send a message indicating that the command is invalid
                return sendTypingIndicator(
                    remoteJid,
                    {
                        text:
                            '' +
                            incomingUser.pushName +
                            ', you issued an invalid command! See available commands: ' + '```' +
                            prefix +
                            'help ```',
                    },
                    { quoted: incomingUser }
                );
            }

        }
    }

    socket.ev.process(async (event) => {
        if (event['connection.update']) {
            const connectionUpdateEvent = event['connection.update'];
            const { connection, lastDisconnect } = connectionUpdateEvent;
            if (connection === 'close') {
                console.log(
                    lastDisconnect.error.output.statusCode,
                    DisconnectReason.loggedOut
                )
                if (lastDisconnect.error.output.statusCode == DisconnectReason.loggedOut) {
                    try {
                        let directory = './baileys_auth_info/';
                        let files = await readdir(directory);
                        files.forEach((file) => {
                            fs.unlinkSync(directory + file);
                        });
                    } catch { }
                    clearInterval(updateInterval)
                    clearInterval(interval2)
                    startSock('logout')
                } else if (lastDisconnect.error.output.statusCode == 515) {
                    startSock('reconnecting')
                } else {
                    lastDisconnect.error.output.statusCode == 403
                        ? startSock('error')
                        : startSock()
                }
            }
            console.log('connection update', connectionUpdateEvent)
        }

        event['creds.update'] && (await saveAuthCreds())

        if (event['messages.upsert']) {
            const upsertEvent = event['messages.upsert'];
            for (const message of upsertEvent.messages) {
                if (!message.message) {
                    return;
                }
                messagesArray.push(message);
            }
        }

        if (event['groups.upsert']) {
            const groupUpsertEvent = event['groups.upsert'];
            createGroupData(groupUpsertEvent[0].id, socket.groupMetadata(groupUpsertEvent[0].id));
            group.updateOne({ _id: groupUpsertEvent[0].id }, { $set: { isBotOn: false } });
            await socket.sendMessage(groupUpsertEvent[0].id, {
                text: '*Thank you for adding me to this group.*\n*If you want to use this bot, ask the owner to enable it. Send: ' + prefix + 'dev* for help',
            });
            try {
                const groupId = groupUpsertEvent[0].id;
                cache.del(groupId + ':groupMetadata');
            } catch (err) {
                console.log(err);
            }
        }

        if (event['groups.update']) {
            const groupsUpdateEvent = event['groups.update'];
            try {
                console.log('[groups.update]');
                const groupId = groupsUpdateEvent[0].id;
                cache.del(groupId + ':groupMetadata');
            } catch (error) {
                console.log(error);
            }
        }

        if (event['group-participants.update']) {
            const updateEvent = event['group-participants.update'];
            let groupChat = await getGroupData(updateEvent.id);
            cache.del(updateEvent.id + ':groupMetadata');
            if (updateEvent.action == 'add') {
                if (groupChat.welcome != '') {
                    updateEvent.participants.forEach((participant) => {
                        socket.sendMessage(
                            updateEvent.id,
                            {
                                text:
                                    'Welcome @' +
                                    participant.split('@')[0] +
                                    '\n\n' +
                                    groupChat.welcome,
                                mentions: [participant],
                            },
                            {
                                quoted: createMockMessage(
                                    updateEvent,
                                    'Welcome to ' + groupChat.grpName
                                ),
                            }
                        );
                    });
                }

                // Check if the group is country exclusive
                if (groupChat.countryExclusive.length > 0) {
                    const participant = updateEvent.participants[0];
                    const allowedCountries = groupChat.countryExclusive.join(', ');

                    // Check if the participant's country is allowed
                    if (!groupChat.countryExclusive.some(country => participant.startsWith(country))) {
                        // If not allowed, remove the participant
                        await socket.groupParticipantsUpdate(updateEvent.id, [participant], 'remove');

                        // Send a message indicating the country restriction
                        await socket.sendMessage(
                            updateEvent.id,
                            { text: `❌ Only people from the following countries are allowed in this group: ${allowedCountries}` },
                            { quoted: createMockMessage(updateEvent, `Only people from the following countries are allowed in this group: ${allowedCountries}`) }
                        );
                    }
                }


                socket.sendMessage(myNumber, {
                    text:
                        '*Action:* ' +
                        updateEvent.action +
                        '\n*Group:* ' +
                        updateEvent.id +
                        '\n*Group Name:* ' +
                        (groupChat?.grpName || 'Unknown') +
                        '\n*Participants:* ' +
                        updateEvent.participants[0],
                });
            } else {
                socket.sendMessage(myNumber, {
                    text:
                        '*Action:* ' +
                        updateEvent.action +
                        '\n*Group:* ' +
                        updateEvent.id +
                        '\n*Group Name:* ' +
                        (groupChat?.grpName || 'Unknown') +
                        '\n*Participants:* ' +
                        updateEvent.participants[0],
                });
            }
            console.log(updateEvent);
        }

    })
    return socket
    async function getMessage(messageInfo) {
        if (store) {
            const message = await store.loadMessage(messageInfo.remoteJid, messageInfo.id);
            return message?.message || undefined;
        }
        return proto.Message.fromObject({});
    }
}

startSock('start')
process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at: ', promise, 'reason:', reason);
});

process.on('uncaughtException', function (error) {
    console.log(error);
});
