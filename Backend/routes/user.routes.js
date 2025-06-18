import { Router } from "express";
import { verifyJWT } from "../middleware/authmiddleware.js";
import { login, register, logoutuser,getcurrectuser } from "../controllers/user.controllers.js"

const route = Router();


route.post("/register", register);
route.post("/login", login);
route.post("/logout", verifyJWT, logoutuser);
route.route("/current-user").get(verifyJWT,getcurrectuser);
export default route;
