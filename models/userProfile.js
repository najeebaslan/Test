

const {privateKey,Joi,mongoose,jwt,ObjectId}=require('../utils/utils');

//const ObjectId = mongoose.Schema.Types.ObjectId;
const incomeSchema = new mongoose.Schema({
  notice: { type: String, required: false },
  amount: { type: Number, min: 0, required: true,trim: true, },
  status: { type: String, required: true ,trim: true, enum: ['transfer', 'buyCard', 'commission']},
  from_user: { type: ObjectId, ref: "User", required: false,trim: true, },
  packagePrice: { type: Number,required: false, trim: true,},
  operation_number:{type:Number,trim: true,},
  packageId: { type: ObjectId, ref: "Package", required: false },
  areaUserPay:{type:String,required:false},/* ينفع بفلتره صاحب الشبكة علا حسب المنطقة */

  paying_date: Date,
})

const outcomeSchema = new mongoose.Schema({
  notice: { type: String, required: false ,},
  amount: { type: Number,required: true,trim: true, },
  status: { type: String, required: false, enum: ['transfer', 'buyCard', 'commission'] },
  to_user: { type: ObjectId, ref: "User", required: false },
  packageId: { type: ObjectId, ref: "Package", required: false },
  number_card:{type: String, required: true,trim: true,},
  password:{type: String, required: true,trim: true,},
  serialNumber:{type: String, required: true,trim: true,},
  packagePrice: { type: Number,required: false,trim: true, },
  card: { type: ObjectId, ref: "cards", required: false,trim: true, },
  device_id: { type: ObjectId, ref: "devices", required: false ,trim: true,},
  paying_date: Date,
  device_status: { type: ObjectId, ref: "devices_status", required: false,trim: true, },
  operation_number:{type:Number},
 

})

const UserProFileSchema =  mongoose.Schema(
  {
    username: {type:String, lowercase: true , },
    email: {
      type:String,
      trim: true,
      unique:true,
      index:true,
      sparse:true,
      
    },
    password: {
      type: String,
      required: true,
      trim: true,


    },

    isActive: {
      type: Boolean,
      default: true,
    },
    age: {
      type: Number,
      required: false,
    },

    userId: {
      type: ObjectId,
      ref: "User"
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  

    network: { type: ObjectId, ref: "networks",},

    inCome: [incomeSchema],
    outCome: [outcomeSchema]
  },
  {timestamps: true, versionKey: false }//this versionKey: false for not save ( __v  ) in database
);

UserProFileSchema.methods.generateTokens= function () {
  const token=jwt.sign({_id:this._id,isAdmin:this.isAdmin},privateKey);
  return token;

}
const validationRegister=data=>{
const Schema={
username:Joi.string().min(3).max(35).required(),
email:Joi.string().min(6).max(255).required().email(),
password:Joi.string().min(8).max(1024).required(),// وضعته 1024 لسبب التشفير
phone: Joi.number().integer().min(100000000).max(999999999).required(),

};

return Joi.validate(data,Schema)

};

module.exports = mongoose.model('UserProfile', UserProFileSchema);
module.exports.validationRegister=validationRegister;
