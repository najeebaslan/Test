
const moment = require('moment')
const operation_number = moment().format("hmmss");
const myRnId = () => parseInt(Math.random() * operation_number);
const userPro = require("../../models/userProfile");
const { Joi, logger, } = require('../../utils/utils')
const { findUser } = require('../../utils/find_utils')
const { customValidation } = require('../../utils/validation');
Joi.objectId = require('joi-objectid')(Joi)


class sendBalance {

  async incomeBalanceSystemToUser(req, res) {

    try {
      const body = req.body;
      const fromUser = req.body.from_user;
      const toUser = req.body.to_user;
      const amounts = req.body.amount;
      const status = req.body.status;
      const newOutcome = { to_user: toUser, amount: amounts, status: status, operation_number: myRnId() };
      const newIncome = { from_user: fromUser, amount: amounts, status: status, operation_number: myRnId() };
      const schema = Joi.object({
        from_user: Joi.objectId().required(),
        to_user: Joi.objectId().required(),
        amount: Joi.number().integer().min(12).max(9999999999999999).required(),
        status: Joi.string().valid(['transfer', 'buyCard', 'commission']).min(9).required(),
      })

      const { error } = customValidation(body, schema);
      if (error) return res.status(404).json({ 'Error': error.details[0].message })
      if (body.from_user == body.to_user) return res.json({ "Error": 'The id of the sender and receiver must not be the same' })
      const result = await userPro.findByIdAndUpdate(toUser, {
        $addToSet: { inCome: newIncome },

      }, { new: true, });
      if (!result) return res.status(400).json({ "Error": 'لايوجد هذا المستخدم' });
      return res.status(200).json('تم الارسال بنجاح')

    } catch (error) {
      logger.error("addNewInCome==>" + error);
      console.log(error.message);
      return res.status(400).json({ "Error": error.message })
    }
  }




