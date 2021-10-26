const express = require('express');
require('express-async-errors');
const router = express.Router();
const packageController = require("../controller/package/packages");
const auth=require('../middleware/auth');
const commissionController = require("../controller/package/commission");
const admin=require('../middleware/admin');

const package_Price_Controller = require("../controller/package/Package_Price");
//router.post("/create",auth,package_Price_Controller.PostPackage_Price);
router.post("/createDetailsPackage",auth,packageController.PostDetailsPackage);
router.get("/:_id",auth,packageController.getPackage);
//router.get("/price/:_id",auth,package_Price_Controller.getPackage_Price);
router.get("/",auth,packageController.getAllPackage);
router.put("/update",[auth,admin],packageController.UpdatePackage);
router.put("/commission",[auth,admin],commissionController.createCommission);


// router.patch("/update/price",auth,package_Price_Controller.UpdatePackage_Price);
// router.get("/packagePrice/Id",auth,package_Price_Controller.getPackage_PriceById);
// router.delete('/:_id',auth, package_Price_Controller.findPackageByIdAndDelete);

module.exports = router;