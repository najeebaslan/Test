
const {Joi,mongoose,ObjectId}=require('../utils/utils');

const allCoverage_Area = mongoose.Schema(
  {
    allCoverage_Area: { type: String, required: true, lowercase: true,  },
    networkId: { type: ObjectId, ref: "network", required: true, },
  },{versionKey: false}

);

module.exports = mongoose.model("allCoverage_Area", allCoverage_Area);
