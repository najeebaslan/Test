      const { customValidation } = require('../../utils/validation');
      const { findN, fC, findBy, resDa } = require('../../controller/card/csv');
      const { logger, mongoose, Joi } = require('../../utils/utils');
      const { findUser } = require('../../utils/find_utils')
      const userPro = require("../../models/userProfile");
      const packages = require("../../models/packages");
      const modelCsv = require("../../models/csv");
      const card = require("../../models/cards");
      Joi.objectId = require('joi-objectid')(Joi)
      const _ = require("lodash");/*input تعمل علا محاربة الهاكر من ناحية ال  */
      require('express-async-errors');


      /*  <<<// Documentation names //>>>

      1- existC = existCards  
      2- existD = exist Data Cards
      3- resultR = resultResponse
      4- resDa = response Data
      5- resultU = resultUsername
      6- resultP = resultPassword
      7- resultS = resultSerialNumber
      8- resP = response Password
      9- resU = response Username
      10- resS = response SerialNumber
      11- mRS = myResultSearch
      12- findN= find Network
      13- fC = find Cards
      14- getN = getNetwork

      */

      class cards_controller {
      async buyCard(req, res, next) {
  
      try {
      const body = req.body;
      const packageId = req.body.packageId;
      const networkId = req.body.networkId;
      const areaUserPay = req.body.areaUserPay;
      const userPay = req.body.userPay;
      const notice = req.body.notice;
      const statusData = req.body.status;

      let findTypeUser;
      const Schema = Joi.object({/* this is validation request */
      packageId: Joi.objectId().required(),
      userPay: Joi.objectId().required(),
      networkId: Joi.objectId().required(),
      status: Joi.string().valid(['buyCard',]).min(3).max(44).required(),
      notice: Joi.string().min(3).max(100).required(),
      areaUserPay: Joi.string().min(3).max(44).required(),
      })

      const { error } = customValidation(req.body, Schema);
      if (error) return res.status(404).json({ Error: error.details[0].message })
      var getN = await findN(res, body)
       console.log(getN[0]);
      if (getN[0] == true) return res.status(404).json({ "Error": "not found this network" })
      const fP = getN[1].packages.filter(element => element._id==body.packageId);
      if(fP[0]==null||fP[0]==undefined)
      return res.status(404).json({"Error":"not found this package"});
      const profilePackage = await findUser(userPay);
      if (profilePackage[0] ==true||profilePackage[0]== null || profilePackage[0] == undefined) {
      return res.status(400).json({ "Error": 'this user is not found' });
      }
      const typeUser = profilePackage[1].userType;
      const findType = await packages.findOne({ _id: packageId, },)
      if (!findType) { res.status(400).json({ Error: 'not found cards' }); return false; }

      if (typeUser == 'userType1') { findTypeUser = findType.commission_User_Type1; }
      if (typeUser == 'userType2') { findTypeUser = findType.commission_User_Type2; }
      const packageUser_initiate = findType.user_initiate;
      var resultOutCome = fP[0].package_Price - findTypeUser;
      const findCard = await modelCsv.findOneAndUpdate(
      { Is_new: true, packagePrice: fP[0].package_Price, networkId: networkId, packageId: packageId },
      { Is_new: false, userPay: userPay, areaUserPay: areaUserPay, paying_date: Date.now() })
      if (!findCard) { return res.status(400).json({ Error: "لاتوجد كروت حاليا لفئة " + fP[0].package_Price }); }

      userPro.aggregate([{ $match: { _id: profilePackage[1]._id } },
      {
      $project: {
      inCome: { $sum: "$inCome.amount" },
      outCome: { $sum: "$outCome.amount"},
      }
      }, { $addFields: { balance: { $add: ["$inCome", "$outCome"] } } }

      ]).exec((error, result) => {
      console.log(packageId)
      console.log(packageUser_initiate)

      let profile = result[0] || { inCome: 0, outCome: 0 };
      const bls = profile.inCome;
      const mins = profile.outCome;
      const results = bls - mins;
      // const result =   mins-bls;
      console.log(mins);
      console.log(bls);

      if (results <= resultOutCome || mins > bls) {
      res.json({ Error: ' رصيدك هو ' + results + 'ريال غير كافي لاجراء هذه العملية ' }); return false;
      }
      else {
      if (error) {
      res.status(500).json({ Error: error.message })
      return false;
      } else {
      console.log(packageUser_initiate);
      const userName = findCard.username;
      const serialNumber = findCard.serialNu;
      const password = findCard.password;

     
      //........شراء كرت
      if (statusData == 'buyCard') {
      addNewOutCome(notice, resultOutCome, userPay, packageUser_initiate, statusData, userName, serialNumber, password, fP[0].package_Price, packageId);//....خصم الرصيد من حساب المرسل
      addNewInCome(notice,resultOutCome, userPay, packageUser_initiate, statusData, fP[0].package_Price, packageId, areaUserPay)
      } 
      const resultBuying = {"Balance":results, "username": findCard.username, "password": findCard.password??findCard.username, "serialNumber": findCard.serialNu }
      res.status(200).json(resultBuying)

      }
      }
      })

      } catch (error) {
      logger.error("getFirstCardAndUpdate==>" + error);
      return res.status(404).json({ Error: error.message });
      }

      function rand(len) {
      var x = '';
      for (var i = 0; i < len; i++) { x += Math.floor(Math.random() * 10); }
      return x;
      }
      function rand2(len) {
      var x = '';
      for (var i = 0; i < len; i++) { x += Math.floor(Math.random() * 10); }
      return x;
      }


      const operation_numbers = Number(rand(6))
      const operation_numbers2 = Number(rand2(6))

      async function addNewOutCome(notice, amount, OutcomeId, toUser, status, number_card, serialNumber, password, packagePrice, packageId,) {
      const newOutcome = {
      notice: notice, amount: amount,
      to_user: toUser,
      status: status,
      paying_date: Date.now(),
      number_card: number_card,
      serialNumber: serialNumber,
      password: password,
      packagePrice: packagePrice,
      packageId: packageId,
      operation_number: operation_numbers2,
      };
      await userPro.findByIdAndUpdate(OutcomeId, {
      $addToSet: { outCome: newOutcome },
      new: true,
      });
      }

      async function addNewInCome(notice,amount, fromUser, packageUser_initiate, status, packagePrice, packageId, areaUserPay) {
      const newIncome = {
      notice: notice,
      amount: amount,
      from_user: fromUser,
      status: status,
      paying_date: Date.now(),
      packagePrice: packagePrice,
      packageId: packageId,
      areaUserPay: areaUserPay,
      operation_number: operation_numbers,
      };
      await userPro.findByIdAndUpdate(packageUser_initiate, {
      $addToSet: { inCome: newIncome },
      new: true,
      });

      // async function BalancsAndTotals(profilePackage,resultOutCome) {
      //   userPro.aggregate([{ $match: { _id: profilePackage._id } },
      //     {
      //       $project: {
      //         inCome: { $sum: "$inCome.amount" },
      //         outCome: { $sum: "$outCome.amount" }
      //       }
      //     }, { $addFields: { balance: { $add: ["$inCome", "$outCome"] }, } }

      //     ]).exec((error, result) => {

      //       let profile = result[0] || { inCome: 0, outCome: 0 };
      //       const bls = profile.inCome;
      //       const mins = profile.outCome;
      //       const resulte = bls - mins;
      //       // const resulte =   mins-bls;
      //       console.log(mins);
      //       console.log(bls);

      //       if (resulte <= resultOutCome || mins > bls) {
      //         res.json(
      //           ' رصيدك هو ' + resulte + 'ريال غير كافي لاجراء هذه العملية '); return false;
      //       }
      //       else {
      //         if (error) {
      //           res.status(500).json({ errors: [error] })
      //           return false;
      //         } else {

      //           res.status(200).json(resultBuying)

      //         }
      //       }
      //     })

      // }
      }

      }


      async addCards(req, res) {
      const id = new mongoose.Types.ObjectId();
      try {
      const body = req.body;
      let typeSaveData;

      const Schema = Joi.object({
      username: Joi.string().min(5).max(44).required(),
      password: Joi.string().min(5).max(44).required(),
      serialNu: Joi.string().min(3).max(44).required(),
      packageId: Joi.objectId().required(),
      networkId: Joi.objectId().required(),
      })
      const { error } = customValidation(req.body, Schema);
      if (error) return res.status(404).json({ Error: error.details[0].message })

      var getN = await findN(res, body)
      if (getN[0] == true) return res.status(404).json({ "Error": "not found this network" })
      //search in packages for  same Package id who received you from FrontEnd
      const greaterThanTen = getN[1].packages.filter(element => element._id == body.packageId);
      if (greaterThanTen[0] == null || greaterThanTen[0] == undefined)
      return res.status(404).json({ "Error": "not found this package" })
      var exist = await existD(res,greaterThanTen, body.networkId, body.username, body.password, body.serialNu)
      if (exist) return exist

      var packagePrice = greaterThanTen[0].package_Price;
      console.log(packagePrice);
      var myRS = validationFindCard(body, greaterThanTen, typeSaveData)
      if (!myRS) return myRS;
      var dataCard = {
      "username": myRS.username,
      "password": myRS.password,
      "serialNu": myRS.serialNu,
      "packageId": body.packageId,
      "networkId": body.networkId,
      "packagePrice": packagePrice,
      "Is_new": true,
      "isActive": true,
      "timestamps": true,
      "_id": id,
      };
      let creatCard = new card(
      _.pick(dataCard, [
      '_id', 'username', 'password', 'serialNu',
      'packageId', 'networkId', 'Is_new',
      'packagePrice', "isActive", "timestamps"
      ]))
      creatCard.save(function (err) {
      if (err) { logger.error("addCards==>" + err); return res.status(404).json(err.message); }
      let result = _.pick(dataCard, ['username', 'password', 'serialNu',]);
      result = {
      username: result.username,
      password: result.password ?? result.username,/* i am do if value password equal null give it value username because maybe password and username equal or password equal false */
      serialNu: result.serialNu,
      }
      return res.status(200).json(result)
      })

      } catch (error) {
      console.log(error);
      logger.error("addCards==>" + error);
      return res.status(400).json({ "Error": error.message });
      }
      }

      async getAllCards(req, res) {
      try {
      const networkId = req.query.networkId;
      await card.find({ networkId: networkId }, function (error, result) {
      if (error) return res.status(400).json({ "Error": error.message })
      if (result[0] == null) {
      return res.status(400).json({ "Error": error.message })
      }
      return res.status(200).json(result)
      });
      } catch (error) {
      console.log(error);
      logger.error("getAllCards==>" + error);
      return res.status(401).json({ Error: error.message });
      }
      }
      }
      async function existD(res,greaterThanTen, networkId, username, password, serialNu) {
      const resultU = await fC({ networkId: networkId, username: username })
      const resultP = await fC({ networkId: networkId, password: password })
      const resultS = await fC({ networkId: networkId, serialNu: serialNu })


      if (resultU[0]) {

      var resU = findBy(resultU,)/* this is response details */
      return resDa(res, resU, 'this is cards already exist . (The username already exist)')/* this is custom response */
      } if(greaterThanTen[0].equalUAP != true && greaterThanTen[0].equalUAP != null||greaterThanTen[0].havePassword==false){
      if (resultP[0]) {
      var resP = findBy(resultP)
      return resDa(res, resP, 'this is cards already exist . (The password already exist)')
      }}
      if (resultS[0]) {
      var resS = findBy(resultS,)
      return resDa(res, resS, 'this is cards already exist . (The serialNumber already exist)')
      }
      }
      function validationFindCard(body, greaterThanTen, typeSaveData) {
      if (greaterThanTen[0].havePassword == true) {

      if (greaterThanTen[0].equalUAP == false && greaterThanTen[0].equalUAP != null) {/* check if package cards not Equal Username And Password*/

      typeSaveData = {
      networkId: body.networkId,
      username: body.username,
      password: body.password,
      serialNu: body.serialNu,

      }
      } else if (greaterThanTen[0].equalUAP == true && greaterThanTen[0].equalUAP != null) {
      typeSaveData = {
      networkId: body.networkId,
      username: body.username,
      /* <//<<password: item.password>>//> i am  disable Search this password because do error because not found password in database because equalUAP =true */
      serialNu: body.serialNu,
      }
      }
      } else {
      typeSaveData = {
      networkId: body.networkId,
      username: body.username,
      /* <//<<password: { $in: findByUsername },>>//> i am  disable Search this password =false */
      serialNu: body.serialNu,
      }
      }
      return typeSaveData
      }
      module.exports = new cards_controller();

