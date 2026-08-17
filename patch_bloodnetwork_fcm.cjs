const fs = require('fs');
let c = fs.readFileSync('src/pages/BloodNetwork.tsx', 'utf8');

c = `import { requestNotificationPermission } from '../firebase';\n` + c;

c = c.replace(
  'const join=async()=>{',
  `const join=async()=>{
    let fcmToken = '';
    try { fcmToken = await requestNotificationPermission() || ''; } catch (err) {}
  `
);

// Include fcmToken in the join request body
c = c.replace(
  `{volunteerId:id,bloodGroup:joinGroup}`,
  `{volunteerId:id,bloodGroup:joinGroup, fcmToken}`
);

fs.writeFileSync('src/pages/BloodNetwork.tsx', c);
