const express = require('express');
require('express-async-errors');
const router = express.Router();
const CardsController = require('../../controller/card/card');
const auth=require('../../middleware/auth')

router.post('/create',auth, CardsController.addCards);
router.get('/all',auth,CardsController.getAllCards);
router.post("/buyCard",auth,CardsController.buyCard);


module.exports = router;