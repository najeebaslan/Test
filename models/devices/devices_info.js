const { mongoose, ObjectId } = require("../../utils/utils");

/* <<<// Documentation >>>

  1- De_StSchema = Devices Statuse Schema
  2- dev_St_Id = Devices Status Id
  3- De_In = Devices Info
  4- de_Na = Devices Name
  5-  ma = Manufacturer  الشركة المصنعة
  6- de_Id= Device Id 
  7- mac =Mac Address
  8- api_le= Api Level رقم النسخة ال 
  9- re_Ba = released base  النطاق الاساسي
  10- us_Pr_Id = User Profile Id
  11- da_Ad =Date Add
  */

const De_StSchema = mongoose.Schema(
  {
    de_Na: { type: String, trim: true, default: "Embity" },
    model: { type: String, trim: true, default: "Embity" },
    ma: { type: String, trim: true, default: "Embity" },
    de_Id: { type: String, trim: true, default: "Embity" },
    mac: { type: String, trim: true, default: "Embity" },
    re_Ba: { type: String, trim: true, default: "Embity" },
    us_Pr_Id: { type: ObjectId, ref: "UserProfile" } /* تضاف هذا لمرة واحدة فقط */,
    dev_St_Id: { type: ObjectId, ref: "devices_status",} /* تضاف هذا المرة واحدة فقط */,
    da_Ad: { type: Date, default: Date.now },
   
  },

  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("devices_info", De_StSchema);
