const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

const handler = async (sock, msg, from, args, msgInfoObj) => {
    let { prefix } = msgInfoObj;

    const admin = `
---------------------------------------------------------------
    👑 *Admin Commands* 👑
---------------------------------------------------------------

${readMore}

    
*${prefix}add <phone number>*
    _Add any new member!_

*${prefix}ban <@mention>*
    _Kick a member out of the group_
    _Alias with ${prefix}remove, ${prefix}kick_

*${prefix}promote <@mention>*
    _Give admin permission to a member!_

*${prefix}demote <@mention>*
    _Remove admin privilege from a member!_

*${prefix}blockc* _commands_
    _Block command for a group_
    _${prefix}blockc insta_
    _not type all alias of insta command_

*${prefix}removec* _commands_
    _Block commands for a group_
    _${prefix}removec insta_

*${prefix}emptyc*
    _Unblock all commands_

*${prefix}rename <new-subject>*
    _Change group's subject!_

*${prefix}welcome*
    _Set a custom welcome message_
    _Default welcome message: Welcome {user} to {group Name}!_
    _Set message will show in next line by default._
    eg: Welcome {user} to {group Name}.
    Please follow the rules!
    ${prefix}welcome reset 
    _Reset default welcome message_

*${prefix}chat <on/off>*
    _Enable/disable group chat_
    _${prefix}chat on - All members can send messages_
    _${prefix}chat off - Only admins can send messages_

*${prefix}count*
    _Get message count of members_

*${prefix}link*
    _Get group's invite link_

*${prefix}warn <@mention>*
    _Give warning to a member_
    _After 3 warnings, the member will be kicked out_

*${prefix}unwarn <@mention>*
    _Remove warning from a member_
    
*${prefix}tagall*
    _Ping all members in the group_
    _Eg: ${prefix}tagall message_

*${prefix}deleteall*
    _Delete all saved notes_

*${prefix}whitelist <country code>*
    _Add country code to whitelist_
    _${prefix}whitelist +1_

ℹ️ Send *${prefix}help* to get commands list for all users`

    sock.sendMessage(from, { text: admin });
}

module.exports.command = () => ({ cmd: ["admin"], handler });