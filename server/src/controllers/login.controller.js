import {pool} from "../config/db.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

export const login = async (req,res) =>{
  try {
    const {username,password} = req.body

    if(!username || !password){
      return res.status(400).json({message:"All fields are required"})
    }

    const checkUser = await pool.query('SELECT * FROM tbl_user WHERE username=$1', [username])

    if(checkUser.rows.length === 0){
      return res.status(401).json({message: "Username not found"})
    }

    const user = checkUser.rows[0]

    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
      return res.status(401).json({message: "Invalid password"})
    }

    const token = jwt.sign(
      {id:user.id, username: user.username},
      process.env.JWT_SECRET,
      {expiresIn: process.env.JWT_EXPIRES_IN}
    )
    return res.json({message: "Login successful", token: token})
    
  } catch (error) {
    res.status(500).json({message: "Internal Server error"})
  }
}