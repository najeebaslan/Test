const userprf = require("../../models/userProfile");
const packagePrice = require("../../models/Package_Price");
const Cards = require("../../models/cards");
const coverageArea = require("../../models/allCoverage_Area");
require('express-async-errors');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const logger = require("../../config/logger");

class users_reports {
   
    async ReportsBuying(req, res) {
    const incomeId = req.query.inComeId;
    try {
    await userprf.findOne({}, function (error, result) {
    // let profile = resulte[0] ?? { inCome: 0,};
    if (error) return res.status(401).json({Error:error.message});
    if(result==null){
      return res.status(400).json({"Error":"id لا توجد بيانات بهذ ال "})
    }
    return res.status(200).json(result)
    }).where('inCome._id').equals(incomeId)
    .select("inCome.amount , inCome.from_user , inCome.paying_date , inCome.status , inCome._id")
    .populate('from_user', 'name') 
    } catch (error) {
    logger.error("getIncomes==>" + error);
    console.log(error.message);
    return res.status(400).json({"Error": error.message })
    }
    }

  async SalesReports(req, res) {
    const outcomeId = req.query.outComeId;
    try {
    await userprf.find(
    function (error, resulte) {
    if (error) return res.status(500).json({Error:error.message});
if(resulte[0]==null){
return   res.status(404).json({Error:"لاتوجد مبيعات حاليا"})          }
    return res.status(200).json(resulte)
  }).where('outCome._id').equals(outcomeId)
    .select("outCome.amount , outCome.to_user , outCome.paying_date , outCome.status , outCome._id")
    .populate('to_user', 'name')
    } catch (error) {
    logger.error("getOutcomes==>" + error);
    console.log(error.message);
    return res.status(400).json({"Error": error.message })}
    }


    async getReportsBuying(req, res) {/* تقارير مشتريات الكروت */
        const userId = req.query.userId;
        const fromDate = req.query.FromDate;
        const toDate = req.query.ToDate;
        const toMyDate = new Date(toDate)
        const toDateBls1= toMyDate.setDate(toMyDate.getDate()+1);
        try {
         await userprf.aggregate([/*  المستخدم المرسل ي idفلتر مشتريات الكروت  حسب التاريخ و  */
        { $match: { "userId": ObjectId(userId) } },
        { $project: { list: {
        $filter: { input: '$inCome', as: 'item',
        cond: {$and: [
        { $gte: ['$$item.paying_date', new Date(fromDate)] },
        { $lte: ['$$item.paying_date', new Date(toDateBls1)] 
      }
      ]
        }} } } },
        ]).exec((error, result) => {
          console.log(req.query);
        if (error) return res.status(401).json({Error:error.message});
        if(result[0]==null){
          return res.status(400).json({ "Error": 'not found user' })
        }else if(result[0].list[0]==null){
        return res.status(400).json({ "Error":" not found by this filter Date" })
        }
         if(result==null){
          return res.status(400).json({"Error":"id لا توجد بيانات بهذ ال "})
        }
        console.log(error);return res.status(200).send(result)})    
        } catch (error) {
        logger.error("getReportsBuying==>" + error);
        console.log(error.message);
        return res.status(400).json({"Error": error.message })}
       
    }

    async getReportsSales(req, res) {/* تقارير مبيعات الكروت  */
        const userId = req.query.userId;
        const fromDate = req.query.FromDate;
        const toDate = req.query.ToDate;
        const toUser = req.query.toUserId;
        try {
          
          console.log(new  Date(fromDate));
          console.log(new Date(toDate));
           await userprf.aggregate([/*  المستخدم المرسل ي idفلتر مبيعات الكروت  حسب التاريخ و  */
        { $match: { "_id": ObjectId(userId) } },
        { $project: {list: { $filter: {input: '$outCome', as: 'item',
        cond: {$and: [ { $gte: ['$$item.paying_date', new Date(fromDate)] },
        { $lte: ['$$item.paying_date', new Date(toDate)] }, ],},}, }, }},
        // {   $unwind: {
        //     "path" : "$list",   "preserveNullAndEmptyArrays" : true
        // }},
            // {$unwind: { path: "$list", },},/* ملحوضه لا يعمل الامر الذي في السطر التالي الا بتفعيل هذا الامر */
            //  { $match: { 'list.to_user': ObjectId(toUser) } },/* المرسل الية id فلتر حسب  */
            //  {$group: {  "_id": null, "list": { "$sum": '$list' }}}/*  اذا كنت كنت تريد اضهار عدد العمليات فقط من هذا الفلتر */

        ]).exec((error, result) => {
         if (error) return res.status(401).json({Error:error.message});
         if(result[0]==null){
          return res.status(400).json({ "Error": 'not found user' })
        }else if(result[0].list[0]==null){
          return res.status(400).json({ "Error":" not found by this filter Date --- Or not found to user" })
        }
         console.log(error);return res.status(200).send(result)}) 
        } catch (error) {
        logger.error("getReportsSales==>" + error);
        console.log(error.message);
        return res.status(400).json({"Error": error.message })}

        }

