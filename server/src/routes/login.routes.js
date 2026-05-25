import express from "express"
import { login } from "../controllers/login.controller.js"

const loginRouter = express.Router()

loginRouter.post("/login",login)

export default loginRouter