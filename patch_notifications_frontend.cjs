const fs = require('fs');
let c = fs.readFileSync('src/pages/BloodNetwork.tsx', 'utf8');

c = c.replace('/api/notifications?recipientId=', '/api/blood-network/notifications?recipientId=');

fs.writeFileSync('src/pages/BloodNetwork.tsx', c);
