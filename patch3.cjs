const fs = require('fs');
let c = fs.readFileSync('src/pages/BloodNetwork.tsx', 'utf8');

c = c.replace('<input required value={patientName}', '<input required placeholder="Patient Name" value={patientName}');
c = c.replace('<input required type="number" min="1" value={units}', '<input required type="number" min="1" placeholder="Units Required" value={units}');
c = c.replace('<input required value={hospitalName}', '<input required placeholder="Hospital Name & Location" value={hospitalName}');
c = c.replace('<input required value={contactPhone}', '<input required placeholder="Contact Phone Number" value={contactPhone}');
c = c.replace('<textarea value={notes}', '<textarea placeholder="Additional Notes / Details" value={notes}');

fs.writeFileSync('src/pages/BloodNetwork.tsx', c);
