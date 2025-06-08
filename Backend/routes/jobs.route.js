import { Router } from "express";
import { getalljob, fetchAndStoreJobs } from "../controlllers/job.controllers.js";
const route=Router();

route.get('/jobs',getalljob);
route.post('/jobs/fetch-and-store', fetchAndStoreJobs);

export default route;