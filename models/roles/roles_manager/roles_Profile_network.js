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
11-
12-
13-

*/

const Roles_Profile_Network = mongoose.Schema(
  {
    ne_Id: { type: ObjectId, ref: "networks" },
    us_Pr_Id: { type: ObjectId, ref: "UserProfile" },
    ne_Na: { type: Boolean, default: false },
    lo: { type: Boolean, default: false },
    co_Ae: {
      ed: { type: Boolean, default: true },
      ad: { type: Boolean, default: true },
      de: { type: Boolean, default: true },
      vi: { type: Boolean, default: true },
    },
    ne_Im: { type: Boolean, default: true },
  },

  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("roles_Pro_network", Roles_Profile_Network);
