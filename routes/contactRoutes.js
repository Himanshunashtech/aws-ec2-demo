import { Router } from 'express';
import { contact } from '../controllers/contactContoller.js';
 const router = Router()

 router.post("/contact",contact)

 export {router}