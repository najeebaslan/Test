const express = require('express');
require('express-async-errors');
const router = express.Router();
const CoverageController = require('../controller/allCoverage_Area');
const locationController = require('../controller/location/location');
const admin=require('../middleware/admin');

const auth=require('../middleware/auth')

router.get('/',auth,CoverageController.getAllArea);
router.get('/:_id',auth,CoverageController.getAllAreaByIdNetwork);
router.post('/CoverageAreaNetwork',auth,CoverageController.PostAllCoverage);
router.post('/CreateGovernorate',auth,locationController.carateLocation);
router.post('/CreateCity',auth,locationController.carateCity);
router.patch('/:id',[auth,admin], CoverageController.UpdateArea);
router.delete('/:_id',[auth,admin], CoverageController.findAreaByIdAndDelete);
router.get('/name/Governorate',auth, CoverageController.getAreaByName);
router.get('/counts/area',auth, CoverageController.CoveragesCount);
 // router.post('/governorate',auth,CoverageController.Postgovernorate);
// router.get('/governorate/all',auth,CoverageController.getgovernorate);
module.exports = router;

  