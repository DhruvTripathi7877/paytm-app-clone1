const express = require("express");
// const {authMiddleware} = require("../middlewares/authMiddleware");
const {authMiddleware}=require("../middlewares/middleware");
const {Account, User} = require("../models/userSchema");

const mongoose = require("mongoose");

const router = express.Router();

router.get("/balance",authMiddleware,async(req,res)=>{
    const account = await Account.findOne({userId:req.userId});

    res.json({
        balance:account.balance
    })
})

router.post("/transfer", authMiddleware, async (req, res) => {
    console.log(100)
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { amount, to } = req.body;
        const account = await Account.findOne({ userId: req.userId }).session(session);

        if (!account || account.balance < amount) {
            await session.abortTransaction();
            session.endSession();  // End the session after aborting
            return res.status(400).json({ message: "Insufficient Balance" });
        }

        const toUserId = to

        const toAccount = await Account.findOne({ userId: toUserId }).session(session);

        if (!toAccount) {
            await session.abortTransaction();
            session.endSession();  // End the session after aborting
            return res.status(400).json({ message: "Invalid Recipient" });
        }

        await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
        await Account.updateOne({ userId: toUserId }, { $inc: { balance: amount } }).session(session);

        await session.commitTransaction();
        session.endSession();  // End the session after committing

        res.json({ message: "Transfer Successful" });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.log("Transfer Error", err);
        res.status(500).json({ message: "Error while transferring" });
    }
});

module.exports = {accountRouter:router};