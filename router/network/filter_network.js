const express = require('express');
require('express-async-errors');
const router = express.Router();
const FilterBuying = require('../../controller/network/filter_network');
const auth=require('../../middleware/auth');

router.get("/PackageBestSellingNetwork/userId",auth, FilterBuying.PackageBestSelling);

module.exports = router;
