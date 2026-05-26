import pkg from "pg"
import dotenv from "dotenv"

dotenv.config()

const {Pool} = pkg

export const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false 
      }
    })
  : new Pool({
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      database: process.env.PG_DB
    })

pool.query('SELECT NOW()',(err,res)=>{
  if(err){
    console.log("Failed to connect to database", err)
  }
  else{
    console.log("Connected to database successfully", res.rows[0].now)
  }
})