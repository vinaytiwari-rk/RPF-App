import express from "express";

const router = express.Router();

// Phase 1 governance guard: legacy announcement CRUD bypassed the
// Draft -> Review -> Publish lifecycle. All announcement content must now
// use /api/admin/content with content_type=announcement.
router.all("/api/admin/announcements", (_req, res) => {
  return res.status(410).json({
    success: false,
    error: "Legacy announcement endpoint retired. Use governed content workflow.",
  });
});

router.all("/api/admin/announcements/:id", (_req, res) => {
  return res.status(410).json({
    success: false,
    error: "Legacy announcement endpoint retired. Use governed content workflow.",
  });
});

export default router;
