const getGroupAdmins = (groupMembers) =>
    groupMembers
        .filter(
            (member) =>
                member.admin === 'admin' || member.admin === 'superadmin'
        )
        .map((admin) => admin.id);

try {
    fs.rmSync('./baileys_auth_info/creds.json', {
        recursive: true,
        force: true,
    });
    fs.rmSync('./baileys_store_multi.json', {
        recursive: true,
        force: true,
    });
} catch (error) {
    console.log('Local auth files already deleted');
}

module.exports = {
    getGroupAdmins,
};