
const {mongoose,ObjectId,Joi}=require('../utils/utils');

const CsvSchema = mongoose.Schema(
    {
    _id: { type: ObjectId },
    
    username: {type:String,trim: true,required:true},

    password: {type:String,trim: true,required:false},

    serialNu: {type:String,trim: true,required:true},

    isActive: { type: Boolean, default: true,},
    Is_new: {type: Boolean,default: true,},
    packagePrice: { type: Number, trim: true,required:true },
    networkId: { type: ObjectId, ref: "network" },
    packageId: { type: ObjectId, ref: "Package" },
    userPay: { type: ObjectId, ref: "user", },
    areaUserPay: { type: String,required: false,},

    paying_date:Date,

    }, { timestamps: true, versionKey: false}
);

const validationArrayCsv=data=>{
  
 let service = Joi.object().keys({
        username:Joi.string().min(3).max(44).required(),
        password:Joi.string().min(3).max(44).required(),
        serialNu:Joi.string().min(3).max(44).required(),
       
    })   

    let Schema = Joi.array().items(service)
    return Joi.validate(data,Schema) 
};
 

    

module.exports = mongoose.model("card", CsvSchema);
module.exports.validationArrayCsv=validationArrayCsv;






