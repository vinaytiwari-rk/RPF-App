const fs = require('fs');
let c = fs.readFileSync('src/routes/donationRoutes.ts', 'utf8');

c = 'import { sendPushNotification } from "../utils/fcm.js";\n' + c;

// Fix the first query where it sends a notification for blood request
c = c.replace(
  /for\(const match of matches\.rows\)await pool\.query\(`INSERT INTO app_notifications\(id,recipient_id,title,message,type,reference_id\) VALUES\(\$1,\$2,\$3,\$4,'blood_request',\$5\)`,\s*\[crypto\.randomUUID\(\), match\.volunteer_id,'Blood Request Matching Your Group',`\${group} blood is required at \${request\.hospital_name}\. Tap to view and Accept if you are ready to donate\.`,request\.id\]\);/g,
  `for(const match of matches.rows) {
    const title = 'Urgent: Blood Request (' + group + ')';
    const body = group + ' blood is required at ' + request.hospital_name + '. Tap to Accept.';
    await pool.query(\`INSERT INTO app_notifications(id,recipient_id,title,message,type,reference_id) VALUES($1,$2,$3,$4,'blood_request',$5)\`, [crypto.randomUUID(), match.volunteer_id, title, body, request.id]);
    
    // Check if user has fcm_token
    const t = await pool.query('SELECT fcm_token FROM volunteers WHERE id=$1', [match.volunteer_id]);
    if (t.rows[0]?.fcm_token) {
      await sendPushNotification(t.rows[0].fcm_token, title, body);
    }
  }`
);

// Fix the second query where it sends a notification for blood acceptance
c = c.replace(
  /await pool\.query\(`INSERT INTO app_notifications\(id,recipient_id,title,message,type,reference_id\) VALUES\(\$1,\$2,\$3,\$4,'blood_acceptance',\$5\)`,\s*\[crypto\.randomUUID\(\), request\.requester_id,'Blood Request Accepted',`\${volunteer\.full_name\|\|'A volunteer'} has accepted your \${request\.blood_group} blood request\.`,String\(request\.id\)\]\);/g,
  `const title = 'Blood Request Accepted';
   const body = (volunteer.full_name || 'A volunteer') + ' has accepted your ' + request.blood_group + ' blood request.';
   await pool.query(\`INSERT INTO app_notifications(id,recipient_id,title,message,type,reference_id) VALUES($1,$2,$3,$4,'blood_acceptance',$5)\`, [crypto.randomUUID(), request.requester_id, title, body, String(request.id)]);
   
   // Check if user has fcm_token
   const t2 = await pool.query('SELECT fcm_token FROM volunteers WHERE id=$1', [request.requester_id]);
   if (t2.rows[0]?.fcm_token) {
     await sendPushNotification(t2.rows[0].fcm_token, title, body);
   }`
);

fs.writeFileSync('src/routes/donationRoutes.ts', c);
