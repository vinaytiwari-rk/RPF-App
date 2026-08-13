import express from 'express';

const router = express.Router();

// Process-level liveness endpoint: deliberately does not touch PostgreSQL,
// authentication, or any external service so cPanel/Passenger can distinguish
// a live Node process from an application/database failure.
router.get('/api/liveness', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'rpf-app',
    timestamp: new Date().toISOString(),
  });
});

export default router;
