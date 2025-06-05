import { Router } from "express";
import { verifyJWT } from "../middleware/authmiddleware.js";
import { login, register, logoutuser } from "../controlllers/user.controllers.js"

const route = Router();


route.post("/register", register);
route.post("/login", login);


route.post("/logout", verifyJWT, logoutuser);

export default route;
