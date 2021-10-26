    const packages = require('../../models/packages');
    const {logger, Joi}=require('../../utils/utils');
    const {findNetwork,}=require('../../utils/find_utils');
    const {customValidation,}=require('../../utils/validation');
    Joi.objectId = require('joi-objectid')(Joi)

    /* 
    <<<// Documentation names //>>>

    1- pI = packageId
    2- com = commission
    3- cUT1 = commission_User_Type1=> عميل
    4- cUT2 = commission_User_Type2=> مورد
    5- sC = services_Commission=> النظام
    6- fP = findPackage
    */

    class Package_Commission {
    async createCommission(req, res) {
    try {

    const body = req.body
    const sC=10;/* this default Commission for owner system */
    const schema = Joi.object({
    networkId: Joi.objectId(),
    packageId: Joi.objectId(),
    commissionType1: Joi.number().integer().min(10).max(3000).required(),
    commissionType2:Joi.number().integer().min(10).max(3000).required(),
    })

    const {error}=customValidation(body,schema);
    if(error)return res.status(404).json({Error:error.details[0].message})
    const findN =await findNetwork(body.networkId)
    if(findN[0]==true)return res.status(404).json({"Error":"not found this network"})
    
    const fP = findN[1].packages.filter(element => element._id==body.packageId);
    if(fP[0]==null||fP[0]==undefined)
    return res.status(404).json({"Error":"not found this package"});
   const result= await packages.findByIdAndUpdate(body.packageId, {
    $set: {
    services_Commission: sC,
    commission_User_Type1: body.commissionType1,
    commission_User_Type2: body.commissionType2,
    },
    }, { new:true,});
    return res.status(200).json(result)
    } catch (error) {
    logger.error("PostDetailsPackage==>"+error);
    console.log(error.message);
    return res.status(400).json({"Error":error.message})    
    }
    }
    }

    module.exports = new Package_Commission();