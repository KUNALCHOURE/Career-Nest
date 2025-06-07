import ApiError from "../utils/Apierror.js";
import User from "../models/user.models.js";
import ApiResponse from "../utils/apiresponse.js";
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
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: 'Lax', // Added sameSite for better security and cookie handling
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
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax", // Consistent sameSite attribute
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

export { register, login, logoutuser ,getcurrectuser};