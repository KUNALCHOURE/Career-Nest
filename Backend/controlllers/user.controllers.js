import ApiError from "../utils/Apierror";
import User from "../models/user.models";
import ApiResponse from "../utils/apiresponse";

const generatetokens=async(userid)=>{
     if(!userid){
        throw new ApiError(401,"Error while generating tokens");
     }

     const founduser=User.findById({userid});
     if(!founduser){
      throw new ApiError(400,"User doesnot exist");
     }

    const accesstoken=founduser.generateAcessToken();
    const refreshtoken=founduser.generateRefreshToken();

    if(!accesstoken || !refreshtoken) {
      throw new ApiError(500,"Error while generating tokens");
    }
  
    return {accesstoken,refreshtoken};
    

}


const register=async(req,res)=>{
  
         const {email,password,username}=req.body;
         if(!email || !password || !username){
            throw new ApiError(400,"All fields are required");
         }
         const exists=await User.findOne({email});
         if(exists){
            throw new ApiError(400,"User already exists");
         }

         const newuser =User.create({
            username,
            email,
            password
         })
       
         if(!newuser){
            throw new ApiError(500,"Failed to create user");
         }

         const createduser =User .findById(newuser._id).select('-password');
         if(!createduser){
            throw new ApiError(400,"User is not created ");
         }


         ApiResponse(res,201,createduser,"User created successfully");
    } 






const login = async (req, res) => {
    try {
        const { username ,email, password } = req.body;
        if(!username || !email || !password){
            throw new ApiError(400,"All fields are required");
        }
        const exists=await User.findOne({email});
         if(!exists){
            throw new ApiError(400,"User has not registered");
         }



    } catch (error) {
       throw new ApiError(500,error.message);
    }
}



export {register,login};