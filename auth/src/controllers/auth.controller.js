import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"
import config from "../config/config.js"
import {publishToQueue} from "../broker/rabbit.js"

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
    role: user.role,
    fullName: user.fullName
  }, config.JWT_SECRET, {
    expiresIn: "2d"
  })

  await publishToQueue("user_created", {
    id: user._id,
    email: user.email,
    fullName: user.fullName,
    role: user.role
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

  const isUserExists = await userModel.findOne({
    $or: [
      { email: user.emails[0].value },
      { googleId: user.id }],
  });

  if (isUserExists) {
    const token = jwt.sign({
      id: isUserExists._id,
      role: isUserExists.role,
      fullName: isUserExists.fullName
    }, config.JWT_SECRET, {
      expiresIn: "2d"
    })
    res.cookie("token", token)

    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: isUserExists._id,
        email: isUserExists.email,
        fullName: isUserExists.fullName,
        role: isUserExists.role
      }
    })
  }

  const newUser = await userModel.create({
    googleId: user.id,
    email: user.emails[0].value,
    fullName: {
      firstName: user.name.givenName,
      lastName: user.name.familyName
    }
  })

  await publishToQueue("user_created", {
    id: newUser._id,
    email: newUser.email,
    fullName: newUser.fullName,
    role: newUser.role,
  });

  const token = jwt.sign(
    {
      id: newUser._id,
      role: newUser.role,
      fullName: newUser.fullName
    },
    config.JWT_SECRET,
    {
      expiresIn: "2d",
    }
  );
  res.cookie("token", token);

  res.status(201).json({
    message: "User registerd successfully",
    user: {
      id: newUser._id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role
    }
  })
}

export async function login(req, res) {
  const { email, password } = req.body;
  
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(400).json({
      message: "Unauthorized! register first"
    })
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    return res.status(400).json({
      message: "Incorrect Password"
    })
  }

  const token = jwt.sign({
    id: user._id,
    role: user.role,
    fullName: user.fullName
  }, config.JWT_SECRET, { expiresIn: "2d" })
  
  res.cookie("token", token)
  
  res.status(200).json({
    message: "User Login Successfully",
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    }
  })
}