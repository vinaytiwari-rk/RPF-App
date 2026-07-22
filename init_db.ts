
// =============================================================================

async function initDatabase() {
  let client;
  try {
    console.log("Initializing local PostgreSQL schema...");
    client = await pool.connect();
    // gen_random_uuid() is built-in since PG 13 — no extension needed
    
    // Drop tables that may have wrong column casing from previous failed init
    const tablesToRecreate = ["social_posts", "campaigns", "jobs", "health_camps", "grievances", "service_submissions", "job_applications", "blood_donors", "card_applications"];
    for (const table of tablesToRecreate) {
      await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    }
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        role TEXT DEFAULT 'citizen',
        points INTEGER DEFAULT 0,
        badges INTEGER DEFAULT 0,
        "janSevaCardStatus" TEXT DEFAULT 'none',
        "janSevaCardNo" TEXT DEFAULT '',
        "isVolunteer" BOOLEAN DEFAULT false,
        "isDonor" BOOLEAN DEFAULT false,
        "onboardingCompleted" BOOLEAN DEFAULT false,
        "registeredAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create settings table
    await client.query(`
      
        CREATE TABLE IF NOT EXISTS settings (
          id VARCHAR(255) PRIMARY KEY,
          name TEXT,
          email TEXT,
          phone TEXT,
          role TEXT DEFAULT 'citizen',
          "tollFree" TEXT,
          "webUrl" TEXT,
          "founderMessageEn" TEXT,
          "founderMessageHi" TEXT
        )
      `);

      // Ensure otps table has enough space for emails
      try {
        await pool.query('ALTER TABLE otps ALTER COLUMN phone TYPE VARCHAR(255)');
      } catch(e) {
        // Table might not exist yet
      }


    // Create social_posts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS social_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        author TEXT,
        role TEXT,
        avatar TEXT,
        "textEn" TEXT,
        "textHi" TEXT,
        image TEXT,
        likes INTEGER DEFAULT 0,
        "commentsCount" INTEGER DEFAULT 0,
        liked BOOLEAN DEFAULT false,
        platform TEXT,
        link TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create campaigns table
    await client.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "titleEn" TEXT,
        "titleHi" TEXT,
        "goalAmount" NUMERIC DEFAULT 0,
        "raisedAmount" NUMERIC DEFAULT 0,
        "imageUrl" TEXT,
        "coverImgUrl" TEXT,
        urgent BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create jobs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "titleEn" TEXT,
        "titleHi" TEXT,
        company TEXT,
        "locEn" TEXT,
        "locHi" TEXT,
        salary TEXT,
        "typeEn" TEXT,
        "typeHi" TEXT,
        "postedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create health_camps table
    await client.query(`
      CREATE TABLE IF NOT EXISTS health_camps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "titleEn" TEXT,
        "titleHi" TEXT,
        "dateEn" TEXT,
        "dateHi" TEXT,
        "locationEn" TEXT,
        "locationHi" TEXT,
        contact TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create camps view pointing to health_camps
    await client.query(`
      CREATE OR REPLACE VIEW camps AS 
      SELECT * FROM health_camps
    `);

    // Create grievances table
    await client.query(`
      CREATE TABLE IF NOT EXISTS grievances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT,
        description TEXT,
        category TEXT,
        urgency TEXT,
        location TEXT,
        "reportedBy" TEXT,
        status TEXT DEFAULT 'Pending',
        date TEXT,
        "aiSummary" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create service_submissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS service_submissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT,
        "serviceNameEn" TEXT,
        "serviceName" TEXT,
        "citizenName" TEXT,
        "citizenPhone" TEXT,
        "submissionData" TEXT,
        status TEXT DEFAULT 'pending',
        latitude NUMERIC,
        longitude NUMERIC,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create volunteers table
    await client.query(`
      DROP TABLE IF EXISTS volunteers CASCADE;
      CREATE TABLE IF NOT EXISTS volunteers (
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
      )
    `);

    // Create job_applications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "jobId" TEXT,
        "jobTitle" TEXT,
        "fullName" TEXT,
        phone TEXT,
        resume TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create blood_donors table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blood_donors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT,
        "bloodGroup" TEXT,
        phone TEXT,
        location TEXT,
        verified BOOLEAN DEFAULT true,
        distance TEXT,
        "lastDonated" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create card_applications table (Jan Seva Card)
    await client.query(`
      CREATE TABLE IF NOT EXISTS card_applications (
        "userId" VARCHAR(255) PRIMARY KEY,
        name TEXT,
        gender TEXT,
        dob TEXT,
        address TEXT,
        "idType" TEXT,
        "idNumber" TEXT,
        status TEXT DEFAULT 'pending',
        "cardNo" TEXT DEFAULT '',
        "submittedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Seed default social posts if empty
    const postsCount = await client.query("SELECT COUNT(*) FROM social_posts");
    if (parseInt(postsCount.rows[0].count, 10) === 0) {
      console.log("Seeding default social_posts into PostgreSQL...");
      const DEFAULT_POSTS = [
        {
          author: "Rohit Pandit",
          role: "Founder, RP Foundation",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
          textEn: "Sharing highlights from our weekend tree plantation drive in Karond, Bhopal. Over 500 saplings planted! 🌳 Let's build a greener tomorrow.",
          textHi: "करौंद, भोपाल में हमारे सप्ताहांत वृक्षारोपण अभियान की कुछ झलकियाँ। 500 से अधिक पौधे लगाए गए! 🌳 आइए एक हरित कल का निर्माण करें।",
          image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
          likes: 412,
          commentsCount: 18,
          liked: false,
          platform: "instagram",
          link: "https://www.instagram.com/therohitpandit/"
        },
        {
          author: "RP Foundation",
          role: "Official Page",
          avatar: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80",
          textEn: "Successful free eye checkup camp conducted today at Sehore district. Over 200 patients received free consultations and medicines. 🩺💙",
          textHi: "सीहोर जिला अस्पताल में आज सफल निःशुल्क नेत्र जांच शिविर आयोजित किया गया। 200 से अधिक मरीजों को निःशुल्क परामर्श और दवाएं दी गईं। 🩺💙",
          image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
          likes: 580,
          commentsCount: 34,
          liked: false,
          platform: "facebook",
          link: "https://www.facebook.com/rpfofficial"
        }
      ];
      for (const p of DEFAULT_POSTS) {
        await client.query(
          `INSERT INTO social_posts (author, role, avatar, "textEn", "textHi", image, likes, "commentsCount", liked, platform, link) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [p.author, p.role, p.avatar, p.textEn, p.textHi, p.image, p.likes, p.commentsCount, p.liked, p.platform, p.link]
        );
      }
    }

    console.log("PostgreSQL schema initialization completed successfully.");
  } catch (err: any) {
    console.error("Database connection or schema init error (non-fatal):", err.message);
  } finally {
    if (client) {
      client.release();
    }
  }
}


