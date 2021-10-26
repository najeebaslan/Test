    const offers = require("../models/offers");
    require('express-async-errors');
    const { findNetwork, } = require('../utils/find_utils');
    const { logger, mongoose, Joi } = require('../utils/utils');
    const { customValidation } = require('../utils/validation');
    Joi.objectId = require('joi-objectid')(Joi)
 /* 
    <<<// Documentation names //>>>

    1- findN = find Network
    2- fP = find package

    */
    class offer {
    async createOffer(req, res) {
    try {
    const body = req.body;

    const Schema = Joi.object({/* this is validation request */

    packagePrice: Joi.number().integer().min(100).required(),
    offers: Joi.string().min(3).max(100).required(),
    data: Joi.string().required(),
    details_data: Joi.string().required(),
    time: Joi.string().required(),
    details_time: Joi.string().required(),
    validity: Joi.string().required(),
    details_validity: Joi.string().required(),
    limitUptime: Joi.string().required(),
    details_limitUptime: Joi.string().required(),
    networkId: Joi.objectId().required(),
    packageId: Joi.objectId().required(),

    })

    const { error } = customValidation(req.body, Schema);
    if (error) return res.status(404).json({ Error: error.details[0].message })
    const findN = await findNetwork(body.networkId)
    if (findN[0] == true) return res.status(404).json({ "Error": "not found this network" })

    const fP = findN[1].packages.filter(element => element._id == body.packageId);
    if (fP[0] == null || fP[0] == undefined)
    return res.status(404).json({ "Error": "not found this package" });
    const offer =  new offers({
    packagePrice: req.body.packagePrice,
    offers: req.body.offers,
    data: req.body.data,
    details_data: req.body.details_data,
    time: req.body.time,
    details_time: req.body.details_time,
    validity: req.body.validity,
    details_validity: req.body.details_validity,
    limitUptime: req.body.limitUptime,
    details_limitUptime: req.body.details_limitUptime,
    networkId: req.body.networkId,
    });

    await offer.save(function (error) {
    if (error) return res.status(400).json({ "Error": error.message, "status": false });
    return res.status(200).json([offer])
    }); console.log(error);
    } catch (error) {
    logger.error("createOffer==>" + error);
    console.log(error.message);
    return res.status(404).json({ Error: error.message })
    }

    }

    async getOffer(req, res) {
    const id = req.query.networkId;
    try {
    await offers
    .find({ networkId: id }, function (error, result) {
    if (error) return res.status(400).json({ Error: error.message })
    if (result[0] == null) {
    return res.status(401).json({ "Error": "This offer is no longer available" });
    }
    return res.status(200).json(result);
    }).populate({ path: "networkId", select: "img nameA" })
    } catch (error) {
    logger.error("getOffer==>" + error);
    console.log(error.message);
    return res.status(404).json(error.message)
    }
    }
    async getAllOffer(req, res) {
    const id = req.params;
    try {
    const findPackage = await offers
    .find()
    .populate({ path: "networkId", select: "img nameA" })

    if (!findPackage) {
    return res.status(401).json({ "Error": "لاتوجد هذه الفئة" });
    }
    return res.status(200).json(findPackage);
    } catch (error) {
    logger.error("getAllOffer==>" + error);
    console.log(error.message);
    return res.status(404).json(error.message)
    }
    };

    }

    module.exports = new offer();
