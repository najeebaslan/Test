

const express = require('express');
require('express-async-errors');
const router = express.Router();
const multer = require('multer');
const auth = require('../../middleware/auth');
const NetworkController = require('../../controller/network/network');
require('express-async-errors');
    var storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
    },

    filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname)
    },
    })
    router.post('/CreateNetwork', auth, async function (req, res) {
    var upload = multer({
    storage: storage,
    limits: { fileSize: 10000000, },
    fileFilter: (req, file, res) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
    res(null, true);
    } else {
    res(null, false);
    return cb('Only .png, .jpg and .jpeg format allowed!');
    }
    },
    }).single('img');
    upload(req, res, async function (err) {
    if (err) { return res.end({ Error: "Error uploading file " + err }); }
    if (req.file == undefined) { return res.status(404).json({ Error: 'يجب اضافة ملف الصورة' }) }
    NetworkController.CreateNetwork(req, res)
    });
    })

router.get('/', auth, NetworkController.getNetwork);
router.get('/:_id', auth, NetworkController.getNetworkById);
router.get('/name/:nameA', auth, NetworkController.getNetworkByName);
router.get('/counts/network', auth, NetworkController.NetworksCount);
router.post('/postPhone', auth, NetworkController.postPhone);



module.exports = router;