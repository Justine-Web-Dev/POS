import express from "express"
import { getAllUsers,createUser,add_table,update_table_status,get_all_table } from "../../controllers/Admin/admin.controllers.js"
import { add_category,get_menu_item,add_menu } from "../../controllers/Admin/admin.category.controller.js"
import { authMiddleWare } from "../../middleware/authMiddleware.js"

const router = express.Router()

//admin handle
router.get('/admin/get-all-users', getAllUsers)
router.post('/admin/create-user', createUser)

//table create,read,update,
router.post('/admin/create-table', add_table)
router.get('/admin/read-table', get_all_table)
router.put('/admin/update-table/:id', update_table_status)

router.post('/admin/add-category/',add_category)

router.get('/admin/get-menu/',get_menu_item)
router.post('/admin/add-menu/',add_menu)

export default router