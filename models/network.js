
    const {Joi,mongoose,ObjectId}=require('../utils/utils');

    const NetworkSchema = mongoose.Schema(
    {nameA: { type: String, required:true, lowercase: true , },
    nameE: { type: String, required:true, lowercase: true ,  },
    allCoverage_Area:[{ type: ObjectId, ref: "allCoverage_Area" ,required:true, }],
    phones: { type: ObjectId, ref: "phone",},
    user_initiate: { type: ObjectId, ref: "User" , required:true,},
    address: { type: String, required: true, lowercase: true, },
    //coverage_area: [{ type: ObjectId, ref: "coverage",}],
    packages: [{ type: ObjectId, ref: "Package" ,},],
    img: { type:String,required:true,},
    isActive: { type: Boolean, default: true,},
    location:{
    governorateId: {  type: ObjectId,ref: "location", },
    cityId: {  type: ObjectId,ref: "location",  },
    streetId: {  type: ObjectId,ref: "location", },
    }
    },
    { timestamps: true, versionKey: false},
    );
 
    const validationNetwork=data=>{
    const Schema={
    nameA:Joi.string().min(3).max(44).required(),
    nameE:Joi.string().min(3).max(44).required(),
    user_initiate:Joi.string().min(3).required(),
    governorateId:Joi.string().min(3).max(44).required(),
    cityName:Joi.string().min(3).max(15).required(),
    streetName:Joi.string().min(3).max(15).required(),
    address:Joi.string().min(3).max(15).required(),
    maintenancePhone:Joi.array().required(),

    }
    return Joi.validate(data,Schema)
    };

    module.exports = mongoose.model("network", NetworkSchema);
    module.exports.validationNetwork=validationNetwork;

