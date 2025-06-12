import { Router } from "express";
import { upload } from "../middleware/multermiddlewaare.js";
import { verifyJWT } from "../middleware/authmiddleware.js";
import {
    addResume,
    analyzewithoutjd,
    deleteResume,
    getResume,
    updateResumeStatus
} from "../controlllers/resume.controllers.js";

const router = Router();
router.use(verifyJWT);
router.post("/add", upload.single("resume"), addResume);
router.delete("/delete", deleteResume);
router.get("/get", getResume);
router.patch("/update-status", updateResumeStatus);
router.post("/analyze-resume-witoutJD",analyzewithoutjd);
router.post("/analyze-resume-withJD",analyzewithoutjd);

export default router;
