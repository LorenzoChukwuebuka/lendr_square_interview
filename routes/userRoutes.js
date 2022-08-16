const express = require('express')
const router = express.Router()
const userController = require('../controller/usercontroller')

router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/creditAccount', userController.credit_user_account)
router.get('/get_user_account/:userId', userController.get_user_account)

module.exports = router