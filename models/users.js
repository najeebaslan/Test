const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const count=4000;
const UserSchema = mongoose.Schema(
  {
    phone: {
      type: ObjectId,
      ref: "phone",
    },
    userType: {
      type: String,
      enum: ['userType1', 'userType2', 'userType3',],
      /* Notice .......>  عميل=userType1---- مالك الشبكة=userType2 ---- مهندس الشبكة=userType3*/
      required: false, trim: true, 
      //default: 'Empty',
    },
     image: {
       type: String,
      required: false,
     },
    sex: {
      type: String,
      required: false,
      enum: ['ذكر', 'انثى', 'مخصص'], 
      //default: 'مخصص',
    },
    numberAccount: {
      type: Number,
      required: false,
    },
   
    location:{
      governorateId: {  type: ObjectId,
    ref: "location", },
    cityId: {  type: ObjectId,
    ref: "location",  },
    streetId: {  type: ObjectId,
    ref: "location", },
    }
    },

  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("User", UserSchema);
