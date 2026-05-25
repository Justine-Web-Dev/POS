import express from "express"
import dotenv from "dotenv"
import router from "./routes/Admin/admin.routes.js"
import loginRouter from "./routes/login.routes.js"

dotenv.config()
const app = express()

app.use(express.json())

app.use("/api/users/", router)
app.use("/login-user/",loginRouter)

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})

export default app