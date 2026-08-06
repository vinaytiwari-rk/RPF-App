const fs = require('fs');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (let i = 0; i < replacements.length; i++) {
        content = content.replace(replacements[i][0], replacements[i][1]);
    }
    fs.writeFileSync(filePath, content);
}

replaceInFile('D:/rp-foundation/src/context/AuthContext.tsx', [
    [/value=\{\{\s+user,\s+isLoading,/g, "value={{\n        token,\n        user,\n        isLoading,"]
]);

replaceInFile('D:/rp-foundation/src/context/AppContext.tsx', [
    [/refreshData,\n\s+\}\}/g, "refreshData,\n        notifications: [],\n      }}"]
]);

replaceInFile('D:/rp-foundation/src/pages/GodAdminPanel.tsx', [
    [/if \(!user \|\| user\.role !== 'superadmin'\)/g, "if (!user || (user.role as string !== 'superadmin' && user.role as string !== 'super_admin' && user.role as string !== 'admin'))"]
]);

replaceInFile('D:/rp-foundation/src/pages/GodAdminPanelOld.tsx', [
    [/if \(!user \|\| user\.role !== 'superadmin'\)/g, "if (!user || (user.role as string !== 'superadmin' && user.role as string !== 'super_admin' && user.role as string !== 'admin'))"]
]);
