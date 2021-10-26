
const {Joi,mongoose,ObjectId}=require('../utils/utils');

const offersSchema = mongoose.Schema(
    {
    packagePrice: { type: Number, required: true,},
    details_offers: {type: String,  required: true,},
    networkId: { type: ObjectId, ref: "network" ,required: true,},
    // data: { type: String, required: true,},
    // details_data: { type: String,  required: true,},
    // time: {type: String,required: true,},
    // details_time: { type: String,required: true,},
    // validity: {type: String, required: true,},
    // details_validity: {type: String, required: true,},
    // limitUptime: { type: String, required: true,},
    // details_limitUptime: {type: String,required: true,},

    },{ timestamps:true, versionKey: false});


// { timestamps: { currentTime: () => Math.floor(Date.now() / 1000) } },

module.exports = mongoose.model('offers', offersSchema);
