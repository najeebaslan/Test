
const {ObjectId,logger,mongoose,Joi}=require('../utils/utils')
const {customValidation}=require('../utils/validation')
const {findNetwork}=require('../utils/find_utils')


const coverage = require("../models/coverage");
const network = require("../models/network");
const AllCoverage = require("../models/allCoverage_Area");

require('express-async-errors');

class Coverage_area_Controller {

  async PostAllCoverage(req, res,) {
   
    try {
    const id = new mongoose.Types.ObjectId();
    const body=req.body;
    const Schema = {
    allCoverage_Area: Joi.string().min(3).max(44).required(),
    networkId: Joi.string().required(),
    };
    const {error}=customValidation(body,Schema);
    if(error)return res.status(404).json({Error:error.details[0].message})
    
    const findN =await findNetwork(body.networkId)
    console.log(findN);
    if(findN[0]==true)return res.status(404).json({"Error":"not found this network"})

    const findArea=await AllCoverage.findOne({networkId: body.networkId,allCoverage_Area: body.allCoverage_Area,})
    if(findArea)return res.status(402).json({'Error':"this Area already exist"})

    const allCoverage_Area = new AllCoverage({
    _id: id,networkId: body.networkId,
    allCoverage_Area: body.allCoverage_Area,
    })
    const idNetwork = body.networkId;
    await allCoverage_Area.save()
    await network.findByIdAndUpdate(idNetwork,
    {$addToSet: {allCoverage_Area: id,},});
   const getAllArea= await AllCoverage.
   find({networkId:idNetwork})
   .select('allCoverage_Area')
    return res.status(200).send(getAllArea)
    } catch (e) {
    return  res.status(400).send({"Error":e.message})
    }

  };

  async getAllAreaByIdNetwork(req, res) {
    try {
      const id = req.params;
      const findArea = await AllCoverage.find({ networkId: id })
      // .select('allCoverage_Area networkId')
      return res.status(200).send(findArea)   
    
    } catch (e) {
     return res.status(400).send({ "status": false ,"Error":e.message})
    }
  }

  async UpdateArea(req, res) {
    const updates = Object.keys(req.body);
    try {
      const area = await AllCoverage.
        findByIdAndUpdate(req.params.id, req.body.allCoverage_Area)
      if (!area) {
      return res.status(404).send({ Error: false })
      }
      updates.forEach((update) => area[update] = req.body[update])
      area.save()
      res.status(200).send({ "status": true })
    } catch (e) {
      res.status(400).send({ "Error": e.message })
    }
  }
  async getAllArea(req, res) {
    try {
    const findArea = await coverage.find().select('governorate village city -_id')
    // .populate({ path: "network", select: "name address" });
    if(findArea==[]){
    console.log('najeeb error');
    }
    return res.status(200).json(findArea);} 
    catch (error) {return res.status(404).json(error.message);} }

  async findAreaByIdAndDelete(req, res) {
    const id = req.params;
    console.log(id);
    try {
    await AllCoverage.findOneAndDelete(id,function(error,data){
    if(error)return res.status(400).json({Error:error.message});
    if(data==null)return res.status(400).json({"Error":' لم يتم العثور على هذه المنطقة'});
    return res.status(200).json(data);
    })
    } catch (error) {
    logger.error("findAreaByIdAndDelete==>"+error);
    return res.status(400).json({Error:error.message});
    }}

  async getAreaByName(req, res) {
    const names = req.query.governorate;
    try {
   await coverage.find({governorate: { $regex: names },},
    function (err, coverage) {
    if (err) { logger.error("getAreaByName==>"+err);
    // return res.status(400).json({Error:err.message});
  }
    if(coverage[0]==null){
    return res.json({"Error":"no area found for this name: " + names});}
    return res.status(200).json(coverage);
    })
    } catch (error) {
    logger.error("getAreaByName==>"+error);
    return res.status(404).json(error.message);
    }
  }
  //.....................................فلتر حسب سعر الفئة

  async findAreaById(req, res) {
    try {
      console.log(""+ req.params);
      const area_name = await coverage.findById({ _id: req.params }, function (err) {
      if (err){logger.error("findAreaById==>"+err); return res.status(200).json(err.message)};
    });
    if(area_name==undefined){console.log('aslam');
      return res.status(404).json('لا توجد هذه المنطقة')
    }
    return res.json([area_name]);   
    } catch (error) {
      logger.error("findAreaById==>"+error);
       return res.status(404).json(error.message)
    }
  
  }

  async CoveragesCount(req, res) {
    const data = req.body;
    console.log(data);
    const Coverages = await coverage.countDocuments(data,
      function (err, count) {
        logger.error("CoveragesCount==>"+err);
        if(err)return res.status(401).json({Error:err.message})
        return count
      });
    if (!Coverages) {
      return res.status(401).json({Error:"no network found"});
    }
    return res.status(200).json({"Coverages":Coverages});
  }
}

async function setPackageInNetwork(AllCoverageId, networkId) {
  await network.findByIdAndUpdate(networkId, {
    $addToSet: { allCoverage_Area: AllCoverageId, },
    new: true,
  });
};
async function findAreaName(areaName, networkId) {

  const area_name = await coverage.findOne({ name: areaName }, function (err) {
    if (err) {logger.error("findAreaName==>"+err);return res.json(err.message)};
  });
  const areaId = area_name.body._id
  console.log(areaId)
  if (area_name) {
    await coverage.findByIdAndUpdate(areaId, {
      $addToSet: {
        networks: networkId,
      },
    });
    await network.findByIdAndUpdate(networkId, {

      $addToSet: {
        coverage_areaId: areaId,
      },
    });
    console.log(networkId, areaId)
    console.log(areaName)
    return res.json(areaName);
  }
}

module.exports = new Coverage_area_Controller();
