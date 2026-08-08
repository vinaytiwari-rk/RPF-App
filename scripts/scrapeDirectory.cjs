const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/rp_foundation',
});

// A robust initial dataset of Government and Emergency Directories
// Derived from india.gov.in and other public sources
const SEED_DATA = [
  { category: 'Helplines', name: 'National Emergency Number', contact: '112', title: 'Emergency Response Support System (ERSS)', description: 'Pan-India single emergency number for Police, Fire, and Ambulance.' },
  { category: 'Helplines', name: 'Police', contact: '100', title: 'Local Police Helpline', description: 'Immediate police assistance.' },
  { category: 'Helplines', name: 'Fire', contact: '101', title: 'Fire Brigade', description: 'Fire emergency services.' },
  { category: 'Helplines', name: 'Ambulance', contact: '102', title: 'Medical Emergency Ambulance', description: 'Immediate medical transport.' },
  { category: 'Helplines', name: 'Disaster Management', contact: '108', title: 'National Disaster Management', description: 'Disaster management services.' },
  { category: 'Helplines', name: 'Women Helpline', contact: '1091', title: 'Women in Distress', description: 'Dedicated helpline for women facing domestic violence or harassment.' },
  { category: 'Helplines', name: 'Child Helpline', contact: '1098', title: 'Childline India', description: 'Support and assistance for children in distress.' },
  { category: 'Helplines', name: 'Senior Citizen Helpline', contact: '14567', title: 'Elderline', description: 'National helpline for senior citizens.' },
  { category: 'Helplines', name: 'Kisan Call Centre', contact: '1800-180-1551', title: 'Farmer Support Helpline', description: 'Free agricultural advice and grievance redressal for farmers.' },
  { category: 'Helplines', name: 'Cyber Crime Helpline', contact: '1930', title: 'National Cyber Crime Reporting Portal', description: 'To report financial cyber frauds and crimes.' },
  
  { category: 'Ministries', name: 'Ministry of Agriculture', contact: '011-23382651', title: 'Department of Agriculture & Farmers Welfare', description: 'Krishi Bhawan, New Delhi' },
  { category: 'Ministries', name: 'Ministry of Health', contact: '011-23061063', title: 'Ministry of Health and Family Welfare', description: 'Nirman Bhawan, New Delhi' },
  { category: 'Ministries', name: 'Ministry of Education', contact: '011-23386451', title: 'Department of School Education & Literacy', description: 'Shastri Bhawan, New Delhi' },
  { category: 'Ministries', name: 'Ministry of Women and Child Development', contact: '011-23387683', title: 'WCD Secretariat', description: 'Shastri Bhawan, New Delhi' },
  { category: 'Ministries', name: 'Ministry of Rural Development', contact: '011-23388622', title: 'Rural Development Dept', description: 'Krishi Bhawan, New Delhi' },
  
  { category: 'Public Utilities', name: 'AIIMS New Delhi', contact: '011-26588500', title: 'All India Institute of Medical Sciences', description: 'Ansari Nagar, New Delhi' },
  { category: 'Public Utilities', name: 'Indian Railways Enquiry', contact: '139', title: 'RailMadad', description: 'Integrated Railway Helpline' },
  { category: 'Public Utilities', name: 'UIDAI (Aadhaar)', contact: '1947', title: 'Aadhaar Helpdesk', description: 'Toll-free number for Aadhaar related queries.' },
  { category: 'Public Utilities', name: 'Election Commission', contact: '1950', title: 'Voter Helpline', description: 'Election and Voter ID assistance.' },
  { category: 'Public Utilities', name: 'Consumer Protection', contact: '1915', title: 'National Consumer Helpline', description: 'Grievance registration for consumers.' }
];

async function seedDirectory() {
  console.log("Starting Directory Seeding Process...");
  let inserted = 0;
  
  try {
    for (const item of SEED_DATA) {
      // Check if it already exists to avoid duplicates
      const check = await pool.query('SELECT id FROM directory_services WHERE name = $1 AND contact = $2', [item.name, item.contact]);
      
      if (check.rows.length === 0) {
        await pool.query(
          `INSERT INTO directory_services (category, name, contact, title, description, status) 
           VALUES ($1, $2, $3, $4, $5, 'active')`,
          [item.category, item.name, item.contact, item.title, item.description]
        );
        inserted++;
      }
    }
    
    console.log(`✅ Successfully seeded ${inserted} new directory records!`);
    console.log(`Total records in fallback set: ${SEED_DATA.length}`);
  } catch (err) {
    console.error("❌ Error during seeding:", err);
  } finally {
    pool.end();
  }
}

seedDirectory();
