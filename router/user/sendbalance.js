const express = require('express');
require('express-async-errors');
const router = express.Router();
const UserController = require('../../controller/user/sendbalance');
const auth=require('../../middleware/auth')

router.post('/SaleBalance',auth, UserController.sendBalance);
router.post('/incomeBalanceSystemToUser', UserController.incomeBalanceSystemToUser);

module.exports = router;