  async sendBalance(req, res) {
    const body = req.body;
    const fromUser = req.body.from_user;
    const toUser = req.body.to_user;
    const amounts = req.body.amount;
    const statute = req.body.status;
    const newOutcome = { to_user: toUser, amount: amounts, status: statute, paying_date: Date.now(), operation_number: myRnId() };
    const newIncome = { from_user: fromUser, amount: amounts, status: statute, paying_date: Date.now(), operation_number: myRnId() };
    try {
      const schema = Joi.object({
        from_user: Joi.objectId().required(),
        to_user: Joi.objectId().required(),
        amount: Joi.number().integer().min(12).max(9999999999999999).required(),
        status: Joi.string().valid(['transfer', 'buyCard', 'commission']).min(9).required(),


      })
      const { error } = customValidation(body, schema);
      if (error) return res.status(404).json({ 'Error': error.details[0].message })
      if (req.body.status != "transfer") {
        return res.status(404).json({ "Error": 'يجب تحديد نوع عملية الاراسال' + "{transfer}" })
      }

      const profilePackage = await userPro.findOne({ _id: fromUser })
      if (!profilePackage) return res.status(400).json({ "Error": "not found this user" })
      const findToUser = await findUser({ _id: toUser })
      if (findToUser[0] ==true|| findToUser[0] ==null || findToUser[0] == undefined) return res.status(400).json({ "Error": 'not found this user' })
      userPro.aggregate([
        { $match: { _id: profilePackage._id } },
        {
          $project: {
            inCome: { $sum: "$inCome.amount" },
            outCome: { $sum: "$outCome.amount" }
          }
        },
        { $addFields: { balance: { $add: ["$inCome", "$outCome"] } } }
      ]).exec((error, result) => {
        let profile1 = result[0] || { inCome: 0, outCome: 0 };
        if (error) { res.status(500).json({ Error: error.message }) }
        const bls1 = profile1.inCome;
        const mins1 = profile1.outCome;
        let result1 = bls1 - mins1;
        console.log(bls1);
        console.log(mins1);
        if (mins1 > bls1) {
          res.json({ "Error": ' رصيدك هو ' + result1 + 'ريال غير كافي لاجراء هذه العملية ' });
          return false;
        }
        else if (result1 < amounts || mins1 > bls1) {
          res.json({ "Error": ' رصيدك هو ' + result1 + 'ريال غير كافي لاجراء هذه العملية ' });
          return false;
        }
        else
          SaveDataIncomeAndOutcome(res, fromUser, newOutcome, toUser, newIncome, amounts, profilePackage)
      })
    } catch (error) {
      logger.error("sendBalance==>" + error);
      console.log(error.message);
      return res.status(400).json({ "Error": error.message })
    }
  }

}
async function SaveDataIncomeAndOutcome(res, fromUser, newOutcome, toUser, newIncome, amounts, profilePackage,) {
  try {
    async function saveData(fromUser, newOutcome, toUser, newIncome) {
      const sendBalance = await userPro.findByIdAndUpdate(fromUser,
        { $addToSet: { outCome: newOutcome }, }, { new: true });
      if (!sendBalance) {
        res.status(401).json({ "Error": "لا يوجد هذا المستخدم او ان البيانات غير صالحة" });
        return false;
      }
      await userPro.findByIdAndUpdate(toUser, { $addToSet: { inCome: newIncome }, }, { new: true }).
        then(data => {
          userPro.aggregate([
            { $match: { _id: profilePackage._id, } },
            {
              $project: {
                inCome: { $sum: "$inCome.amount" },
                outCome: { $sum: "$outCome.amount" },
                price: { $sum: "$outCome.packagePrice" },
                outComes: {
                  $filter: {
                    input: '$outCome',
                    as: 'item',/* الحصول علا اجمالي الحوالات الصادره */
                    cond: { $and: [{ $eq: ['$$item.status', 'transfer'], },] },
                  }
                },
                inComes: {
                  $filter: {
                    input: '$inCome',
                    as: 'item',/* الحصول علا اجمالي  الحوالات الواردة */
                    cond: { $and: [{ $eq: ['$$item.status', 'transfer'], },] },
                  }
                },
              },
            },

            {
              $facet: {
                imports: [{ $project: { _id: 0, imports: { $sum: "$inComes.amount" }, }, },],
                exports: [{ $project: { _id: 0, exports: { $sum: "$outComes.amount" }, }, },],
                price: [{
                  $project: {
                    _id: 0, price: "$price",
                    outCome: "$outCome",
                    inCome: "$inCome",
                  },
                },],
              },
            },
            { $unwind: "$price" },
            { $unwind: "$imports" },
            { $unwind: "$exports" },
            { $replaceRoot: { newRoot: { data: ["$price", "$exports", "$imports"], } } },
          ]).exec((error, result) => {
            const resultValidate = result[0] || { inCome: 0, outCome: 0, exports: 0, imports: 0 };
            if (error) { res.status(500).json({ Error: error }) }
            const bls2 = resultValidate.data[0].inCome;
            const mins2 = resultValidate.data[0].outCome;
            const exports = resultValidate.data[1].exports || 0;
            const imports = resultValidate.data[2].imports || 0;
            const resultData = bls2 - mins2 || 0;
            if (resultData < amounts || mins2 > bls2) {
              res.json({ 'Error': ' رصيدك هو ' + resultData + 'ريال غير كافي لاجراء هذه العملية ' });
              return false;
            } else

              res.status(200).json({
                "Balance": resultData, "TheSales": mins2,
                "Purchases ": bls2, "Exports": exports, "Imports": imports
              })
          })
        }).catch(error => {
          logger.error("SaveDataIncomeAndOutcome==>" + error);
          console.log(error.message);
          return res.status(400).json({ "Error": error.message })
        })
    }
    saveData(fromUser, newOutcome, toUser, newIncome)
  }
  catch (error) {
    logger.error("SaveDataIncomeAndOutcome==>" + error);
    console.log(error.message);
    return res.status(400).json({ "Error": error.message })
  }
}
module.exports = new sendBalance();
module.exports.SaveDataIncomeAndOutcome = SaveDataIncomeAndOutcome;