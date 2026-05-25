import {pool} from "../../config/db.js"
import bcrypt from "bcrypt"

export const getAllUsers = async (req,res)=>{
  try {
    const getUsers = await pool.query('SELECT * FROM tbl_user')
    res.json(getUsers.rows)
  } catch (error) {
    res.status(500).json({message: error.message})
  }
} 

export const createUser = async (req,res) =>{
  try {
    const {fullname,username,password,role} = req.body
    
    const checkUsername = await pool.query('SELECT id FROM tbl_user WHERE username = $1', [username])
    if(checkUsername.rows.length > 0){
      return res.status(400).json({ message: "Username is already taken" })
    }
    
    if(role.toLowerCase() === "admin"){
      const checkAdminExists = await pool.query('SELECT id FROM tbl_user WHERE role = $1', [role])
      if(checkAdminExists.rows.length > 0){
        return res.status(400).json({message:"Admin already exists"})
      }
    }
    
    if(role.toLowerCase() === "manager"){
      const managerExists = await pool.query('SELECT id FROM tbl_user WHERE role = $1', [role])
      if(managerExists.rows.length > 0){
        return res.status(400).json({message:"Manager is already exists"})
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await pool.query('INSERT INTO tbl_user (fullname,username,password,role) VALUES ($1,$2,$3,$4)', [fullname,username,hashedPassword,role])
    
    return res.json({message: "User created sucessful"})
  } catch (error) {
    res.status(500).json({message: error.message})
  }
}

export const add_table = async (req,res) =>{
  try {
    const {table_number,capacity} = req.body

    const newTable = await pool.query('INSERT INTO tbl_table (table_number,capacity) VALUES ($1,$2)',[table_number,capacity])

    return res.json({message: "Table added successfully" , data: newTable.rows})

  } catch (error) {
    res.status(500).json({message: error.message})
  }
}
