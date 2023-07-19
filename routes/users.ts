import express, { NextFunction } from "express";
import { Request, Response } from "express";
const cookieParser = require("cookie-parser");
const router = express.Router();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
import bcrypt from "bcrypt";
const { body, validationResult } = require("express-validator");
//POST Add User
router.post(
  "/register",
  body("companyName").notEmpty().withMessage("name required"),
  body("password").notEmpty().withMessage("password required"),
  async (req: any, res: any) => {
    var err = validationResult(req);
    if (!err.isEmpty()) return res.status(400).send(err);
    //Add
    const user = new User({
      companyName: req.body.companyName,
      password: req.body.password,
      emeraldAmount: req.body.emeraldAmount,
    });
    //Check mail
    try {
      const nameExist = await User.findOne({
        companyName: req.body.companyName,
      });
      if (nameExist) return res.status(400).send("name exist");
      //save

      const savedUser = await user.save();
      res.status(201).send(savedUser);
    } catch (err) {
      res.status(400).send(err);
    }
  }
);

//POST LOGIN
router.post("/login", async (req: any, res: any) => {
  //name validation
  try {
    const user = await User.findOne({ companyName: req.body.companyName });

    if (!user) return res.status(400).send("Invalid account");

    //password validation
    const passVal = await bcrypt.compare(req.body.password, user.password);
    if (!passVal) return res.status(400).send("Invalid account");
    //create token and returnc cookie
    const token = jwt.sign(
      { _id: user._id, companyName: user.companyName },
      process.env.TOKEN_SECRET
    );
    console.log(token);
    //res.cookie("token", token).send("cookie set");
    res.send(token);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/emerald-account", authenticateUser, async (req: any, res) => {
  console.log("gett");
  try {
    const userId = req.user._id;
    console.log(userId);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }
    console.log(user.emeraldAmount);
    res.status(200).json(user.emeraldAmount);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

export function authenticateUser(req: any, res: any, next: any) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send("Unauthorized no token");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = decodedToken;
    next();
  } catch (err) {
    return res.status(401).send("Unauthorized");
  }
}

module.exports = router;
