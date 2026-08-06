const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.ts');
let content = fs.readFileSync(serverPath, 'utf8');

const appSettingsTable = \
    // Create app_settings table (Single Row Config)
    await runQuery(\\\
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
    \\\, [], "app_settings table creation");
    
    // Seed default settings row if it doesn't exist
    await runQuery(\\\
      INSERT INTO app_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
    \\\, [], "app_settings default seed");

    // Create announcements table
    await runQuery(\\\
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    \\\, [], "announcements table creation");
\;

// Add status column to success_stories if it doesn't exist.
const addStatusCol = \
    // Ensure success_stories has status column
    await runQuery(\\\
      ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
    \\\, [], "success_stories status column addition");
\;

content = content.replace(/\/\/ Create success_stories table/g, appSettingsTable + '\n' + addStatusCol + '\n    // Create success_stories table');

fs.writeFileSync(serverPath, content, 'utf8');
console.log('Tables added to server.ts');
