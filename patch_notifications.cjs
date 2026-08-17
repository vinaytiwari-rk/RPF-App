const fs = require('fs');
let c = fs.readFileSync('src/routes/donationRoutes.ts', 'utf8');

const newEndpoint = `
router.get('/api/blood-network/notifications', async (req, res) => {
  try {
    await ensureBloodSchema();
    const volunteerId = String(req.query.recipientId || '');
    if (!volunteerId) return res.json({ success: true, notifications: [] });
    const result = await pool.query('SELECT * FROM app_notifications WHERE recipient_id=$1 ORDER BY created_at DESC LIMIT 50', [volunteerId]);
    res.json({ success: true, notifications: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Unable to load notifications' });
  }
});
`;

c = c.replace('export default router;', newEndpoint + '\nexport default router;');

fs.writeFileSync('src/routes/donationRoutes.ts', c);
