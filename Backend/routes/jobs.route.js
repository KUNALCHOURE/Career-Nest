import { Router } from "express";
import { getalljob, fetchAndStoreJobs, getJobById } from "../controllers/job.controllers.js";

const router = Router();

// Route to get all jobs with filters and pagination
router.route("/jobs").get(getalljob);

// Route to fetch and store jobs from external API
router.route("/jobs/fetch-and-store").post(fetchAndStoreJobs);

// Route to get a single job by ID
router.route("/jobs/:jobId").get(getJobById);

export default router; 