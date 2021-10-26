const { mongoose, ObjectId } = require("../../../utils/utils");
/* <<<// Documentation >>>
1- us_Pr_Id = User Profile Id
2- ne_Id = Network Id
3- pr_Ca = Print Cards
4- up_Cs = Upload Csv Cards
5- se_Ca = Search  In Cards
6- ed_Ca = Edit Cards
7- de_Ca = Delete cards
8- di_Ca = Disable Cards
9- da_Ad = Date Add
*/

const Roles_Cards = mongoose.Schema(
  {
    ne_Id: { type: ObjectId, ref: "networks" },
    us_Pr_Id: { type: ObjectId, ref: "UserProfile" },
    pr_Ca: { type: Boolean, default: false },
    up_Cs: { type: Boolean, default: false },
    se_Ca: { type: Boolean, default: true },
    ed_Ca: { type: Boolean, default: false },
    di_Ca: { type: Boolean, default: false },
    de_Ca: { type: Boolean, default: false },
    da_Ad: { type: Date, default: Date.now },

  },

  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("roles_card", Roles_Cards);
