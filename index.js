const express=require("express");
const axios=require("axios")
const { createProxyMiddleware } = require('http-proxy-middleware');
var morgan = require('morgan')
const app=express();

const { rateLimit } = require('express-rate-limit')
const limiter = rateLimit({
	windowMs: 2 * 60 * 1000, // 2 minutes
	limit: 5 // Limit each IP to 5 requests per `window` (here, per 2 minutes)
})

app.use(morgan('combined'))
app.use(limiter)

app.use("/bookingservice",async(req,res,next)=>{
    try{
        console.log("the header token is: ",req.headers['x-access-token']);
        const token=req.headers['x-access-token'];
        const response=await axios.get('http://localhost:3001/api/v1/isauthenticate',{
            headers:{
                'x-access-token':token
            }
        })
        console.log("response of authenticate is: ",response.data);
        if(response.data.success){
            next();
        }else{
            return res.status(401).json({
                message:"Unauthorised"
            })
        }
        
    }catch(err){
        return res.status(401).json({
            message:"Unauthorised"
        })
    }
    
})

const PORT=3005;

app.use('/bookingservice',
    createProxyMiddleware({
      target: 'http://localhost:3002/',
      changeOrigin: true,
    }),
);

app.get("/home",(req,res)=>{
    res.json({message:"OK"})
})
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})