// =============================================================================
// AUTHENTICATION ENDPOINTS
// =============================================================================

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'appapi.therpfoundation.org',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'no-reply@appapi.therpfoundation.org',
      pass: process.env.SMTP_PASSWORD || 'therpfoundation@321',
    },
  });

  app.post("/api/auth/login-email", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !email.includes("@")) return res.status(400).json({ error: "Invalid email" });
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS otps (
          phone VARCHAR(255) PRIMARY KEY,
          otp VARCHAR(10) NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await pool.query(
        `INSERT INTO otps (phone, otp, "createdAt") VALUES ($1, $2, CURRENT_TIMESTAMP) 
         ON CONFLICT (phone) DO UPDATE SET otp = EXCLUDED.otp, "createdAt" = CURRENT_TIMESTAMP`,
        [email, otp]
      );
      
      console.log(`[EMAIL] Sending OTP for ${email} is: ${otp}`);
      
      await transporter.sendMail({
        from: '"RP Foundation" <' + (process.env.SMTP_USER || 'no-reply@appapi.therpfoundation.org') + '>',
        to: email,
        subject: "Your Jan Seva Login OTP",
        text: `Your OTP for RP Foundation Jan Seva is: ${otp}. It is valid for 10 minutes.`,
        html: `<b>Your OTP for RP Foundation Jan Seva is: <span style="color: #FF9933; font-size: 1.5em;">${otp}</span></b><br/><p>It is valid for 10 minutes.</p>`,
      });
      
      res.json({ success: true, message: "OTP sent" });
    } catch (err) {
      console.error("Email send error:", err);
      res.status(500).json({ error: err.message });
    }
  });

app.post("/api/auth/login", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length !== 10) return res.status(400).json({ error: "Invalid phone number" });
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create otps table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otps (
        phone VARCHAR(255) PRIMARY KEY,
        otp VARCHAR(10) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Save to DB (UPSERT)
    await pool.query(
      `INSERT INTO otps (phone, otp, "createdAt") VALUES ($1, $2, CURRENT_TIMESTAMP) 
       ON CONFLICT (phone) DO UPDATE SET otp = EXCLUDED.otp, "createdAt" = CURRENT_TIMESTAMP`,
      [phone, otp]
    );
        console.log(`
  ===============================
  [SMS] Sending OTP for ${phone} is: ${otp}
  ===============================
  `);
      
      try {
        const MSG91_AUTHKEY = "552233Aul3uTNSZ6a5de34bP1";
        const MSG91_SENDER = "RPFApp";
        const url = `https://control.msg91.com/api/v5/otp?authkey=${MSG91_AUTHKEY}&mobile=91${phone}&otp=${otp}&sender=${MSG91_SENDER}`;
        
        const axios = require('axios');
        await axios.get(url);
      } catch (smsErr: any) {
        console.error("MSG91 Error:", smsErr?.response?.data || smsErr.message);
      }
    
    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/verify", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const result = await pool.query('SELECT * FROM otps WHERE phone = $1 AND otp = $2', [phone, otp]);
    if (result.rows.length > 0) {
      await pool.query('DELETE FROM otps WHERE phone = $1', [phone]);
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid OTP" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
