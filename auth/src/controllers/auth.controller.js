import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"
import config from "../config/config.js"


export async function register(req, res) {
  const { email, password, fullName: { firstName, lastName } } = req.body;
  
  const existingUser = await userModel.findOne({ email: email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  
  const user = await userModel.create({
    email,
    password: hashedPassword,
    fullName: {
      firstName,
      lastName
    }
  })

  const token = jwt.sign({
    id: user._id,
    role: user.role
  }, config.JWT_SECRET, {
    expiresIn: "2d"
  })

  res.cookie("token", token)
  
  res.status(201).json({
    message: "User Registered Successfully",
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    }
  })
}

export async function googleAuthCallback(req, res) {
  const user = req.user

  console.log(user)

  res.send("Google auth callback")
}