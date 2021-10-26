       const profile = require("../../models/userProfile");
        const Cards = require("../../models/cards");
        const logger = require("../../config/logger");
        const mongoose = require("mongoose");
        const ObjectId = mongoose.Types.ObjectId;
        const moment = require('moment');

        class FilterBuying {
        async FilterBayingReports(req, res) {
        const networkId = req.query.networkId;
        const userId = req.query.userId;
        const package_Prices = req.query.packagePrice;//🤨🤨🤨🤨🤨🤨🤨🤨
        const fromDate = req.query.FromDate;
        const toDate = req.query.ToDate;
        const fromUser = req.body.fromUserId;
        let test , test1;
        console.log(userId);
        /* Month  */ 
        var ThisMonth = moment().subtract(1,'month');
        const month1 = new Date(ThisMonth)
        const toMonthBlase1= month1.setDate(month1.getDate()+33);
        /* Day */
        var ThisToDay = moment().subtract('day').format('YYYY-MM-DD');
        const tomorrow = new Date(ThisToDay)
        const toDayBlase1= tomorrow.setDate(tomorrow.getDate()+1);
        const date = new Date(toDate)
        const ToDate=date.setDate(date.getDate()+1 )
        /* Year */
        var ThisYear = moment().subtract(1,'year');
        var ThisYear2 = moment().subtract(1,'year');

        var ThisYear2 = moment().subtract(10,'year');
        var ThisYear1 = moment().subtract('year');
        const blsYear=new Date(ThisYear1)
        console.log(new Date(ThisYear1));
        const resultBls=blsYear.setDate(blsYear.getDate()+250 )
        //........................................................
        const ToDay = req.query.ToDay;
        const Week = req.query.Week;
        const Month = req.query.Month;
        const Year = req.query.Year;
        let infoSelectData=false;
        console.log(Week);
        function filterAll() {
        if(moment(new Date(fromDate), "YYYY-MM-DD").isValid()==true&&
        moment(new Date(toDate),"YYYY-MM-DD").isValid()==true){
        test=new Date(fromDate),test1=new Date(ToDate); console.log('toDate = Ok');}/* فلتر حسب التاريخ من ===>الي */
        /* فلتر حسب التاريخ من الى */
        else if(ToDay=='ToDay') {
        console.log(ToDay);
        test= new Date(ThisToDay), test1=new Date(toDayBlase1)}/* فلتر حسب مبيعات اليوم */
        else if(Month=='Month'){
        console.log(Month);
        test=new Date(ThisMonth._d) ,test1=new Date(toMonthBlase1)}/* فلتر حسب مبيعات الشهر */
        else if(Year=='Year'){
        console.log('Year');
        test=new Date(ThisYear._d),test1= new Date(ThisYear1._d)}   /* فلتر حسب مبيعات السنه */
        else if(Week=='Week') {
        console.log('week');
        const date1 = new Date(); const today1 = date1.getDate();/* فلتر حسب مبيعات الاسبوع */
        const dayOfTheWeek1 = date1.getDay();
        const newDate1 = date1.setDate(today1 - dayOfTheWeek1 + 7);
        test1= new Date(newDate1);
        const date2= new Date();const today2 = date2.getDate();
        const dayOfTheWeek2 = date2.getDay();
        const newDate2 = date2.setDate(today2 - (dayOfTheWeek2 || 7));
        test= new Date(newDate2);}else{
        infoSelectData=true;
        console.log('IF No Selected Data Do It This');
        test=new Date(ThisYear2),test1=new Date(resultBls)}
        }
        filterAll()
        try {
        await profile.aggregate([/* فلتره تقارير المشتريات */
        { $match: { "_id": ObjectId(userId) } },
        /* get data from documents network */
        {  $lookup:{from: "networks", pipeline: [{ $match: { _id: ObjectId (networkId) ,isActive:true } },
        { $project: { _id: 0, date: { nameA: "$nameA", } } },
        { $replaceRoot: { newRoot: "$date" } }], as: "networks"},},
        /* get data from documents users */
        { $lookup:{from: "users",pipeline: [{ $match: { "_id":ObjectId(userId)  } },
        { $project: { _id: 0, date: { userType: "$userType", numberAccount: "$numberAccount" ,},} },
        { $replaceRoot: { newRoot: "$date" } }], as: "users"},},
        { $project: { _id: 0,networks: "$networks", package_Prices: "$package_Prices" ,users:"$users",
        TheReports: { $filter: { input: '$outCome', as: 'item',cond: {$and: [
        {$eq: ['$$item.status','buyCard'],},/*فلتر حسب نوع العملية شراء كرت او تحويل رصيد  */
        { $gt: ['$$item.paying_date',test] }, { $lt: ['$$item.paying_date',test1] },/* فلتر حسب مبيعات الاسبوع */
        { $eq: ['$$item.packagePrice',Number(package_Prices)] },/* فلتر حسب سعر الباقة */
        ]},}},},},  
      
        { $project: {  TotalAmount: { $sum: "$TheReports.amount" } ,package_Prices:1,TheReports:1,networks:1,users:1} },

        ]).exec((error, result) => {
          console.log(result);
        if(error){
        res.status(401).json({Error:error.message});
        return false;
        }
        if(result[0]==undefined){
        res.status(401).json('غير موجوده  ids هنالك خطاء في عناوين ال  ');
        return false;
        }
        console.log(error);
        var b= JSON.stringify(result);
        var c = b.substring(1,b.length-1);
        const convertArray= JSON.parse(c);
        let amount;
        let   TotalCommission;
        function validationAmount(){
        if(convertArray.TheReports[0]!==undefined){
        amount =result[0].TheReports[0].amount;
        const packagePrice=result[0].TheReports[0].packagePrice;
        TotalCommission =packagePrice-amount;
        if(infoSelectData==true){
          TotalCommission='No commission';
        console.log(infoSelectData);
        }
        }else {
        infoSelectData=false;
        const resultPri=amount= result[0].TheReports[0]||0 ;
        console.log(resultPri);
        const packagePrice=result[0].TheReports[0];
        TotalCommission =packagePrice-amount||{commission: 0};
        console.log(infoSelectData);
        }
        };

        validationAmount()
        console.log(TotalCommission);
        if(convertArray.TheReports[0]==undefined){
        res.status(401).json('لاتوجد بيانات متطابقة مع  الفلتر الذي قمت بتحديده')
        return false;
        }else {
          console.log(TotalCommission+'lll');
        let countCards=0;convertArray.TheReports.forEach(function(element) { countCards++}); //<==== /* عدد الكروت */
        TotalCommission=  TotalCommission*countCards||0
       return  res.status(200).json({result,TotalCommission,countCards})
      }
        });
        } catch (error) {
        logger.error("FilterBayingReports==>"+error);
        return res.status(404).json({Error:error.message});
        }}

        async PackageBestSelling(req, res) { /* فلتر الاكثر باقات مشتريات */
        try {

        const reqQueryObject = req.query ;
        console.log(reqQueryObject);
        const userId = req.query.userId ;
        await profile.aggregate( [
        { $match: { "_id": ObjectId(userId), } },
        { $project: {list: { $filter: {input: '$outCome', as: 'item',
        cond: {
        $and: [ 
        {$eq: ['$$item.status','buyCard'],},],},}, }, }},
        { $project: {outCome:"$list"}},
        {$unwind: { path: "$outCome", },},
        { $facet: { 
        "outCome": [
        {$bucketAuto: {groupBy: "$outCome.packagePrice", buckets: 1000000000,
        output: { "count": { $sum: 1 }, "outCome": { $push: "$outCome" },
        TotalBalance: { $sum: "$outCome.amount" },/* اجمالي الرصيد الذي اشتريت به من هذه الفئة */
        } }}],}},
        {$unwind: '$outCome'}, 
        {$sort: {'outCome.count': -1}}, 
        {$group: {_id: '$_id', 'outCome': {$push: '$outCome'},},},
        {$unwind: '$outCome'}, 

        { $replaceRoot: { newRoot:{count:"$outCome.count",package:"$outCome._id.min",datas:"$outCome.outCome",TotalBalance:"$outCome.TotalBalance"}, } },
      // {$replaceRoot:{newRoot:"$outCome.outCome"}}
      // {$unwind: '$data'}, 

        ] ).exec((error ,result)=>{
     
        if (error)return res.status(401).json({Error:error.message});

        if(result[0]==undefined){
        res.status(401).json('لاتوجد بيانات متطابقة مع  الفلتر الذي قمت بتحديده')
        return false;}
        var jsonObject = {
          "expirationDate":"April 21, 2017",
          "remainingDays":325,
          "seats":[{"activeStatus":"S","pid":"TE70","firstName":"TE70","countryid":840},
                  {"activeStatus":"Y","pid":"TE80","firstName":"TE80","countryid":845}]
           }
          var datass=[]
 var namesareas = result.map(x=>x.data,function (x) {

    counts[x] = (counts[x] || 0) + 1; 
    }
  
    
    )
          // console.log(namesareas);
        //   var lastElement = result[0].outCome.outCome[jsonObject.seats.length-1].countryid;
        //   console.log(lastElement);        // var countryId = result[0].outCome[0].outCome[result[0].outCome[0].outCome-1].operation_number;
        // console.log(countryId);
        return res.json(result)
        })
        } catch (error) {
        logger.error("PackageBestSelling==>"+error);
        return res.status(401).json({Error:error.message});
        }
        }
     
   
        }
    module.exports = new FilterBuying();