    async getRemittancesToMyFromUserId(req, res) {/* الحولات الواصلة لي */
        const userId = req.query.userId;
        const fromUser = req.query.FromUserId;
        
        console.log(req.query);
        console.log(fromUser);        try {
        await userprf.aggregate([/* ذالك المستخدم  (id) الحصول علا الحوالات الواصلة لي من  مستخدم معين عبر   */
        { $match: { "userId": ObjectId(userId) } },
        { $unwind: { path: "$inCome", }, },//convert array to object
        { $match: { 'inCome.from_user': ObjectId(fromUser) } },//filter by id from_user
        { $project: { _id: 0, inCome: 1, } },{$sort:{inCome:-1}},
        {$replaceRoot:{newRoot:"$inCome"}}
      ]).exec((error, result) => {
        if (error) return res.status(401).json({"Error":error.message})
        if(result[0]==null){
          return res.status(401).json({"Error":'error userId or fromUserId'})
        }
        console.log(error); return res.status(200).json(result)})   
        } catch (error) {
        logger.error("getRemittancesToMyFromUserId==>" + error);
        console.log(error.message);
        return res.status(400).json({"Error": error.message })}
    }

    async getTransferrersToUser(req, res) {/* الحولات الخارجه مني */
        const userId = req.query.userId;
        const toUser = req.query.toUserId;
        try {
         await userprf.aggregate([/* ذالك المستخدم  (id) الحصول علا الحوالات التي ارسلها لي مستخدم معين عبر   */
        { $match: { "userId": ObjectId(userId) } },
        { $match: { 'outCome.to_user': ObjectId(toUser) } },//filter by id to_user
        { $project: { _id: 0, outCome: 1, }, },
        {$sort:{outCome:-1}},
        
        ]).exec((error, result) => {
        if (error) return res.status(401).json({Error:error.message});console.log(error);
        if(result[0]==null){
        return res.status(401).json({"Error":'The user you sent to does not exist anymore'})   
        }
        return res.status(200).json(result)})    
        } catch (error) {
        logger.error("getTransferrersToUser==>" + error);
        console.log(error.message);
        return res.status(400).json({"Error": error.message })}
       
    }

    async getTotalBuying(req, res) {/* اجمالي المشتريات */
        const userId = req.query.userId;
        try {
           await userprf.aggregate([
        { "$match": { _id: ObjectId(userId) } },
        { $unwind: "$inCome" },
        { $group: { _id: "$inCome.amount", count: { $sum: 1 } } },
        { $project: { _id: 0, inCome: "$_id", count: 1 } },
        {$sort:{inCome:-1}} ],
        function (err, data) {if (err) throw err;console.log(data);}
        ).exec((error, result) => {
        if (error) return res.status(401).json({Error:error.message});
        if(result[0]==null){
          return res.status(401).json({"Error":'not find Buyings'})   
          }
        console.log(error);return res.status(200).send(result)
        });     
        } catch (error) {
        logger.error("getTotalBuying==>" + error);
        console.log(error.message);
        return res.status(400).json({"Error": error.message })}
    
    }
    async getTotalSales(req, res) {/* اجمالي المبيعات */
        const userId = req.query.userId;
        try {
         await userprf.aggregate([
        { "$match": { _id: ObjectId(userId) } },
        { $unwind: "$outCome" },
        { $group: { _id: "$outCome.amount", count: { $sum: 1 } } },
        { $project: { _id: 0, outCome: "$_id", count: 1,} },],
        function (err, data) {if (err) throw err; console.log(data);}
        ).exec((error, result) => {
        if (error) return res.status(401).json({Error:error.message});
        if(result[0]==null){
        return res.status(401).json({"Error":'not found Sales'})}
        console.log(error); return res.status(200).send(result)});    
        } catch (error) {
        logger.error("getTotalSales==>" + error);
        console.log(error.message);
        return res.status(400).json({"Error": error.message })}
    }

