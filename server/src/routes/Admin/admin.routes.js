import express from "express"
import { getAllUsers,createUser,add_table } from "../../controllers/Admin/admin.controllers.js"
import { authMiddleWare } from "../../middleware/authMiddleware.js"

const router = express.Router()

router.get('/admin/get-all-users', getAllUsers)
router.post('/admin/create-user', createUser)
router.post('/admin/create-table', add_table)

export default router