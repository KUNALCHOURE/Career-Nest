import ApiError from "../utils/ApiError.js";
import User from "../models/user.models.js";
import ApiResponse from "../utils/ApiResponse.js";
import asynchandler from "../utils/asynchandler.js";


const generatetokens = async (userid) => {
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
                           
    return {accesstoken, refreshtoken };
};


const register = asynchandler(async (req, res) => {
    // Destructure all required fields from the model
    const { email, password, username, fullname } = req.body;

    // Check for all required fields
    if ([email, password, username, fullname].some(field => !field || String(field).trim() === "")) {
        throw new ApiError(400, "All fields (email, password, username, fullname) are required");
    }

    // Check if user already exists by either email or username
    const exists = await User.findOne({
        $or: [
            { email: email },
            { username: username }
        ]
    });

    if (exists) {
        // Provide a more specific error message
        if (exists.email === email) {
            throw new ApiError(400, "User with this email already exists");
        } else {
            throw new ApiError(400, "User with this username already exists");
        }
    }

    // Create new user with all required fields
    const newuser = await User.create({
        username: username.toLowerCase(), // Ensure username is stored in lowercase as per schema
        email: email,
        password: password,
        fullname: fullname
    });
  
    console.log("register");
    if (!newuser) {
        throw new ApiError(500, "Failed to create user");
    }

    // Select all fields except password
    const createduser = await User.findById(newuser._id).select("-password");
    if (!createduser) {
        throw new ApiError(400, "User was not created, please try again.");
    }

     res.json( new ApiResponse( 201, createduser, "User Registered  successfully"));
});


const login = asynchandler(async (req, res) => {
    // Allow login with either username or email
    const { identifier, password } = req.body; // Using 'identifier' to represent either username or email
   console.log("login in");
    if (!identifier || !password) {
        throw new ApiError(400, "Identifier (username or email) and password are required");
    }

    // Find user by either username or email
    const exists = await User.findOne({
        $or: [
            { username: identifier.toLowerCase() }, // Convert to lowercase for username check
            { email: identifier }
        ]
    });
    
  

    if (!exists) {
        throw new ApiError(400, "User not found with provided identifier or has not registered");
    }
    console.log(exists._id)
    console.log("2nd ")
    const ispasscorrect = await exists.ispasswordcorrect(password);
    if (!ispasscorrect) {
        throw new ApiError(400, "Invalid credentials: password is not correct");
    } 
   // till here fine
 
   const {accesstoken , refreshtoken} = await generatetokens(exists._id);
   
  //  refreshtoken = tokens.refreshtoken;
    console.log(accesstoken)
    // Save refresh token to user
    exists.refreshtoken = refreshtoken;
    await exists.save({ validateBeforeSave: false }); // Avoid pre-save hooks like password hashing on token update
   console.log(exists._id);
    const loggedinuser = await User.findById(exists._id).select("-password -refreshtoken");
console.log(loggedinuser)
    const options = {
        httpOnly: true,
        secure: true, // Always use secure in production
        path: "/",
        sameSite: 'None', // Changed to None to allow cross-site cookies
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        domain: process.env.COOKIE_DOMAIN || undefined // Add domain if specified in env
    };

    return res
        .status(200)
        .cookie("accesstoken", accesstoken, options)
        .cookie("refreshtoken", refreshtoken, options)
        .json(
            new ApiResponse(200, { loggedinuser}, "User logged in successfully")
        );
});


const logoutuser = asynchandler(async (req, res) => {
    const userId = req.user?._id;
     console.log(req.user);
    if (!userId) {
        // This scenario should ideally be caught by middleware before reaching here,
        // but it's good to have a robust check.
        throw new ApiError(401, "Unauthorized: User ID not found in request.");
    }

    await User.findByIdAndUpdate(
        userId,
        { $set: { refreshtoken: undefined } }, // Set refreshtoken to undefined to remove it
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: 'None',
        maxAge: 24 * 60 * 60 * 1000,
        domain: process.env.COOKIE_DOMAIN || undefined
    };

    return res
        .status(200)
        .clearCookie("accesstoken", options)
        .clearCookie("refreshtoken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});
const getcurrectuser=asynchandler(async(req,res)=>{
    let userobject=req.user;
        // select method dont work on js object 
        // they only work on mongoose query
      return res.status(200)
      .json(
        new ApiResponse(200,
        { userobject}
        ,"The user is succesfully found ")
    
      )
    
       
    })

const changeCurrentUserPassword = asynchandler(async (req, res) => {
  const { oldpassword, newpassword } = req.body;

  // Check for missing fields
  if (!oldpassword || !newpassword) {
    throw new ApiError(400, "Old and new passwords are required.");
  }

  // Find user from request (set by auth middleware)
  const userFind = await User.findById(req.user?._id);
  if (!userFind) {
    throw new ApiError(404, "User not found");
  }

  // Check if old password matches
  const isPassCorrect = await userFind.ispasswordcorrect(oldpassword);
  if (!isPassCorrect) {
    throw new ApiError(400, "The old password is incorrect, please try again.");
  }

  // Set the new password
  userFind.password = newpassword;

  // Save user without triggering validators like "required"
  await userFind.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, {}, "Password changed successfully")
  );
});


export { register, login, logoutuser ,getcurrectuser,changeCurrentUserPassword};