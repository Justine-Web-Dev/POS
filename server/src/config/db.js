import pkg from "pg"
import dotenv from "dotenv"

dotenv.config()

const {Pool} = pkg

export const pool =  new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {rejectUnauthorized : false} : false
  
})
      

pool.query('SELECT NOW()',(err,res)=>{
  if(err){
    console.log("Failed to connect to database", err)
  }
  else{
    console.log("Connected to database successfully", res.rows[0].now)
  }
})