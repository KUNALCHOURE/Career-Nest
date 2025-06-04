import ApiError from '../utils/Apierror.js';
import asynchandler from '../utils/asynchandler.js';
import jwt from 'jsonwebtoken';
import User from '../models/users.models.js';

const verifyJWT = asynchandler(async (req, res, next) => {
  try {
   
    console.log("Cookies in Request:", req.cookies);
    console.log("Access Token from Cookies:", req.cookies?.accesstoken);
    console.log("Authorization Header:", req.header("Authorization"));

   
    const token =
      req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request. Token not provided.");
    }

    
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("Decoded Token:", decodedToken);

    // Find user by ID from decoded token
    const foundUser = await User.findById(decodedToken?._id).select("-password -refreshtoken");

    if (!foundUser) {
      throw new ApiError(401, "Invalid access token. User not found.");
    }

    // Attach user to request object for downstream use (like logout)
    req.user = foundUser;

    // Proceed to next middleware or route handler
    next();

  } catch (err) {
    throw new ApiError(401, err?.message || "Invalid access token");
  }
});

export { verifyJWT };
