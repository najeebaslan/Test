      const profile = require("../../models/userProfile");
      require('express-async-errors'); 
      const mongoose = require("mongoose");
      const logger = require("../../config/logger");
      const ObjectId = mongoose.Types.ObjectId;
      class FilterSelling{
      async PackageBestSelling(req, res) {/* فلتر الاكثر باقات مبيعات */

      const reqQueryObject = req.query ;
      console.log(reqQueryObject);
      const userId = req.query.userId ;
      try {
      await profile.aggregate( [
      { $match: { "_id": ObjectId(userId), } },
      { $project: {list: { $filter: {input: '$outCome', as: 'item',
      cond: {
      $and: [ {$eq: ['$$item.status','buyCard'],},],},}, }, }},
      { $project: {outCome:"$list"}},
      {$unwind: { path: "$outCome", },},
      { $facet: { "outCome": [
      {$bucketAuto: {groupBy: "$outCome.packagePrice", buckets: 1000000000,
      output: { "count": { $sum: 1 },
      outCome: { $sum: "$outCome.amount" },/* اجمالي الرصيد الذي اشتريت به من هذه الفئة */
      } }},],}},
      {$unwind: '$outCome'}, 
      {$sort: {'outCome.count': -1}}, 
      {$group: {_id: '$_id', 'outCome': {$push: '$outCome'}}}
      ] ).exec((error ,result)=>{
      if (error)return res.status(401).json({Error:error.message});
      if(result[0]==undefined){
      res.status(401).json({Error:'لاتوجد بيانات متطابقة مع  الفلتر الذي قمت بتحديده'})
      return false;
      }
      res.json( result[0].outCome)
      })  
      } catch (error) {
      logger.error("getFirstCardAndUpdate==>"+error);
      return res.status(404).json({Error:error.message});
      }
      }}
   module.exports = new FilterSelling();
