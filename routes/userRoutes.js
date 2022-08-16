const express = require('express')
const router = express.Router()
const userController = require('../controller/usercontroller')
const {verifyToken} = require('../utils')

router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/creditAccount',verifyToken, userController.credit_user_account)
router.get('/get_user_account/:userId',verifyToken, userController.get_user_account)
router.post('/debitAccount',verifyToken, userController.withdrawal_user_account)
router.post('/transferAccount', userController.transfer)

module.exports = router
