    const { mongoose, ObjectId } = require('../utils/utils');

    /*  <<<// Documentation names //>>>

    1- network_ini = network_initiate  

    */

    const phonesSchema = mongoose.Schema(
    {
    phone: { type: Array, required: true, },
    isActive: { type: Boolean, default: true, },
    user_initiate: { type: ObjectId, ref: "User" },
    network_ini: { type: ObjectId, ref: "network" },/* this is for save id network in collection phone by this name network_ini   so doing that when create phone when post or create network . else save by name user_initiate */
    }, { timestamps: true, versionKey: false }
    );



    module.exports = mongoose.model("phone", phonesSchema);
