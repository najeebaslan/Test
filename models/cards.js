
const { Joi, mongoose, ObjectId } = require('../utils/utils');

const CardsSchema = mongoose.Schema(
  {
    _id: { type: Object },
    username: {
      type: String, type: String, trim: true,
      required: true
    },

    password: {
      type: String, type: String, trim: true,
      required: false
    },

    serialNu: {
      type: String, trim: true, required: true
    },

    isActive: { type: Boolean, default: true, },

    Is_new: { type: Boolean, default: true, },

    networkId: { type: ObjectId, ref: "network" },

    packageId: { type: ObjectId, ref: "Package" },

    packagePrice: {
      type: Number, trim: true,
      required: true
    },

  },
  {
    timestamps: true, versionKey: false
  }
);

const validationPrintCards = data => {
  const Schema = {
    packageId: Joi.string().min(3).max(44).required(),
    networkId: Joi.string().min(3).max(44).required(),
    packagePrice: Joi.number().min(12).max(1234567).required(),
    countCards: Joi.number().min(1).required(),

  }; return Joi.validate(data, Schema)
};

module.exports = mongoose.model("cards", CardsSchema);
module.exports.validationPrintCards = validationPrintCards;



