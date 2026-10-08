CREATE TABLE IF NOT EXISTS system_configs (
    config_key VARCHAR(255) PRIMARY KEY,
    config_value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Default Values
INSERT INTO system_configs (config_key, config_value) VALUES 
('splash_logo', ''),
('splash_bg_color', '#FFFFFF'),
('splash_text', 'Samahit Seva'),
('founder_name', 'Rohit Pandit'),
('founder_image_url', ''),
('foundation_logo', ''),
('marquee_type', 'rss'),
('marquee_rss_url', 'https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=3&reg=48'),
('marquee_custom_text', 'Welcome to Samahit Seva App'),
('thought_type', 'rss'),
('thought_rss_url', 'https://mpinfo.org/RSSFeed/RSSFeed_News.xml'),
('thought_custom_text', 'Daily thought goes here.'),
('panchang_api_key', ''),
('drik_panchang_active', 'true'),
('weather_api_key', ''),
('weather_active', 'true')
ON CONFLICT (config_key) DO NOTHING;
