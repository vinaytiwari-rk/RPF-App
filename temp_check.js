        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "grievances table creation");

    // Add audioUrl, videoUrl, and imageUrl columns to grievances if not exists
    await runQuery('ALTER TABLE grievances ADD COLUMN IF NOT EXISTS "audioUrl" TEXT', [], "grievance audioUrl migration");
    await runQuery('ALTER TABLE grievances ADD COLUMN IF NOT EXISTS "videoUrl" TEXT', [], "grievance videoUrl migration");
    await runQuery('ALTER TABLE grievances ADD COLUMN IF NOT EXISTS "imageUrl" TEXT', [], "grievance imageUrl migration");
    await runQuery('ALTER TABLE grievances ADD COLUMN IF NOT EXISTS "date" TEXT', [], "grievance date migration");
    await runQuery('ALTER TABLE grievances ADD COLUMN IF NOT EXISTS "aiSummary" TEXT', [], "grievance aiSummary migration");

    // Create service_submissions_v2 table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS service_submissions_v2 (
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
    `, [], "service_submissions_v2 table creation");

    // Create health_vitals table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS health_vitals (
        user_id VARCHAR(255) PRIMARY KEY,
        steps INTEGER DEFAULT 0,
        water_cups INTEGER DEFAULT 0,
        calories INTEGER DEFAULT 0,
        exercise_mins INTEGER DEFAULT 0,
        weight NUMERIC DEFAULT 0,
        height NUMERIC DEFAULT 0,
        bmi NUMERIC DEFAULT 0,
        sleep_hours NUMERIC DEFAULT 0,
        heart_rate INTEGER DEFAULT 72,
        sleep_cycle VARCHAR(100) DEFAULT '7h 15m',
        period_day INTEGER DEFAULT 12,
        pregnancy_week INTEGER DEFAULT 8,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "health_vitals table creation");

    // Create medications table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS medications (
        id UUID PRIMARY KEY,
        user_id VARCHAR(255),
        name TEXT,
        alarm_time VARCHAR(50),
        taken BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "medications table creation");

    // Create pediatric_profile table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS pediatric_profile (
        user_id VARCHAR(255) PRIMARY KEY,
        child_age VARCHAR(50),
        child_weight VARCHAR(50),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "pediatric_profile table creation");

    // Create vaccine_status table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS vaccine_status (
        id UUID PRIMARY KEY,
        user_id VARCHAR(255),
        vaccine_name TEXT,
        done BOOLEAN DEFAULT false,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, vaccine_name)
      )
    `, [], "vaccine_status table creation");

    // Create event_rsvps table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS event_rsvps (
        user_id VARCHAR(255),
        event_title TEXT,
        registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (user_id, event_title)
      )
    `, [], "event_rsvps table creation");

    // Create volunteers table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS volunteers (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        registration_number VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        full_name TEXT,
        avatar TEXT,
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
        approval_status VARCHAR(50) DEFAULT 'pending',
        
        "registeredAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "volunteers table creation");

    // Create job_applications table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id UUID PRIMARY KEY,
        "jobId" TEXT,
        "jobTitle" TEXT,
        "fullName" TEXT,
        phone TEXT,
        resume TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "job_applications table creation");

    // Create blood_donors table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS blood_donors (
        id UUID PRIMARY KEY,
        name TEXT,
        "bloodGroup" TEXT,
        phone TEXT,
        location TEXT,
        verified BOOLEAN DEFAULT true,
        distance TEXT,
        "lastDonated" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "blood_donors table creation");

    // Create card_applications_v2 table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS card_applications_v2 (
        id UUID PRIMARY KEY, "userId" VARCHAR(255),
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
    `, [], "card_applications_v2 table creation");

    // Create donations table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS donations (
        id SERIAL PRIMARY KEY,
        "userId" VARCHAR(255),
        "donorName" TEXT NOT NULL,
        "donorEmail" TEXT,
        amount DECIMAL(10, 2) NOT NULL,
        "campaignId" INTEGER,
        "transactionId" VARCHAR(255) UNIQUE,
        status TEXT DEFAULT 'success',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "donations table creation");

    // Create volunteer_tasks table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS volunteer_tasks (
        id SERIAL PRIMARY KEY,
        "volunteerId" VARCHAR(255) NOT NULL,
        "titleEn" TEXT NOT NULL,
        "titleHi" TEXT NOT NULL,
        "descriptionEn" TEXT,
        "descriptionHi" TEXT,
        points INTEGER DEFAULT 10,
        status TEXT DEFAULT 'assigned',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "volunteer_tasks table creation");
    // Create passkeys table (WebAuthn credentials)
    await runQuery(`
      CREATE TABLE IF NOT EXISTS passkeys (
        "credentialID" TEXT PRIMARY KEY,
        "publicKey" TEXT NOT NULL,
        counter INTEGER NOT NULL,
        "userId" VARCHAR(255) NOT NULL
      )
    `, [], "passkeys table creation");

    // Create street_ratings table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS street_ratings (
        id SERIAL PRIMARY KEY,
        location_name TEXT NOT NULL,
        latitude NUMERIC NOT NULL,
        longitude NUMERIC NOT NULL,
        rating INTEGER CHECK (rating BETWEEN 1 AND 5),
        notes TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "street_ratings table creation");

    // Create women_complaints table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS women_complaints (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        complainant_name TEXT,
        complainant_phone TEXT,
        complaint_type TEXT NOT NULL,
        incident_date TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT NOT NULL,
        suspect_details TEXT,
        is_anonymous BOOLEAN DEFAULT FALSE,
        status TEXT DEFAULT 'Pending Review',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "women_complaints table creation");

    // Create app_settings table (Single Row Config)
    await runQuery(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        splash_animation TEXT DEFAULT 'fade',
        splash_logo TEXT DEFAULT '/assets/logo.png',
        splash_duration INTEGER DEFAULT 2000,
        login_bg_image TEXT DEFAULT '/assets/login-bg.jpg',
        social_login_enabled BOOLEAN DEFAULT false,
        marquee_text TEXT DEFAULT 'Welcome to RP Foundation Jan Seva App',
        marquee_speed INTEGER DEFAULT 2,
        marquee_color TEXT DEFAULT '#ffffff',
        marquee_bg_color TEXT DEFAULT '#000080',
        primary_color TEXT DEFAULT '#000080',
        secondary_color TEXT DEFAULT '#ff9933',
        font_family TEXT DEFAULT 'Inter',
        hero_type TEXT DEFAULT 'carousel',
        hero_media_url TEXT DEFAULT '',
        show_widgets BOOLEAN DEFAULT true,
        show_notices BOOLEAN DEFAULT true,
        founder_image TEXT DEFAULT '/assets/founder.jpg',
        founder_message TEXT DEFAULT 'Together we can make a difference.'
      )
    `, [], "app_settings table creation");
    
    // Seed default settings row if it doesn't exist
    await runQuery(`
      INSERT INTO app_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
    `, [], "app_settings default seed");

    // Create announcements table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "announcements table creation");

    // Create success_stories table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS success_stories (
        id UUID PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        "imageUrl" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status VARCHAR(50) DEFAULT 'pending'
      )
    `, [], "success_stories table creation");

    
    // Create scholarships table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS scholarships (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "scholarships table creation");

    // Create food_support table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS food_support (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "food_support table creation");

    // Create medicine_support table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS medicine_support (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "medicine_support table creation");

    // Create education_aid table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS education_aid (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "education_aid table creation");

    // Create senior_citizens table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS senior_citizens (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "senior_citizens table creation");

    // Create animal_welfare table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS animal_welfare (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "animal_welfare table creation");

    // Create environment table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS environment (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "environment table creation");

    // Create religious_culture table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS religious_culture (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "religious_culture table creation");

    // Create disaster_management table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS disaster_management (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "disaster_management table creation");

    // Create farmer_support table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS farmer_support (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "farmer_support table creation");

    // Create government_schemes table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS government_schemes (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "government_schemes table creation");

    // Create skills_training table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS skills_training (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "skills_training table creation");

    // Create global_guide table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS global_guide (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "imageUrl" TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "global_guide table creation");

    // Create blogs table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS blogs (
        id UUID PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        "authorName" TEXT NOT NULL,
        "authorId" VARCHAR(255) NOT NULL,
        approved BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "publishedAt" TIMESTAMP WITH TIME ZONE
      )
    `, [], "blogs table creation");



    // Seed default social posts if empty
    try {
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
            `INSERT INTO social_posts (id, author, role, avatar, "textEn", "textHi", image, likes, "commentsCount", liked, platform, link) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [crypto.randomUUID(), p.author, p.role, p.avatar, p.textEn, p.textHi, p.image, p.likes, p.commentsCount, p.liked, p.platform, p.link]
          );
        }
      }
    } catch (e) {
      console.warn("Seeding social posts failed:", e);
    }

    // Create blood_banks table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS blood_banks (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        pincode TEXT,
        stock_a_plus INTEGER DEFAULT 10,
        stock_a_minus INTEGER DEFAULT 5,
        stock_b_plus INTEGER DEFAULT 12,
        stock_b_minus INTEGER DEFAULT 4,
        stock_ab_plus INTEGER DEFAULT 8,
        stock_ab_minus INTEGER DEFAULT 2,
        stock_o_plus INTEGER DEFAULT 15,
        stock_o_minus INTEGER DEFAULT 6
      )
    `, [], "blood_banks table creation");

    // Create blood_requests table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS blood_requests (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        blood_group VARCHAR(10) NOT NULL,
        component_type VARCHAR(50) NOT NULL,
        quantity INTEGER NOT NULL,
        urgency VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        doctor_name TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "blood_requests table creation");

    // Create blood_appointments table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS blood_appointments (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        blood_bank_id VARCHAR(255) NOT NULL,
        appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
        blood_group VARCHAR(10),
        status VARCHAR(20) DEFAULT 'Scheduled',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "blood_appointments table creation");

    // Create rto_vehicles table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS rto_vehicles (
        plate_number VARCHAR(50) PRIMARY KEY,
        owner_name VARCHAR(255) NOT NULL,
        vehicle_model VARCHAR(255),
        registration_date DATE,
        insurance_validity DATE,
        fitness_validity DATE,
        fuel_type VARCHAR(50),
        rto_code VARCHAR(50),
        status VARCHAR(50) DEFAULT 'ACTIVE',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "rto_vehicles table creation");

    // Create family tracking tables
    await runQuery(`
      CREATE TABLE IF NOT EXISTS family_groups (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        invite_code VARCHAR(50) UNIQUE,
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "family_groups table creation");

    await runQuery(`
      CREATE TABLE IF NOT EXISTS family_members (
        id VARCHAR(255) PRIMARY KEY,
        group_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(group_id, user_id)
      )
    `, [], "family_members table creation");

    await runQuery(`
      CREATE TABLE IF NOT EXISTS member_locations (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        battery_level INTEGER,
        is_charging BOOLEAN,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "member_locations table creation");

    // Create fuel_logs table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS fuel_logs (
        id UUID PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        odometer INTEGER NOT NULL,
        liters NUMERIC NOT NULL,
        price_per_liter NUMERIC NOT NULL,
        total_cost NUMERIC NOT NULL,
        fill_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "fuel_logs table creation");

    await runQuery(`
      CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        instructor VARCHAR(255) NOT NULL,
        youtube_id VARCHAR(255) NOT NULL,
        duration VARCHAR(50),
        views INTEGER DEFAULT 0
      )
    `, [], "courses table creation");

    await runQuery(`
      CREATE TABLE IF NOT EXISTS mock_test_scores (
        id UUID PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        test_category VARCHAR(255) NOT NULL,
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        date_taken TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "mock_test_scores table creation");

    await runQuery(`
      CREATE TABLE IF NOT EXISTS library_books (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        views INTEGER DEFAULT 0
      )
    `, [], "library_books table creation");

    await client.query(`
      CREATE TABLE IF NOT EXISTS job_listings (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        type VARCHAR(255) NOT NULL,
        salary VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, [], "job_listings table creation");

    await client.query(`
      CREATE TABLE IF NOT EXISTS panchang_calendar (
        date VARCHAR(255) PRIMARY KEY,
        tithi VARCHAR(255) NOT NULL,
        nakshatra VARCHAR(255) NOT NULL,
        sunrise VARCHAR(255) NOT NULL,
        sunset VARCHAR(255) NOT NULL,
        moonrise VARCHAR(255) NOT NULL,
        moonset VARCHAR(255) NOT NULL,
        festivals TEXT
      )
    `, [], "panchang_calendar table creation");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, [], "chat_history table creation");

    // Seed default blood banks if table is empty
    try {
      const bankCount = await client.query("SELECT COUNT(*) FROM blood_banks");
      if (parseInt(bankCount.rows[0].count, 10) === 0) {
        console.log("Seeding default blood banks...");
        const DEFAULT_BANKS = [
          {
            id: "bank_bhopal_redcross",
            name: "Bhopal Red Cross Blood Bank",
            email: "bhopal.redcross@bloodbank.org",
            phone: "+91-755-2550108",
            address: "Link Road No. 1, near Shivaji Nagar",
            city: "Bhopal",
            state: "Madhya Pradesh",
            pincode: "462016",
            stock_a_plus: 15, stock_a_minus: 3, stock_b_plus: 22, stock_b_minus: 5,
            stock_ab_plus: 8, stock_ab_minus: 1, stock_o_plus: 28, stock_o_minus: 7
          },
          {
            id: "bank_indore_civil",
            name: "Indore Central Blood Bank",
            email: "indore.civil@bloodbank.org",
            phone: "+91-731-2430200",
            address: "MY Hospital Campus, Residency Area",
            city: "Indore",
            state: "Madhya Pradesh",
            pincode: "452001",
            stock_a_plus: 12, stock_a_minus: 4, stock_b_plus: 18, stock_b_minus: 3,
            stock_ab_plus: 5, stock_ab_minus: 2, stock_o_plus: 20, stock_o_minus: 5
          },
          {
            id: "bank_sehore_public",
            name: "Sehore District Hospital Blood Bank",
            email: "sehore.hospital@bloodbank.org",
            phone: "+91-756-2224444",
            address: "District Hospital, Main Road",
            city: "Sehore",
            state: "Madhya Pradesh",
            pincode: "466001",
            stock_a_plus: 8, stock_a_minus: 2, stock_b_plus: 10, stock_b_minus: 2,
            stock_ab_plus: 3, stock_ab_minus: 1, stock_o_plus: 12, stock_o_minus: 3
          }
        ];
        for (const b of DEFAULT_BANKS) {
          await client.query(
            `INSERT INTO blood_banks (id, name, email, phone, address, city, state, pincode, stock_a_plus, stock_a_minus, stock_b_plus, stock_b_minus, stock_ab_plus, stock_ab_minus, stock_o_plus, stock_o_minus) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
            [b.id, b.name, b.email, b.phone, b.address, b.city, b.state, b.pincode, b.stock_a_plus, b.stock_a_minus, b.stock_b_plus, b.stock_b_minus, b.stock_ab_plus, b.stock_ab_minus, b.stock_o_plus, b.stock_o_minus]
          );
        }
      }
    } catch (e) {
      console.warn("Seeding blood banks failed:", e);
    }