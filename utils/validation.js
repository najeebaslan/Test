const { Joi } = require('./utils')

const customValidation = (data, Schema) => { return Joi.validate(data, Schema) };

module.exports.customValidation= customValidation
