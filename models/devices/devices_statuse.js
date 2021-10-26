const { mongoose, ObjectId, } = require("../../utils/utils");

/* <<<// Documentation >>>

  1- De_StSchema = Devices Statuse Schema
  2- de_In_Id = Devices Info Id
  3- ip_Ad = Ip Address
  4- in = Interface
  5- ap_Na = Apps Name
  6- st = Status
  7- ca = Capacity
  8- da_Ad =Date Add 
  9- ge = Getway
  10- ve = Version
  11- te = Temperature 
  12- sy_st = System Storage
  13= ex_st = External Storage
 14- us_Pr_Id = User Profile Id

  */



/* this is apps running and details them */
const AppsSchema = new mongoose.Schema({
  ap_Na: { type: String, trim: true, required: true },
  ve: { type: String, trim: true, required: true },
  api: { type: String, trim: true, required: true },
  da_Ad: { type: Date, default: Date.now },
});

const NetworkSchema = new mongoose.Schema({
  ip_Ad: { type: String, trim: true, required: true },
  ge: { type: String, trim: true, required: true },
  in: { type: String, trim: true, required: true, lowercase: true },
  dbm: { type: String, trim: true, required: true },
  da_Ad: { type: Date, default: Date.now },
});

const BattrySchema = new mongoose.Schema({
  level: { type: String, trim: true, required: true },
  st: { type: String, trim: true, required: true },
  te: { type: String, trim: true, required: true },
  ca: { type: String, trim: true, required: true },
  da_Ad: { type: Date, default: Date.now },
});

const MemorySchema = new mongoose.Schema({
  ram: { type: String, trim: true, required: true },
  sy_St: { type: String, trim: true, required: true },
  ex_st: { type: String, trim: true, required: true },
  da_Ad: { type: Date, default: Date.now },
});

const De_StSchema = mongoose.Schema(
  {
    De_St: [{
        battry: [BattrySchema],
        network: [NetworkSchema],
        apps: [AppsSchema],
        memory: [MemorySchema],
        us_Pr_Id: { type: ObjectId, ref: "UserProfile" } /* تضاف هذا لمرة واحدة فقط */,
        de_In_Id: {type: ObjectId, ref: "devices_info",} /* تضاف هذا المرة واحدة فقط */,
      },],
  },

  { timestamps: true, versionKey: false }

);

module.exports = mongoose.model("devices_status", De_StSchema);
