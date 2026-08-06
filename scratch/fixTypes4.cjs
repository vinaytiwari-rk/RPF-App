const fs = require('fs');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (let i = 0; i < replacements.length; i++) {
        content = content.replace(replacements[i][0], replacements[i][1]);
    }
    fs.writeFileSync(filePath, content);
}

replaceInFile('D:/rp-foundation/src/context/AppContext.tsx', [
    [/refreshData: fetchAllData,/g, "refreshData: fetchAllData,\n        notifications: [],"]
]);

replaceInFile('D:/rp-foundation/src/pages/GodAdminPanel.tsx', [
    [/if \(!user \|\| \(user\.role !== 'admin' && user\.role !== 'super_admin' && user\.role !== 'superadmin'\)\) \{/g, "if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {"]
]);

replaceInFile('D:/rp-foundation/src/pages/GodAdminPanelOld.tsx', [
    [/if \(!user \|\| \(user\.role !== 'superadmin' && user\.role !== 'super_admin' && user\.role !== 'admin'\)\) \{/g, "if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {"]
]);
