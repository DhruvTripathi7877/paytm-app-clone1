const express = require("express");
const zod=require("zod");
const {User, Account} = require("../models/userSchema");
const bcrypt = require("bcrypt");

const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';

const {JWT_SECRET} = require("../config");
const {authMiddleware} = require("../middlewares/middleware") 

const jwt = require("jsonwebtoken");
const { hash } = require("crypto");

const router = express.Router();

const signupSchema = zod.object({
    username: zod.string().email(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string(),
})


router.post("/signup", async (req, res) => {
    const body = req.body;

    const {success} = signupSchema.safeParse(body);

    if(!success){
        return res.status(400).json({message: "Invalid Request"})
    }

    const user = await User.findOne({username: body.username});

    if(user){
        return res.status(400).json({message: "User Already Exists"})
    }

    bcrypt.hash(req.body.password, saltRounds,async(err,hash)=>{
        if(err){
            return res.status(500).json({message: "Internal Server Error"})
        }

        const dbUser = await User.create({
            username:body.username,
            password:hash,
            firstName:body.firstName,
            lastName:body.lastName
        })

        const userId= dbUser._id;

        await Account.create({
            userId:userId,
            balance:(1+Math.random()*1000),
        })
        const token = jwt.sign({userId: dbUser._id}, JWT_SECRET);

        res.status(201).json({
            message:"User Created",
            token:token,
        })
    })
})

const signinBody = zod.object({
    username:zod.string().email(),
    password:zod.string(),
})

router.post("/signin",async(req,res)=>{
    const {success} = signinBody.safeParse(req.body);

    if(!success){
        return res.status(400).json({message: "Invalid Request"})
    }
    try
    {
        const user = await User.findOne({
            username:req.body.username,
        })

        if(user)
        {
            bcrypt.compare(req.body.password ,user.password,(err,result)=>{
                
                if(err){
                    return res.status(500).json({message: "Internal Server Error"})
                }
                if(result)
                {
                    const token = jwt.sign({userId:user._id},JWT_SECRET);

                    return res.json({
                        token
                    })
                }
                else{
                    console.log("Invalid Credentials")
                    return res.status(400).json({message: "Invalid Credentials"})
                }
            })
        }
    }
    catch(err){
        console.log("Invalid Credentials2")
        return res.status(400).json({message: "Invalid Credentials"})
    }
})

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(), 
    lastName: zod.string().optional(),  
})

router.put("/",authMiddleware,async(req,res)=>{
    const {success} = updateBody.safeParse(req.body);

    if(!success){
        return res.status(411).json({message: "Invalid Request"})
    }
    const {password,firstName,lastName} = req.body; 

    const userId = req.userId;

    await User.findByIdAndUpdate(userId,{
        password:password,
        firstName:firstName,
        lastName:lastName,
    })

    res.status(200).json({message: "User Updated"})
})

router.get("/bulk",async(req,res)=>{
    const reqUser = req.query.filter || "";

    const users = await  User.find({
        $or:[
            {firstName:{
                "$regex":reqUser,
            }},
            {lastName:{
                "$regex":reqUser,
            }},
        ]
    })

    res.status(200).json({
        users:users.map((user)=>({
            firstName:user.firstName,
            lastName:user.lastName,
            _id:user._id,
            username:user.username,
        }))
    });
})

module.exports = {userRouter:router};