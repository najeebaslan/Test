const { mongoose, ObjectId } = require("../../../utils/utils");
/* <<<// Documentation >>>

1- us_Pr_Id = User Profile Id
2- ne_Id = Network Id
3- ne_Na = Network Name Einglish
4- lo = Location
5- co_Ae = Covarage Area
6- ne_Im = Network Image
7- de = Delete
8- ed = Edit
9- ad =Add Cards
10- vi = View Profile_Network
11- pa = Package 
12- pa_Id =  Package Id
13- da_Ad = Date Add

*/

const Edit_PackageSchema = new mongoose.Schema({
  pa_Id: { type: ObjectId, ref: "Package", required: false },
  ed: { type: Boolean, default: false },
  da_Ad: { type: Date, default: Date.now },

});

const Add_PackageSchema = new mongoose.Schema({
  pa_Id: { type: ObjectId, ref: "Package", required: false },
  ad: { type: Boolean, default: false },
  da_Ad: { type: Date, default: Date.now },

});

const Delete_PackageSchema = new mongoose.Schema({
  pa_Id: { type: ObjectId, ref: "Package", required: false },
  de: { type: Boolean, default: false },
  da_Ad: { type: Date, default: Date.now },

});

const View_PackageSchema = new mongoose.Schema({
  pa_Id: { type: ObjectId, ref: "Package", required: false },
  vi: { type: Boolean, default: false },
  da_Ad: { type: Date, default: Date.now },

});
// يجب ان تنضاف هذه البيانات عند ما يقوم صاحب الشبكة باختيار مهندس للشبكنة

const Roles_Packages = mongoose.Schema(
  /* عند ما يقوم صاحب الشبكة بانشاء مهندس لشبكتة ويمنحة الصلاحية للباقات التي كانت موجوده في ذالك الوقت ولكن عندما يقوم صاحب الشبكة بانشاء باقة جديدة فانه سيتم البحث عبر ايدي الشبكة و ايدي المستخدم ويم اضافة الباقة الجديدة التي تم اضافته الا الباقات    */
  {
    ne_Id: { type: ObjectId, ref: "networks" },
    us_Pr_Id: { type: ObjectId, ref: "UserProfile" },
    pa: [
      {
        ed: [Edit_PackageSchema],
        ad: [Add_PackageSchema],
        de: [Delete_PackageSchema],
        vi: [View_PackageSchema],
      },
    ],
  },

  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Roles_Package", Roles_Packages);
