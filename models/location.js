
const {mongoose}=require('../utils/utils');
    
    const streetSchema = mongoose.Schema(
    {name: { type: String, required: true, },});

    const citySchema = mongoose.Schema(
    {name: { type: String, required: true, },streets: [streetSchema],});

    const governorateSchema = mongoose.Schema(
    {name: { type: String, required: true, }, cities: [citySchema], },
    { timestamps: true, versionKey: false });
    
    
    
  
  
    module.exports = mongoose.model('location', governorateSchema);
