import express from "express"
import dotenv from "dotenv"
import router from "./routes/Admin/admin.routes.js"
import loginRouter from "./routes/login.routes.js"
import cors from "cors"

dotenv.config()
const app = express()

app.use(express.json())
app.use(cors({
  origin: ['http://localhost:5173', 'https://pos-client-7u1a.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))

app.use("/api/users", router)
app.use("/login-user",loginRouter)

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5001
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}

export default app