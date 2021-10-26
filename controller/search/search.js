const phones = require("../../models/phones");
const user = require("../../models/users");
const network = require("../../models/network");

class Search {

  async SearchWroldes(req,res){/* هذا يعمل علا البحث علا الكلمات التي اكتبها المستخدم مسبقا ما عدي الكلامات التي حذفها من قائمة الكلامات المقترحة للبحث */
    const f=await user.find({
      'Village': {$not: { $in:['aaa','البعيمي' ]}}, /* هذا ينجاهل كلمات معينة */
      /* وايضا اذا كنت تريد المزيد من الفلترة اعمل التالي  */
       'sex': { $regex: "sex",  }, 

   })
   return res.json(f)
  }
  async phoneByNumber(number) {
    await phones.findOne({ number });
  }

  async networkByName(networkName) {
    await network.find({ name: { $regex: "networkName" } });
  }
}
model.exports = new Search();

