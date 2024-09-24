import { asyncHandler } from "../utils/asyncHandler.js";
import { APIResponse } from "../utils/apiResponse.js";
import { APIError, ClientError } from "../utils/apiError.js";
import { ContactUs } from "../models/contactUs.js";


const contact = asyncHandler(async(req,res)=>{
     const {name,email,message }= req.body

     if(!name||!email||!message){
        throw new ClientError("enter all the fields")
     }

     const user = await ContactUs.findOne({email})

     if(user){
        throw new ClientError("User already exit")


     }

     const newContact = ContactUs.create({
        name,
        email,
        message

     })

     return res.status(200).json(APIResponse.success('Message sent succesfull'));
    })

    export{contact}