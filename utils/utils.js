const mongoose = require('mongoose')
const logger = require("../config/logger");
const ObjectId = mongoose.Types.ObjectId;
const jwt = require('jsonwebtoken');
const Joi = require('@hapi/joi');
const privateKey = 'privateKey';

module.exports = { mongoose, logger, ObjectId, Joi, privateKey, jwt, }