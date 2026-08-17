const fs = require('fs');
let c = fs.readFileSync('src/routes/donationRoutes.ts', 'utf8');

c = c.replace(/id UUID PRIMARY KEY DEFAULT gen_random_uuid\(\)/g, 'id VARCHAR(36) PRIMARY KEY');

c = c.replace(
  /INSERT INTO app_notifications\(recipient_id,title,message,type,reference_id\) VALUES\(\$1,\$2,\$3,'blood_request',\$4\)`,\s*\[match.volunteer_id/g,
  "INSERT INTO app_notifications(id,recipient_id,title,message,type,reference_id) VALUES($1,$2,$3,$4,'blood_request',$5)`, [crypto.randomUUID(), match.volunteer_id"
);

c = c.replace(
  /INSERT INTO blood_request_acceptances\(request_id,volunteer_id,status,expires_at\) VALUES\(\$1,\$2,'accepted',NOW\(\)\+INTERVAL '24 hours'\) ON CONFLICT\(request_id,volunteer_id\) DO UPDATE SET status='accepted',expires_at=NOW\(\)\+INTERVAL '24 hours'\)`,\s*\[request.id,\s*volunteer.id\]/g,
  "INSERT INTO blood_request_acceptances(id,request_id,volunteer_id,status,expires_at) VALUES($1,$2,$3,'accepted',NOW()+INTERVAL '24 hours') ON CONFLICT(request_id,volunteer_id) DO UPDATE SET status='accepted',expires_at=NOW()+INTERVAL '24 hours'`, [crypto.randomUUID(), request.id, volunteer.id]"
);

c = c.replace(
  /INSERT INTO app_notifications\(recipient_id,title,message,type,reference_id\) VALUES\(\$1,\$2,\$3,'blood_acceptance',\$4\)`,\s*\[request.requester_id/g,
  "INSERT INTO app_notifications(id,recipient_id,title,message,type,reference_id) VALUES($1,$2,$3,$4,'blood_acceptance',$5)`, [crypto.randomUUID(), request.requester_id"
);

fs.writeFileSync('src/routes/donationRoutes.ts', c);
