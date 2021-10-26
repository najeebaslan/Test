const express = require('express');
require('express-async-errors');
const router = express.Router();
const offersController = require('../controller/offers');
const auth=require('../middleware/auth')
router.post('/offer',auth, offersController.createOffer,);
router.get("/offer",auth,offersController.getOffer);
router.get("/AllOffer",auth,offersController.getAllOffer);
module.exports = router;