    async getSalesAndBuying(req, res) {/* Post جلب المبيعات والمشتريات بنفس ال */
        const userId = req.query.userId;
        try {
           const findUser = await userprf.find().where('inCome.from_user').equals(userId).select("inCome.amount , inCome.status")
        .where('outCome.to_user').equals(userId).select("outCome.amount , outCome.status -_id")
          if(findUser[0]==null){
        return res.status(401).json({"Error":'Sorry not found Sales or Buying'})}
        res.json(findUser)
        console.log(findUser)  
        } catch (error) {
        logger.error("getSalesAndBuying==>" + error);
        console.log(error.message);
        return res.status(400).json({"Error": error.message })}
    }
    async CardStoreDetails(req, res) {
        const networkId=req.query.networkId;
        console.log(req.query);
        let mergeArrays;
        try {
          const packages = await   packagePrice.find(/*   الحصول علا جميع الباقات ومقارنته با الباقات التي لم تضاف*/
            { network: ObjectId(networkId),isAdd: true,  },
            function(error, data) { 
            if(error)return res.status(404).json({Error:error.message})
            return data});
          const newArray=  packages.map(element => element.package_Price);
        await  Cards.aggregate([/* سيتم تكرار البيانات اكثر من مره من اجل فلترتها اكثر من مره */

        { $match: { "networkId": ObjectId(networkId),} },
        {$project:{ _id:{isActive:"$isActive",Is_new:"$Is_new",
        packagePrice:"$packagePrice", }}},
        { $facet: { "NewCards": [],}},
        {$unwind:"$NewCards"},
        {$replaceRoot:{newRoot:'$NewCards._id',}},

        { $facet: { "NewCards": [
        { $match: { "isActive":true,"Is_new":true,} },
        {$project:{
          _id:{isActive:"$isActive",Is_new:"$Is_new",packagePrice:"$packagePrice"}}},
          {$bucketAuto: {groupBy: "$_id.packagePrice", buckets: 1000000000,
          output: { "count": { $sum: 1 },
          } }},    
        ],
        "SoldCards": [
       { $match: { "isActive":true,"Is_new":false,} },
        {$project:{
        _id:{isActive:"$isActive",Is_new:"$Is_new",packagePrice:"$packagePrice"}}},
        {$bucketAuto: {groupBy: "$_id.packagePrice", buckets: 1000000000,
        output: { "count": { $sum: 1 },
        } }},    
         ],
        "InActive": [
        { $match: { "isActive":false,} },
        {$project:{
        _id:{isActive:"$isActive",Is_new:"$Is_new",packagePrice:"$packagePrice"}}},
        {$bucketAuto: {groupBy: "$_id.packagePrice", buckets: 1000000000,
        output: { "count": { $sum: 1 },
        } }}, ],}},

        ]).exec((error,result)=>{
        
         let newCards=result[0].NewCards||0;

         let soldCards=result[0].SoldCards||0;

         let inActive=result[0].InActive||0;
         
         if(soldCards[0]==null){soldCards=[{_id:{min:0,max:0},count:0}]}

         if(newCards[0]==null){newCards=[{_id:{min:0,max:0},count:0}]}

         if(inActive[0]==null){inActive=[{_id:{min:0,max:0},count:0}]}
         const newArrays= inActive.map(element => element._id);
         const newArray1= soldCards.map(element => element._id.min);
         const newArray2= newCards.map(element => element._id.min);
        
        if(error)return res.status(404).json({Error:error.message})
         mergeArrays=[...newArray2, ...newArray1,];/* دمج اكثر من مصفوفة مع بعض */

        function arr_diff (a1, a2) {/* مقارنة الباقات التي مضاف اليها كروت وغير المضافة */
          var a = [], diff = [];
          for (var i = 0; i < a1.length; i++) {a[a1[i]] = true;}
      
          for (var i = 0; i < a2.length; i++) {
          if (a[a2[i]]) {  delete a[a2[i]];}
          else {a[a2[i]] = true;}
          }
          for (var k in a) {  diff.push(k);}
          return diff;
      }
      
       let packagenullcards= arr_diff(mergeArrays, newArray)
       if(packagenullcards[0]==null){
       packagenullcards[0]={_id:{min:0,max:0},count:0} }
       
        return res.status(200).json({
        "NewCards":newCards,"SoldCards":soldCards,
        "InActive":inActive,"EmptypackagesOfCards":packagenullcards})
        });
        } catch (error) {
          logger.error("PackageBestSelling==>"+error);
          return res.status(401).json({Error:error.message});
        }
        }

