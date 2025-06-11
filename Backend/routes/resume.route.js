import { Router } from "express";
import { upload } from "../middleware/multermiddlewaare.js";
import { verifyJWT } from "../middleware/authmiddleware.js";
import {
    addResume,
    deleteResume,
    getResume,
    updateResumeStatus
} from "../controlllers/resume.controllers.js";

const router = Router();

// Apply verifyJWT middleware to all routes
router.use(verifyJWT);

// Add resume route
router.post("/add", upload.single("resume"), addResume);

// Delete resume route
router.delete("/delete", deleteResume);

// Get resume route
router.get("/get", getResume);

// Update resume status route
router.patch("/update-status", updateResumeStatus);

export default router;
