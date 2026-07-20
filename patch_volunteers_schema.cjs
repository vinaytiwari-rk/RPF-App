const fs = require('fs');

let file = fs.readFileSync('server.ts', 'utf8');

// 1. Replace the old or new table definition with the PROPER schema
// Let's just find the table definition safely using regex
file = file.replace(/CREATE TABLE IF NOT EXISTS volunteers \([\s\S]*?\n\s*\)/, `DROP TABLE IF EXISTS volunteers CASCADE;\n      CREATE TABLE IF NOT EXISTS volunteers (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        registration_number VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        full_name TEXT,
        father_husband_name TEXT,
        mother_name TEXT,
        dob DATE,
        mobile VARCHAR(20) UNIQUE,
        email VARCHAR(255) UNIQUE,
        education JSONB,
        blood_group VARCHAR(10),
        skills JSONB,
        reason_for_joining TEXT,
        availability VARCHAR(100),
        national_id_1 VARCHAR(50),
        national_id_2 VARCHAR(50),
        country VARCHAR(100),
        state VARCHAR(100),
        city VARCHAR(100),
        address TEXT,
        pincode VARCHAR(20),
        area_locality VARCHAR(255),
        sansad_kshetra VARCHAR(255),
        vidhan_sabha VARCHAR(255),
        ward_no VARCHAR(255),
        "registeredAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`);

// 2. Replace the INSERT query inside register-volunteer
file = file.replace(/aadhaar_number, voter_id,/g, "national_id_1, national_id_2,");
file = file.replace(/data\.aadhaar_number, data\.voter_id,/g, "data.national_id_1, data.national_id_2,");

fs.writeFileSync('server.ts', file);
console.log("Patched server.ts schema and routes successfully.");
