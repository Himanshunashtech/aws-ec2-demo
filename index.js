 import express, { urlencoded } from 'express'
 import cookieParser from 'cookie-parser'
 import dotenv from 'dotenv'
 import path from 'path'
 import cors from 'cors'
 import { globalErrorHandler } from './utils/errorHandler.js'
 import { connectDB } from './dbconnection/dbConnection.js'
import dockerRoute from "./routes/userRoutes.js"
// import requestLogger from './middlewares/loggermiddelware.js'


 dotenv.config( )

 const app = express()

 const port = process.env.PORT || 3060

//  app.use(requestLogger);

 app.use(cookieParser());



 app.use(cors())
 app.use(express.json())
 app.use(urlencoded({extended:true}))
 app.use(express.static(path.join('views')));
 
   
 app.get('/', (req, res) => {
    res.sendFile('index.html')
});
 app.use("/app",dockerRoute)

 app.use(globalErrorHandler)
 


 

 const server = app.listen(port,()=>{
    console.log(`server is running at ${port}`)
    connectDB()
 }) 


 server.on('error', (error) => {
   if (error.code === 'EADDRINUSE') {
       console.error(`Port ${port} is already in use.`);
       
       process.exit(1);
   } else {
       throw error;
   }
});