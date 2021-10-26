const express = require('express');
require('express-async-errors');
const router = express.Router();
const AuthUser = require('../../controller/user/auth');
const auth=require('../../middleware/auth');

router.post('/register', AuthUser.createUser);
router.post('/DetailsUser',auth, AuthUser.PostDetailsUser);
router.post('/login', AuthUser.Login);
router.put('/updateUser/:_id',auth, AuthUser.UpdateUser);
//router.put('/updatePhoneUser/',auth, AuthUser.UpdatePhoneUser);
module.exports = router;

