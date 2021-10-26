

// const mongoose = require("mongoose");
// const network = require("../../models/network");
// const package = require("../../models/packages");
// const package_Price = require("../../models/Package_Price");//🤨🤨🤨🤨🤨🤨🤨🤨
// require('express-async-errors');
// const logger = require("../../config/logger");
// const ObjectId = mongoose.Types.ObjectId;

// class package_Price_Controller {
//   async PostPackage_Price(req, res,) {
//     const id = new mongoose.Types.ObjectId();

   
//    try {
//      await package_Price.findOne({
//     package_Price:req.body.package_Price,
//     network:req.body.networkId
//     },function(error,data){
//       if(data)return res.status(400).json({"Error":"This is package already exist"})
//       console.log('lll');
//       const packagePrice = package_Price(
//       { _id: id, package_Price: req.body.package_Price, network: req.body.networkId, });
//       console.log(packagePrice);
//        packagePrice.save(function (err,data) {
//         if (err) return res.json(err.message);
//         return res.status(200).send({ "id": id, })
//       }
//       );
//   })
 
     
//     } catch (error) {
//       logger.error("PostPackage_Price==>" + error);
//       console.log(error.message);
//       return res.status(404).json({Error:error.message})
//     }

//   };


//   async getPackage_Price(req, res) {
//     try {
//       const id = req.params;
//       console.log(id);
//       const findPackage_Price = await package_Price.find({ network: id })
//       return res.status(200).send(findPackage_Price)
//     } catch (error) {
//       logger.error("getPackage_Price==>"+error);
//       console.log(error.message);
//       return res.status(400).json({ " status": false ,"Error":error.message})
//     }
//   }
//   async getPackage_PriceById(req, res) {
//     try {
//       const id = req.query.Id;
//       console.log( req.query.Id);
//       const findPackage_Price = await package_Price.findOne({ _id:ObjectId(id)})
//       .select('-__v -network -packages')
//       if(!findPackage_Price)return res.status(404).json({"Error":"not found this package"})
//       return res.status(200).json(findPackage_Price)
//     } catch (error) {
//       logger.error("getPackage_PriceById==>"+error);
//       console.log(error.message);
//       return res.status(400).json({"Error":error.message})
//     }
//   }
//   async UpdatePackage_Price(req, res) {
//     const updates = Object.keys(req.body);
//     try {
//       const id = req.query.package_PriceId;
//       const packages = await package_Price.findOneAndUpdate(id, {$set: req.body.package_Price, });
//       if (!packages) {
//         return res.status(404).send({ "لا توجد هذه الباقه": false })
//       }
//       updates.forEach((update) => packages[update] = req.body[update])
//       packages.save()
//       return res.status(200).send({ "status": true })
//     } catch (error) {
//       logger.error("UpdatePackage_Price==>"+error);
//       console.log(error.message);
//       return res.status(400).json({ " status": false ,"Error":error.message})
//     }
//   }

//   async findPackageByIdAndDelete(req, res) {
//     try {
//       const id = req.params;
//       console.log(id);
//       const findArea = await package_Price.findOneAndDelete(id).select('package_Price -_id')
//       if(!findArea)return res.status(400).json({'Error':"not found this package"});
//       delatePackageInNetwork(id);
//       return res.status(201).send(findArea)
//     } catch (error) {
//       logger.error("findPackageByIdAndDelete==>"+error);
//       console.log(error.message);
//       return res.status(400).json({ " status": false ,"Error":error.message})
//     }
//   }
// }

// async function setPackageInNetwork(packageId, networkId) {
//   await network.findByIdAndUpdate(networkId, {
//     $addToSet: { packages: packageId, },
//     new: true,
//   });
// };

// async function delatePackageInNetwork(networkId) {
//   await package.findOneAndDelete(networkId,);
// };
// module.exports = new package_Price_Controller();


