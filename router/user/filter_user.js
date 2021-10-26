const express = require('express');
require('express-async-errors');
const router = express.Router();
const auth=require('../../middleware/auth');
const FilterBuying = require('../../controller/user/filter_user');
const users_reports = require('../../controller/user/users_reports');

router.get("/networkId",auth, FilterBuying.FilterBayingReports);
router.get("/PackageBestSelling/page",auth, FilterBuying.PackageBestSelling);
router.get('/filterReportsBuying',auth, users_reports.getReportsBuying);
router.get('/filterReportsSales',auth, users_reports.getReportsSales);

module.exports = router;
