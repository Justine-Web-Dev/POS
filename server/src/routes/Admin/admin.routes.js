import express from "express"
import { getAllUsers,createUser,add_table,update_table_status,get_all_table } from "../../controllers/Admin/admin.controllers.js"
import { add_category,get_menu_item,add_menu, get_category_by_type } from "../../controllers/Admin/admin.category.controller.js"
import { authMiddleWare } from "../../middleware/authMiddleware.js"

const router = express.Router()

//admin handle
router.get('/admin/get-all-users',authMiddleWare ,getAllUsers)
router.post('/admin/create-user', authMiddleWare,createUser)

//table create,read,update,
router.post('/admin/add-table',authMiddleWare, add_table)
router.get('/admin/read-table', authMiddleWare, get_all_table)
router.put('/admin/update-table/:id', authMiddleWare , update_table_status)

router.post('/admin/add-category/', authMiddleWare,add_category)

router.get('/admin/get-menu/', authMiddleWare,get_menu_item)
router.post('/admin/add-menu/', authMiddleWare,add_menu)

router.get('/admin/get-category-type/', authMiddleWare,get_category_by_type)

export default router