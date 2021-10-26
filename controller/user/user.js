
const user = require("../../models/users");
const userPro = require("../../models/userProfile");
require('express-async-errors');
const logger = require("../../config/logger");
const _ = require("lodash");/*input تعمل علا محاربة الهاكر من ناحية ال  */
const moment = require('moment')
const operation_number = moment().format("hmmss");
const myRnId = () => parseInt(Math.random() * operation_number);

class UserController {

 

  async getOneUser(req, res) {
    const id = req.params;
    try {
      const oneUser = await user.findById(id).populate({ path: 'phone', select: "phone -_id" });
      if (!oneUser) {
      console.log("oneUser not found !");
      return res.json({"Error":"هذا المستخدم غير موجود"});
      }
      return res.json(oneUser);
    }
    catch (error) {
    logger.error("getUsers==>" + error);
    console.log(error.message);
    return res.status(400).json({ "Error": error.message })
    }
  }

  async userAccount(req, res) {
    const data = req.body;
    try {
      const users = await user.countDocuments(data, function (err, count) {
      console.log('there are %d users', count); });
      if (!users) { return res.json({"Error":"هذا المستخدم غير موجود"}); }
      return res.status(200).json({"count":users});
      } catch (error) {
      logger.error("userAccount==>" + error);
      console.log(error.message);
      return res.status(400).json({ "Error": error.message })
    }
  };

  async getUserProfile(req, res) {
    const id = req.params;
    try {
      const userProfile = await userPro.findById(id).populate({ path: "userId" })
      if (!userProfile) return res.json({"Error":"هذا المستخدم غير موجود"});
      else {
        userPro.aggregate([{ $match: { _id: userProfile._id } },
        {
        $project: {
        inCome: { $sum: "$inCome.amount" },
        outCome: { $sum: "$outCome.amount" }}
        }, 
        { $addFields: { balance: { $add: ["$inCome", "$outCome"] } } }
        ]).exec((error, result) => {
        if (error) {
       return res.status(500).json({ Error: error })
        } else {
        let profile = result[0] || { inCome: 0, outCome: 0 };
        const bls = profile.inCome;
        const mins = profile.outCome;
        const results = bls - mins;
        return res.status(200).json([{ "username": userProfile.username, "_id": userProfile._id, "balance": results, "numberAccount": userProfile.userId.numberAccount,'exports':mins,"imports": bls}]);
        }})}
    } catch (error) {
      logger.error("getUserProfile==>" + error);
      console.log(error.message);
      return res.status(400).json({ "Error": error.message })
    }
  }



    
     }

  

module.exports = new UserController();


//..........  collback في ال  populate كود استخدام اكثر من  .........//

// const opts = [{ path: 'data.[1].packagePrice' ,
// // select:"package_PriceId -_id",
// populate:{path:'package_PriceId',
// // select:"package_Price -_id"
// }}];
// const optsusers = [{ path: 'userId' ,
// // select:"Village Governorate City -_id",
// //  match: { Village: { $sum: 1 } }
// }];

// const promise = packages.populate(result, opts)
// promise.then(data=>{
// const promise1 = users.  populate(data,optsusers);
// promise1.then(datas=>{}