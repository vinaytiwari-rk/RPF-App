const fs = require('fs');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (let i = 0; i < replacements.length; i++) {
        content = content.replace(replacements[i][0], replacements[i][1]);
    }
    fs.writeFileSync(filePath, content);
}

replaceInFile('D:/rp-foundation/src/context/AppContext.tsx', [
    [/refreshData,\n\s+\}\}/g, "refreshData,\n        notifications: [],\n      }}"]
]);

replaceInFile('D:/rp-foundation/src/pages/GodAdminPanel.tsx', [
    [/if \(!user \|\| \(user\.role as string\) !== 'superadmin' && \(user\.role as string\) !== 'super_admin' && \(user\.role as string\) !== 'admin'\) \{/g, "if (!user || ((user.role as unknown as string) !== 'superadmin' && (user.role as unknown as string) !== 'super_admin' && (user.role as unknown as string) !== 'admin')) {"],
    [/if \(!user \|\| user\.role !== 'superadmin'\) \{/g, "if (!user || ((user.role as unknown as string) !== 'superadmin' && (user.role as unknown as string) !== 'super_admin' && (user.role as unknown as string) !== 'admin')) {"]
]);

replaceInFile('D:/rp-foundation/src/pages/GodAdminPanelOld.tsx', [
    [/if \(!user \|\| \(user\.role as string\) !== 'superadmin' && \(user\.role as string\) !== 'super_admin' && \(user\.role as string\) !== 'admin'\) \{/g, "if (!user || ((user.role as unknown as string) !== 'superadmin' && (user.role as unknown as string) !== 'super_admin' && (user.role as unknown as string) !== 'admin')) {"],
    [/if \(!user \|\| user\.role !== 'superadmin'\) \{/g, "if (!user || ((user.role as unknown as string) !== 'superadmin' && (user.role as unknown as string) !== 'super_admin' && (user.role as unknown as string) !== 'admin')) {"]
]);

replaceInFile('D:/rp-foundation/src/pages/VolunteerDashboard.tsx', [
    [/user\.badges\.length > 0/g, "user.badges > 0"]
]);

replaceInFile('D:/rp-foundation/src/routes/volunteerRoutes.ts', [
    [/points: dbUser\.points/g, "points: typeof dbUser.points === 'number' ? dbUser.points : 0"]
]);
