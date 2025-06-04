import ApiError from "../utils/Apierror";
import User from "../models/user.models";
import ApiResponse from "../utils/apiresponse";
import asynchandler from "../utils/asynchandler";


const generatetokens = asynchandler(async (userid) => {
  if (!userid) {
    throw new ApiError(401, "Error while generating tokens");
  }

  const founduser = await User.findById(userid);
  if (!founduser) {
    throw new ApiError(400, "User does not exist");
  }

  const accesstoken = await founduser.generateAcessToken();
  const refreshtoken = await founduser.generateRefreshToken();

  if (!accesstoken || !refreshtoken) {
    throw new ApiError(500, "Error while generating tokens");
  }

  return { accesstoken, refreshtoken };
});


const register = asynchandler(async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    throw new ApiError(400, "All fields are required");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    throw new ApiError(400, "User already exists");
  }

  const newuser = await User.create({ username, email, password });

  if (!newuser) {
    throw new ApiError(500, "Failed to create user");
  }

  const createduser = await User.findById(newuser._id).select("-password");
  if (!createduser) {
    throw new ApiError(400, "User is not created");
  }

  ApiResponse(res, 201, createduser, "User created successfully");
});


const login = asynchandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const exists = await User.findOne({ email });
  if (!exists) {
    throw new ApiError(400, "User has not registered");
  }

  const ispasscorrect = await exists.ispasswordcorrect(password);
  if (!ispasscorrect) {
    throw new ApiError(400, "Password is not correct");
  }

  const { accesstoken, refreshtoken } = await generatetokens(exists._id);

  exists.refreshtoken = refreshtoken;
  await exists.save();

  const loggedinuser = await User.findById(exists._id).select("-password -refreshtoken");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };

  return res
    .status(200)
    .cookie("accesstoken", accesstoken, options)
    .cookie("refreshtoken", refreshtoken, options)
    .json(
      new ApiResponse(200, { user: loggedinuser, accesstoken, refreshtoken }, "User logged in successfully")
    );
});


const logoutuser = asynchandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  await User.findByIdAndUpdate(
    userId,
    { $set: { refreshtoken: undefined } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .clearCookie("accesstoken", options)
    .clearCookie("refreshtoken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { register, login, logoutuser };
