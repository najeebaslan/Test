   const locationM = require("../../models/location");
   require('express-async-errors');
   const { logger, mongoose, ObjectId, } = require('../../utils/utils')
 
   class Location {
      
   async carateLocation(req, res) {

   try {
   const body = req.body;
   const governorate = locationM(
   { name: body.name });
   governorate.save(function (err, data) {
   if (err) return res.json({ Error: err.message });
   return res.status(200).send({ name: governorate.name, _id: governorate._id })
   })
   }
   catch (error) {
   logger.error("carateLocation==>" + error);
   return res.status(404).json({ Error: error.message });
   }
   }
   
   async carateCity(req, res) {
     
   try {
    const idC = new mongoose.Types.ObjectId();
    const idS = new mongoose.Types.ObjectId();
   const body = req.body;
   let idCity,idStreet;
   const findGovernorate = await locationM.findOne({ _id:ObjectId(body.governorateId) })//Find Governorate By Id
   if (!findGovernorate) {
   res.status(401).json({ "Error": 'not found this governorate' })
   return false;
   } else if (findGovernorate) {
   
   const city = await locationM.aggregate([//Find City By Id Governorate
   { $match: { "_id": ObjectId(body.governorateId) } },
   {
   $project: {
   list: {
   $filter: {
   input: '$cities', as: 'item',
   cond: {
   $and: [{
   $eq: ['$$item.name', body.cityName.trim()]
   }]
   }}}}},
  { $unwind: "$list" },
  { $match: {"list.name": body.cityName.trim()}},
  { $project: { cities: "$list" } },
  
   ]).exec()
   if (city[0] == undefined) {// This for check if city is not exist do set city 
    idStreet=  idS;
    idCity=idC;
   await locationM.findByIdAndUpdate(body.governorateId,
   { $push: { cities: {_id:idCity, name: body.cityName.trim() }, } }, )
   .then(data => {
   SetStreet(res,body.streetName,body.cityName,idStreet,body.governorateId)
   return res.status(200).json({"idCity":idCity,"idStreet":idStreet,})
   });
   
   } else { //This for check if street is not exist do set street  
   idCity=city[0].cities._id;
   const street = await locationM.aggregate([
    { $unwind: "$cities" },
   { $match: { "cities._id": ObjectId(city[0].cities._id) } },
 
   {
   $project: {
   list: {
   $filter: {
   input: '$cities.streets', as: 'item',
   cond: {
   $and: [{
   $eq: ['$$item.name', body.streetName.trim()]
   }]
   }
   }}
   }},
   { $unwind: "$list" },
   {$replaceRoot:{newRoot:'$list',}},
   { $match: {"name":body.streetName.trim()}},
   ]).exec()
  
   
   if (street[0] == undefined) {
   SetStreet(res, body.streetName, body.cityName,idS,body.governorateId)
   return res.status(200).json({"idCity":idCity,"idStreet":idS,})
   }else{
    idStreet=street[0]._id;
    return res.status(200).json({"idCity":idCity,"idStreet":idStreet,})    
   } 
   }
   }
   
   } catch (error) {
   logger.error("carateCity==>" + error);
   return res.status(404).json({ Error: error.message });
   }
   }
   }
   
   
   async function SetStreet(res, streetName, cityName,idSt,idCity) {
      console.log(cityName);
      console.log(idSt);
   await locationM.updateOne(
   { "cities.name": cityName.trim() , "_id": idCity.trim() ,},
   { $push: { "cities.$.streets": { "name": streetName.trim(),"_id":idSt     } } }
   ).then(data => {
   
   }).catch(error => {
   logger.error("SetStreet==>" + error);
   return res.status(404).json({ Error: error.message });
   })
   };
   module.exports = new Location();
   module.exports.SetStreet=SetStreet;

