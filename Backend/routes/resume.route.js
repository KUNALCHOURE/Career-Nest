import { Router } from "express";
import { upload } from "../middleware/multermiddlewaare";
import addresume from "../controlllers/resume.controllers";
import {verifyJWT} from "../middleware/authmiddleware.js"
const router=Router();

router.route('/add-resume', verifyJWT, upload.single("resume"),addresume);
