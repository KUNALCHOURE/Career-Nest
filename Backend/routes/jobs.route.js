import { Router } from "express";
import { getalljob, fetchAndStoreJobs } from "../controlllers/job.controllers.js";
const route=Router();
//we do not need to define query parameters explicitly in Express route path.
route.get('/jobs',getalljob);

route.post('/jobs/fetch-and-store', fetchAndStoreJobs);

export default route;