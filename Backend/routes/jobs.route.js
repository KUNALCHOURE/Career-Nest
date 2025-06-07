import { Router } from "express";
import { getalljob } from "../controlllers/job.controllers.js";
const route=Router();

route.get('/jobs',getalljob);

export default route;