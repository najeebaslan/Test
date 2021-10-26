const multer = require('multer');
const express = require('express');
require('express-async-errors');
const router = express.Router();
const CSVController = require('../../controller/card/csv');
const auth = require('../../middleware/auth')
const admin = require('../../middleware/admin');
const { http } = require('../../config/logger');

global.__basedir = __dirname;
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, __basedir + '/public/uploads/') },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname)
  },
});


router.get("/", auth, CSVController.getAllCSV);
router.get("/:_id", auth, CSVController.getByIdCSV);
router.post('/uploadFile', [auth, admin], async function (req, res) {
  var upload = multer({
    storage: storage,
    limits: { fileSize: 10000000, },
    fileFilter: (req, file, res) => {

      if (file.mimetype == "text/csv") { res(null, true); }
      else {
        res(null, false); return res('Only csv format allowed!');
      }
    },
  }).single('uploadFile');

  upload(req, res, async function (err) {

    if (err) return res.status(400).json({ "Error": "Error uploading file " + err });
    if (req.file == undefined) return res.status(400).json({ "Error": 'Add the card file' })

    CSVController.CreatCsv(req, res)

  });
});
/*فقط بحذف الكروت Admin يتم السماح لل  */
router.delete("/deleteAllPackageCardsById/:_id",
  [auth, admin], CSVController.deleteAllPackageCardsByid);


module.exports = router;

