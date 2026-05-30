import express from "express"
import { getAllUsers,createUser,add_table,update_table_status,get_all_table } from "../../controllers/Admin/admin.controllers.js"
import { add_category, get_categories, get_menu_item, add_menu, get_category_by_type } from "../../controllers/Admin/admin.category.controller.js"
import { add_order , get_orders} from "../../controllers/Admin/admin.order.controller.js"
import { authMiddleWare } from "../../middleware/authMiddleware.js"

const router = express.Router()

//admin handle
router.get('/admin/get-all-users' ,getAllUsers)
router.post('/admin/create-user', authMiddleWare,createUser)

//table create,read,update,
router.post('/admin/add-table',authMiddleWare, add_table)
router.post('/admin/add-order', authMiddleWare, add_order)
router.get('/admin/read-table', authMiddleWare, get_all_table)
router.put('/admin/update-table/:id', authMiddleWare , update_table_status)

router.post('/admin/add-category/',add_category)

router.get('/admin/get-categories/', authMiddleWare, get_categories)
router.get('/admin/get-menu/', authMiddleWare,get_menu_item)
router.post('/admin/add-menu/', authMiddleWare,add_menu)

router.get('/admin/get-category-type/', authMiddleWare,get_category_by_type)

router.get('/admin/get-orders/', get_orders)


export default router