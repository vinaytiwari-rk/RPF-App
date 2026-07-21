import { Router } from "express";
import { getServiceContent, updateServiceContent } from "../controllers/adminHqController.js";

const router = Router();

// GET /api/admin/hq/services/:serviceId/content
router.get("/services/:serviceId/content", getServiceContent);

// POST /api/admin/hq/services/:serviceId/content
router.post("/services/:serviceId/content", updateServiceContent);

export default router;
