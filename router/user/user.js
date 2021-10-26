const express = require('express');
require('express-async-errors');
const router = express.Router();
const UserController = require('../../controller/user/user');
const users_reports = require('../../controller/user/users_reports');
const auth=require('../../middleware/auth')

router.get('/user/:_id',auth, UserController.getOneUser);
router.get('/count',auth, UserController.userAccount);
router.get('/profile/:_id',auth, UserController.getUserProfile);
// router.post('/outcome', UserController.addnewOutCome);
router.get('/ReportsBuying',auth, users_reports.ReportsBuying);
router.get('/SalesReports',auth, users_reports.SalesReports);
router.get('/RemittancesToMyFromUserId',auth, users_reports.getRemittancesToMyFromUserId);
router.get('/TransferrersToUser',auth, users_reports.getTransferrersToUser);
router.get('/TotalPayings',auth, users_reports.getTotalBuying);
router.get('/TotalSales',auth, users_reports.getTotalSales);
router.get('/SalesAndPaying',auth, users_reports.getSalesAndBuying);
router.get("/CardStoreDetails",auth, users_reports.CardStoreDetails);
router.get("/CardsSoldInSpecificated",auth, users_reports.CardsSoldInSpecificated);


module.exports = router;

