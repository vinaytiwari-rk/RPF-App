export default async function handler(req, res) {
  // CORS Headers for Mobile App Access
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action, username } = req.query;

  // Vercel Edge Caching (Cache for 1 hour to prevent API limits)
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  // ----------------------------------------
  // 1. INSTAGRAM FEED (RSS.APP BYPASS)
  // ----------------------------------------
  if (action === 'instagram') {
    try {
      const response = await fetch("https://rss.app/feeds/v1.1/laWV6LcTILOTuLNE.json");
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch Instagram feed." });
    }
  } 
  
  // ----------------------------------------
  // 2. TWITTER / X FEED (OFFICIAL API)
  // ----------------------------------------
  if (action === 'twitter') {
    const token = process.env.TWITTER_BEARER_TOKEN;
    const targetUser = username || "PIBFactCheck";

    if (!token) {
      return res.status(500).json({ error: "Twitter Bearer Token is missing in Vercel Environment Variables." });
    }

    try {
      // Step A: Get User ID by Username
      const userRes = await fetch(`https://api.twitter.com/2/users/by/username/${targetUser}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await userRes.json();

      if (!userData.data || !userData.data.id) {
        return res.status(404).json({ error: "Twitter user not found.", details: userData });
      }

      // Step B: Get Latest Tweets
      const tweetRes = await fetch(`https://api.twitter.com/2/users/${userData.data.id}/tweets?tweet.fields=created_at,text&max_results=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const tweetData = await tweetRes.json();

      return res.status(200).json(tweetData);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch Tweets.", details: error.message });
    }
  }

  return res.status(400).json({ error: "Please specify ?action=instagram or ?action=twitter" });
}
