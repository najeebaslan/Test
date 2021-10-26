const { mongoose, ObjectId } = require("../utils/utils");
/*  <<<// Documentation >>>
1- us_Pr_Id = User Profile Id
2- da_Ad = Date Add
3- de_St = Device Status
4-


*/
const LogsSchema = mongoose.Schema(
  {
    us_Pr_Id: { type: ObjectId, ref: "UserProfile" },
    da_Ad: { type: Date, default: Date.now },
    de_St: { type: ObjectId, ref: "devices_status", required: false },

  },

  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("log", LogsSchema);