        async  CardsSoldInSpecificated(req,res){
            let areas;
        const  networkId=req.query.networkId;
        try { 
    await coverageArea.find({networkId:ObjectId(networkId)}).select('allCoverage_Area -_id').then(data=>{
        var nameSarees = data.map(x=>x.allCoverage_Area)
        console.log(nameSarees)
        areas=nameSarees;
        console.log(areas);
         Cards.aggregate([
        
        { $match:{areaUserPay:{$in : [ 'الجرن', 'البعيمي', 'رقاب' ]}, "networkId": ObjectId(networkId), Is_new: false, isActive: true,} }, 
        { $project: {_id:{areaUserPay:"$areaUserPay",packagePrice:"$packagePrice"}}},
        { $facet: { 
        "outCome": [
        // {$bucketAuto: {groupBy: "$areaUserPay", buckets: 1000000000,
        // output: { "count": { $sum: 1 },
        // } }},
        {$bucketAuto: {groupBy: "$_id.areaUserPay", buckets: 1000000000,
        output: {
            //  "count": { $sum: 1 },
              "packagePrice": { $push: "$_id.packagePrice" },
        // count: { $sort: -1 },
     }}},
        ],

    //     "income": [
    //         // {$bucketAuto: {groupBy: "$areaUserPay", buckets: 1000000000,
    //         // output: { "count": { $sum: 1 },
    //         // } }},
    //     {$bucketAuto: {groupBy: "$_id.packagePrice", buckets: 1000000000,
    //     output: { "count": { $sum: 1 }, "packagePrice": { $push: "$_id.packagePrice" },
    //     "areaUserPay": { $push: "$_id.areaUserPay" },
    //     countCards: { $sum: 1 },/* اجمالي الرصيد الذي اشتريت به من هذه الفئة */
    //     } }}
    
    
    // ],
    
    }},
    {$unwind:"$outCome"},
    {$replaceRoot:{newRoot:'$outCome',}},
    // {  $project: {
    //     item: 1,
    //     dimensions: { $arrayToObject: "$packagePrice" }
    //  }}

    // {$unwind:"$packagePrice"},
    // {$replaceRoot:{newRoot:'$packagePrice',}},

       
        ]).then(data=>{
console.log(data);
return  res.json(data)
//  console.log(data[index].packagePrice+"");
            // var consume = [{"key":"Test1"},{"key":"Test2"},{"key":"Test3"},{"key":"Test1"},{"key":"Test3"},{"key":"Test1"}]
//  const dats={}
//             // var a = ["name", "name", "name", "2", "2", "2", "2", "2", "9", "4"]
            
//             var a =  data[0].packagePrice.reduce(function (acc, curr) {
//                 if (typeof acc[curr] == 'undefined') {
//                     acc[curr] = 1;
//                 } else {
//                     acc[curr] += 1;
//                 }
              
//                 return acc;
//               }, {});


//             //   console.log(a);
//            var consume= [
//             {
//                 "areaUserPay": "الجرن",
//                 "packagePrice": 200
//             },
//             {
//                 "areaUserPay": "الجرن",
//                 "packagePrice": 100
//             },
//             {
//                 "areaUserPay": "رقاب",
//                 "packagePrice": 100
//             },
//             {
//                 "areaUserPay": "رقاب",
//                 "packagePrice": 200
//             },
            // { _id: { min: 'الجرن', max: 'رقاب' }, packagePrice: 200 },
            // { _id: { min: 'الجرن', max: 'رقاب' }, packagePrice: 200 },
            // { _id: { min: 'الجرن', max: 'رقاب' }, packagePrice: 200 },
            // { _id: { min: 'الجرن', max: 'رقاب' }, packagePrice: 100 },
            // { _id: { min: 'الجرن', max: 'رقاب' }, packagePrice: 100 },
            // { _id: { min: 'رقاب', max: 'رقاب' }, packagePrice: 200 },
            // { _id: { min: 'رقاب', max: 'رقاب' }, packagePrice: 200 },
            // { _id: { min: 'رقاب', max: 'رقاب' }, packagePrice: 200 },
            // { _id: { min: 'رقاب', max: 'رقاب' }, packagePrice: 200 },
            // { _id: { min: 'رقاب', max: 'رقاب' }, packagePrice: 200 },
            // { _id: { min: 'رقاب', max: 'رقاب' }, packagePrice: 200 },
            // { _id: { min: 'رقاب', max: 'رقاب' }, packagePrice: 100 },
            // { _id: { min: 'رقاب', max: 'رقاب' }, packagePrice: 100 },
            // { _id: { min: 'رقاب', max: 'رقاب' }, packagePrice: 100 }
    //   ]
//  var temp = [];
 
//  var produce = [];
//  var produce1 = [];
//  var nameSarees = data.map(x=>x.packagePrice,function (x) { counts[x] = (counts[x] || 0) + 1; })
// console.log([nameSarees]);
// const array1 = ['a', 'b', 'c'];
// var datass={};
// var nameSarees=   data.forEach(element => {
// //    var gg= element.packagePrice. split(' []')[0]
//     console.log(element.packagePrice);
   
//     // console.log(element.datass=   element.packagePrice)
// });
// var index, len;
// var a1 = data;
// var array=[]
// for (index = 0, len = a1.length; index < len; ++index) {
//     // console.log(a1[index].packagePrice);
//     array.push(a1[index].packagePrice   )
// }
// console.log(array);
// var array_one = ['a','b','c','d'];
// var array_two =['z','x','y','a'];
// array_one.forEach(function(item){
//   var isPresent = array_two.indexOf(item);
//   if(isPresent !== -1){
//     console.log(item)
//   }
// })
// const counts = {};
// const sampleArray =  [
//             200,
//             200,
//             200,
//             100,
//             100
//         ];
// sampleArray.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });
// console.log(counts)
//   const newData = [].concat(...array);
  
// //   console.log(newData);
//   var myArray =[[1,2,3,4,5], 
//               [1,2,3,4,5], 
//               [1,2,3,4,5], 
//               [1,2,3,4,5]];
//   console.log("[[" + myArray.join("],[") + "]]");
// // # [[1,2,3,4,5],[1,2,3,4,5],[1,2,3,4,5],[1,2,3,4,5]]
// console.log(JSON.stringify(myArray));
// # [[1,2,3,4,5],[1,2,3,4,5],[1,2,3,4,5],[1,2,3,4,5]]
// const items2 = ['pencil', 'book','pencil']

// function find_duplicate_in_array(array){
// const count = {}
// const result = []

// array.forEach(item => {
//     if (count[item]) {
//        count[item] +=1
//        return
//     }
//     count[item] = 1
// })

// for (let prop in count){
//     if (count[prop] >=2){
//         result.push(prop)
//     }
// }

// console.log(count)
// return result;

// }

// find_duplicate_in_array(nameSarees)
//  for(var i=0;i<data.length;i++){
//      console.log('packagePrice');
//             var nameSarees = data.map(x=>x.packagePrice,function (x) { counts[x] = (counts[x] || 0) + 1; })

//      console.log(nameSarees);
// //    function name(i) {
// //    log
// //     // for(var i=i;i<data.length;i++){
// //     //     // console.log(data[i].packagePrice[i]);
// //     //     console.log('najeeb'+i);
// //     //     // for(var i=0;i<data[0].packagePrice.length;i++){
// //     //     //     console.log('aslan');
            
// //     //     //  } 
// //     //  } 
// //    }
// //    name(i)
//  }


//  for(var i=0;i<consume.length;i++){
//    if(temp.indexOf(consume[i].areaUserPay) == -1){
//    		temp.push(consume[i].areaUserPay);
//            var _datas = {};
//            _datas.packagePrice = consume[i].packagePrice
//            _datas.count = 1;
//       var _data = [];

//       _data.areaUserPay = consume[i].areaUserPay
//       _data.count = 1;
//       produce.push(_data,_datas,);
      
//    }else{
//      for(var j=0;j<produce.length;j++){
//      		if(produce[j].packagePrice === consume[i].packagePrice){
//         		var _x = parseInt(produce[j].count) + 1;
//             produce[j].count = _x;
//         }

//      }
//    }
//  }

// console.log(produce);
// console.log(produce1);


            // const counts = {};
            // const sampleArray = ['a', 'a', 'b', 'c'];
            // sampleArray.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });
            // console.log(counts)
            // var nameSarees = data[0].outCome.map(x=>x.packagePrice,function (x) { counts[x] = (counts[x] || 0) + 1; })
            // console.log(nameSarees);
            // var namesareas1 = nameSarees.map(x=>x,function (x) { counts[x] = (counts[x] || 0) + 1; })
            // console.log(namesareas1);
            // const counts = {};
            // const sampleArray = ['a', 'a', 'b', 'c'];
            // nameSarees[0].map(function (x) { counts[x] = (counts[x] || 0) + 1; });
            // console.log(counts)
            // var nameSarees = data.map(x=>x,function (x) { counts[x] = (counts[x] || 0) + 1; })
           
        //    console.log(nameSarees);

        //    console.log(nameSarees[0].packagePrice.sort());
     
        //    console.log(nameSarees.packagePrice);
        // console.log(nameSarees[0].packagePrice);
// console.log(namesareasd);
          

            // const findDuplicates = (arr) => {
            //     let sorted_arr = arr.slice().sort(); // You can define the comparing function here. 
            //     // JS by default uses a crappy string compare.
            //     // (we use slice to clone the array so the
            //     // original array won't be modified)
            //     let results = [];
            //     for (let i = 0; i < sorted_arr.length - 1; i++) {
            //       if (sorted_arr[i + 1] == sorted_arr[i]) {
            //         results.push(sorted_arr[i]);
            //       }
            //     }
            //     return results;
            //   }
              
            //   let duplicatedArray = [9, 9, 111, 2, 2, 3, 4, 4, 5, 7];
            //   console.log(`The duplicates in ${duplicatedArray} are ${findDuplicates(duplicatedArray)}`);

//               Array.prototype.unique = function () {
//                 var r = new Array();
//                 o:for(var i = 0, n = this.length; i < n; i++)
//                 {
//                     for(var x = 0, y = r.length; x < y; x++)
//                     {
//                         if(r[x]==this[i])
//                         {
//                             console.log('this is a DUPE!');
//                             continue o;
//                         }
//                     }
//                     r[r.length] = this[i];
//                 }
//                 return r;
//             }
            
//             var arr = [1,2,2,3,3,4,5,6,2,3,7,8,5,9];
//             var unique = arr.unique();
// console.log(unique);





















    //     Cards.aggregate(
    //     [
    //     { $match: { "networkId": ObjectId(netwotkId), Is_new: false, isActive: true,} },

    //     /* get data from documents packages */
    //     {  $lookup:{from: "packages", pipeline: [{ $match: { networkId: ObjectId (netwotkId) ,isActive:true } },
    //     { $project: { _id: 0, date: { _idpackage: "$_id", } } },
    //     { $replaceRoot: { newRoot: "$date" }
    //     }
    //     ], as: "detilecard"},},
    //     { $project: { _id: 0, date: { detilecard: "$detilecard",
    //     userPay:"$userPay",
    //     packagePrice:"$packagePrice"},},}, 
        
    // ]
    //     ).exec((error,result)=>{
    //     if(error)return res.status(404).json({Error:error.message})
    //     return  res.status(200).json(result)


    //     //     console.log(resulte[0]);
    //     //        const user = {'TheReports.to_user.Village':'البعيمي' }

    //     //     const opts = [{ path: 'packagePrice' ,
    //     //     select:"package_PriceId -_id",
    //     //     populate:{path:'package_PriceId',select:"package_Price "}}];

    //     //     const optsusers = [{ path: 'userId' ,
    //     //     select:"Village Governorate City -_id",

    //     //     //  match: { Village: { $sum: 1 } }
    //     //     }];

    //     //         const promise = packages.populate(resulte, opts)
    //     //         promise.then(data=>{
    //     //             const promise1 = users.  populate(data,optsusers);
    //     //             promise1.then(datas=>{
    //     //                 res.json(datas)


    //     //     // res.json(resulte)

    //     })
        }).catch(error=>{
        logger.error("CardsSoldInSpecificated==>"+error);
        return res.status(401).json({Error:error.message});
        })  }).catch(error=>{
            logger.error("CardsSoldInSpecificated==>"+error);
        return res.status(401).json({Error:error.message}); 
        })
        } catch (error) {
        logger.error("CardsSoldInSpecificated==>"+error);
        return res.status(401).json({Error:error.message}); 
        }











// .populate({path:'outCome.to_user',select:('Village Governorate City -_id')});
   
//    find({$match:{"outCome.status":'Salebalance'}}).select('-_id outCome')
       
    
    // {},{  "outCome.status":"baycard"})
//    .where('outCome.status').equals('baycard')
//    .select("outCome.amount , outCome.to_user , outCome.paying_date , outCome.status , outCome._id")
//    .populate('to_user',) 

// res.json(cardssold)


    // })
       }}

        
module.exports = new users_reports();
