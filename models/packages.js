
const {mongoose,ObjectId,Joi}=require('../utils/utils');

const packagesSchema = mongoose.Schema(
    {
    package_Price: {type: Number,},
    Package_data: {type: Number, },
    details_data: { type: String, },
    Package_time: {type: Number, },
    details_time: { type: String, },
    package_validity: {type: Number,  },
    details_validity: {type: String, },
    havePassword: {type: Boolean},
    equalUAP:{type: Boolean, },/* this equalUAP =EqualUsernameAndPassword */
    isActive: { type: Boolean, default: true,},
    services_Commission: {type: Number, },/* This is commission=  العمولة الخاصة بمالك النظام */
    commission_User_Type1: { type: Number,  },/* commission_User_Type1=عميل */
    commission_User_Type2: {type: Number, },/* commission_User_Type2=مورد */
    networkId: { type: ObjectId, ref: "network",},
    user_initiate: { type: ObjectId, ref: "User",},
    //package_PriceId: { type: ObjectId, ref: "package_Price" ,},

    },

 {timestamps: true, versionKey: false}
);
const validationPackage=data=>{
    const Schema={
    data:Joi.string().min(2).max(10).required(),
    details_data:Joi.string().min(2).max(15).required(),
    time:Joi.string().required(),
    details_time: Joi.string().min(2).max(15).required(),
    validity: Joi.string().required(),
    details_validity:Joi.string().min(2).max(15).required(),
    networkId:Joi.string().min(10).required(),
    package_Price:Joi.number().integer().min(11).max(999999999).required(),
    user_initiate:Joi.string().required(),
    havePassword:Joi.boolean().required(),
    equalUAP:Joi.boolean(),
 }; return Joi.validate(data,Schema)};

module.exports = mongoose.model('Package', packagesSchema);
module.exports.validationPackage=validationPackage;