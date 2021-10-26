const {mongoose,logger}=require('../../utils/utils')

const network = require("../../models/network");
const packageModel = require("../../models/packages");
const {findNetwork}=require('../../utils/find_utils')
require('express-async-errors');
const {validationPackage} = require("../../models/packages");

class Package_Controller {
  async PostDetailsPackage(req, res) {
   
    try {
      
    const body=req.body;
    const {error}=validationPackage(body);
    if(error)return res.status(404).json({Error:error.details[0].message})
    const findN =await findNetwork(body.networkId)
    if(findN[0]==true)return res.status(404).json({"Error":"not found this network"})
    if(findN[1].user_initiate!=body.user_initiate)return res.status(404).json({"Error":"This network belongs to someone else"})
    const phoneExists = await packageModel.findOne({ package_Price: body.package_Price });
    console.log(phoneExists);
    if (phoneExists) {
    res.status(400).json({ "Error": 'لقد تم اضافة تفاصيل هذة الباقة مسبقا',});
    return false;
    }
    let package_details;
    const id = new mongoose.Types.ObjectId();

    if(body.havePassword==true){

      if(body.equalUAP==null||body.equalUAP==undefined){
      return res.status(401).json({"Error":"\"equalUAP\" must be one of [true or false ]. That means Equal Username And Password | or Different username and password"})}

      package_details = {
        _id: id,
        package_Price:body.package_Price,
        Package_data: body.data,
        Package_time: body.time,
        package_validity: body.validity,
        havePassword: body.havePassword,
        equalUAP:body.equalUAP,/* this equalUAP =EqualUsernameAndPassword */
        details_time: req.body.details_time,
        details_validity: req.body.details_validity,
        details_data: body.details_data,
        networkId: body.networkId,
        user_initiate: body.user_initiate,
      
      };
      }else if(body.havePassword==false){
      if(body.equalUAP!=null||body.equalUAP!=undefined)
      return res.status(404).json({"Error":"\"equalUAP\" is not allowed"})
      package_details = {
        _id: id,
        package_Price:body.package_Price,
        Package_data: body.data,
        Package_time: body.time,
        package_validity: body.validity,
        havePassword: body.havePassword,
        details_time: req.body.details_time,
        details_validity: req.body.details_validity,
        details_data: body.details_data,
        networkId: body.networkId,
        user_initiate: body.user_initiate,
      
      };
    }
    const networkId = req.body.networkId;
    const package2 = new packageModel(package_details,)
    const thisPackageId = package2._id;
    console.log(thisPackageId+'llj');
    setPackageInNetwork(thisPackageId, networkId);
    package2.save(function (err) {
      console.log(err);
      if (err) return res.json(err.message);
      return res.status(200).send({ "id": id, })});
    } catch (error) {
      logger.error("PostDetailsPackage==>"+error);
      console.log(error.message);
      return res.status(400).json({ " status": false ,"Error":error.message})
    }
    
  }


  async UpdatePackage(req, res) {
    const packageId = req.body.packageId;
    try {
     const Package = await packageModel.findByIdAndUpdate(packageId, {
      Package_data: req.body.data,
      Package_time: req.body.time,
      package_validity: req.body.validity,
      }, { new: true });
      console.log(Package);
      if (!Package) {
      return res.status(400).json({"Error":'هذه الباقة غير مضافة'});
      }
      return res.status(200).json([Package]); 
     } catch (error) {
      logger.error("savePackage2==>"+error);
      console.log(error.message);
      return res.status(400).json({"Error":error.message})
     }
  };

  async getPackage11(req, res) {
    const id = req.params;
    const elementId = req.body._id;
    try {
      const findPackage = await packageModel.
      findById(id, { info: { "$elemMatch": { _id: elementId } } },)
      if (!findPackage) return res.json("لاتوجد هذه الفئة");
    
    return res.json(findPackage);
    } catch (error) {
    logger.error("getPackage11==>"+error);
    console.log(error.message);
    return res.status(400).json({ " status": false ,"Error":error.message})
    }
   
    
  };

  async getPackage(req, res) {
    const networkId = req.query.networkId;
    try {
      const findPackage = await packageModel
      .find({ networkId: networkId })

      .populate({ path: "package_PriceId", select: "package_Price network _id isAdd" })//🤨🤨🤨🤨🤨🤨🤨🤨

    if (!findPackage) {
      return res.json("لاتوجد هذه الفئة");
    }
    return res.json(findPackage);
    } catch (error) {
    logger.error("getPackage11==>"+error);
    console.log(error.message);
    return res.status(400).json({ " status": false ,"Error":error.message})
    }};

  async getAllPackage(req, res) {
   try {
  const findPackage = await packageModel.find().populate('package_Price package_Price')
    if (!findPackage) { return res.json("لاتوجد هذه الفئة");}
    return res.json(findPackage);
   } catch (error) {
   logger.error("getPackage11==>"+error);
   console.log(error.message);
   return res.status(400).json({ " status": false ,"Error":error.message})
   }}
};

async function setPackageInNetwork(packageId, networkId) {
  await network.findByIdAndUpdate(networkId, {
    $addToSet: { packages: packageId, },
    new: true,
  });
};
// async function setPackageInPackagePrice(packageId, packagePrices) {
//   await packagePrice.findByIdAndUpdate(packagePrices, {
//     $addToSet: { packages: packageId, },
//     new: true,
//   });
// };

module.exports = new Package_Controller();

