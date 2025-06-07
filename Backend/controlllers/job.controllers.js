
import ApiError from "../utils/Apierror.js";
import ApiResponse from "../utils/apiresponse.js";
import asynchandler from "../utils/asynchandler.js";


const getalljob=asynchandler(async()=>{
     try{
    const response =await fetch('https://api.apijobs.dev/v1/job/search',{
        method: 'POST',
        headers: {
          'apikey': process.env.JOB_INFO_API,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: "Reactjs"
        })
      })
   
      console.log(response);

      ApiResponse(200,response,"jobs found"  );
    }
    catch(e){
      throw new ApiError(400,"a problem occur ");
    }
})

export {getalljob};
