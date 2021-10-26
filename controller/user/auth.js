    const user = require("../../models/users");
    const userPro = require("../../models/userProfile");
    const phoneNumber = require("../../models/phones");
    const locationM = require('../../models/location');
    const { SetStreet } = require('../location/location')//Location Controller
    const { Joi, ObjectId, logger, mongoose } = require('../../utils/utils')
    const { validationRegister } = require("../../models/userProfile");
    const _ = require("lodash");/*input تعمل علا محاربة الهاكر من ناحية ال  */
    const bcrypt = require('bcryptjs');

    require('express-async-errors');
    class UserController {
    async createUser(req, res) {
    const id = new mongoose.Types.ObjectId();
    function rand(len) {
    var x = '';
    for (var i = 0; i < len; i++) { x += Math.floor(Math.random() * 10); }
    return x;
    }
    try {
    console.log(req.body);
    const { error } = validationRegister(req.body);
    if (error) return res.status(404).json({ Error: error.details[0].message })
    var numberAccount = Number(rand(9));
    var dataUser = {
    'numberAccount': numberAccount,
    "_id": id,
    "phone": id,
    "isActive": true,
    "timestamps": true
    };
    const user1 = await new user(_.pick(dataUser, [
    , 'numberAccount', '_id', 'phone', 'isActive', "timestamps"
    ]));
    const phone = req.body.phone;
    const Email = req.body.email;

    const phoneExists = await phoneNumber.findOne({ phone: phone });
    console.log(phoneExists);
    if (phoneExists) {
    res.status(400).json({ "Error": 'رقم الهاتف موجود مسبقاً', });
    return false;
    }
    const EmailExists = await userPro.findOne({ email: Email });
    console.log(EmailExists);
    if (EmailExists) {
    res.status(400).json({ "Error": ' هذا الايميل موجود مسبقاً', });
    logger.error('this email already exist')
    return false;
    }


    if (error) return res.status(404).json({ "Error": error.details[0].message })
    await user1.save(async function (err) {

    if (err) { logger.error("createUser==>" + err); return res.json(err.message) };
    var dataProfile = {
    "_id": id,
    "email": req.body.email,
    "password": req.body.password,
    "username": req.body.username,
    "userId": id,
    "isActive": true,
    "timestamps": true,
    "numberAccount": numberAccount
    };

    let userProf = new userPro(
    _.pick(dataProfile, ['_id', 'email', 'password', 'username', 'userId', 'isActive', "timestamps", "numberAccount"]))
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    userProf.password = await bcrypt.hash(userProf.password, salt);
    await userProf.save(async function (err) {

    if (err) {
    logger.error(err);
    return res.status(404).json({ "Error": err.message });
    }
    
    var phoneNumbers = {
    "phone": req.body.phone, "user_initiate": id,
    "isActive": true,
    "timestamps": true
    };
    const phoneNum = new phoneNumber(_.pick(phoneNumbers, ['phone', 'user_initiate', 'isActive', 'timestamps',]))
    phoneNum.save(async function (err) {
    if (err) { logger.error(err); return res.status(400).json([{ "Error": err.message }]); }
    const token = userProf.generateTokens()
    const pickDate = _.pick(dataProfile, [
    '_id', 'email', 'username', 'numberAccount',]);
    // const userType={"userType":req.body.userType};
    // const margData= Object.assign(pickDate,userType );
    return res.header('Authorization', 'Bearer ' + token).status(200).json(pickDate)
    });
    });
    });

    } catch (error) {
    logger.error("createUser===>" + error);
    return res.status(400).json({ "Error": error.message });
    }
    }





    async PostDetailsUser(req, res) {

    try {
    const userId = req.body.userId;
    const age = req.body.age;
    const sex = req.body.sex;
    const userType = req.body.userType;
    const body = req.body;

    const { error } = validationDetailsUser(body);
    if (error) return res.status(404).json({ Error: error.details[0].message });

    const findUser = await user.findOne({ _id: userId });
    if (!findUser) {
    res.status(400).json({ "Error": 'this user not found', });
    return false;
    }
    const idC = new mongoose.Types.ObjectId();
    const idS = new mongoose.Types.ObjectId();
    let idCity, idStreet;
    const findGovernorate = await locationM.findOne({ _id: ObjectId(body.governorateId) })//Find Governorate By Id
    if (!findGovernorate) {
    res.status(401).json({ "Error": 'not found this governorate' })
    return false;
    } else if (findGovernorate) {

    const city = await locationM.aggregate([//Find City By Id Governorate
    { $match: { "_id": ObjectId(body.governorateId) } },
    {
    $project: {
    list: {
    $filter: {
    input: '$cities', as: 'item',
    cond: {
    $and: [{
    $eq: ['$$item.name', body.cityName.trim()]
    }]
    }
    }
    }
    }
    },
    { $unwind: "$list" },
    { $match: { "list.name": body.cityName.trim() } },
    { $project: { cities: "$list", "_id": 0 } },

    ]).exec()

    if (city[0] == undefined) {// This for check if city is not exist do set city 
    idStreet = idS;
    idCity = idC;
    await locationM.findByIdAndUpdate(body.governorateId,
    { $push: { cities: { _id: idCity, name: body.cityName.trim() }, } })
    .then(data => {
    SetStreet(res, body.streetName, body.cityName, idStreet, body.governorateId)//this for set street
    setDetailsUserInProfile(userId, age,);
    setDetailsUserInUser(userId, sex, userType, body.governorateId, idCity, idStreet,)
    return res.status(200).json({ 'userType': userType })
    });

    } else { //This for check if street is not exist do set street  
    idCity = city[0].cities._id;

    const street = await locationM.aggregate([
    { $unwind: "$cities" },
    { $match: { "cities._id": ObjectId(city[0].cities._id) } },
    {
    $project: {
    list: {
    $filter: {
    input: '$cities.streets', as: 'item',
    cond: {
    $and: [{
    $eq: ['$$item.name', body.streetName.trim()]
    }]
    }
    }
    }
    }
    },
    { $unwind: "$list" },
    { $replaceRoot: { newRoot: '$list', } },
    { $match: { "name": body.streetName.trim() } },
    ]).exec()

console.log(street+'street=====');
    if (street[0] == undefined) {
    SetStreet(res, body.streetName, body.cityName, idS, body.governorateId)
    setDetailsUserInProfile(userId, age,);
    setDetailsUserInUser(userId, sex, userType, body.governorateId, idCity, idS,)
    return res.status(200).json({ 'userType': userType })
    } else {
    setDetailsUserInProfile(userId, age,);
    setDetailsUserInUser(userId, sex, userType, body.governorateId, idCity, street[0]._id,)
    return res.status(200).json({ 'userType': userType })

    }
    }
    }
    } catch (error) {
    logger.error("createUser===>" + error);
    return res.status(400).json({ "Error": error.message });
    }
    }


    async Login(req, res) {
    try {
    const email = req.body.email;
    const passwordUser = req.body.password;
    let userProfile = await userPro.findOne({ email: email }).populate('userId', 'userType numberAccount -_id',).
    select('_id , email , password , username , network , isAdmin',);//isAdmin لان التوكن يتضمن  Token  فسيحدث خطاء في ال isAdmin اذا تم حذف 
    console.log(userProfile);
    if (!userProfile) {
    const { error } = validationLogin(req.body);
    if (error) return res.status(404).json({ "Error": error.details[0].message })
    return res.status(401).json({ "Error": ' هناك خطاء في اسم المستخدم او كلمة المرور ', });
    }
    const chickPassword = await bcrypt.compare(passwordUser, userProfile.password);
    if (!chickPassword) {
    console.log(' هناك خطاء في اسم المستخدم او كلمة المرور');
    return res.status(401).json({ "Error": ' هناك خطاء في اسم المستخدم او كلمة المرور ', });
    }
    const token = userProfile.generateTokens()
    console.log(userProfile.network);
    const dataResult = {
    "network": userProfile.network,
    "_id": userProfile._id,
    "email": userProfile.email,
    "username": userProfile.username,
    "userType": userProfile.userId.userType,
    "numberAccount": userProfile.userId.numberAccount,
    "token": token 
    }
    res.status(200).json(dataResult);
    } catch (error) {
    logger.error("Login===>" + error);
    console.log(error);
    return res.status(401).json({ "Error": error.message });
    }
    }



    async UpdateUser(req, res) {

    try {
    const userId = req.params._id;
    const body = req.body;
    const Email=body.email??null;
    const newPhone = body.newPhone??null;
    const oldPhone = body.oldPhone??null;
    let findOldPhone ,resultPhone;
   const findEmail  = await userPro.findOne({ email: Email, });
    console.log(findOldPhone);
    if(findEmail){ return res.status(404).json({Error:"this email already exist"})}
    if(newPhone!=null&&oldPhone!=null){
    console.log('test');
    findOldPhone  = await phoneNumber.findOne({ phone: oldPhone, });
    console.log(findOldPhone);
    if(!findOldPhone){ return res.status(404).json({Error:"not found oldPhone number"})}
    const phoneExists = await phoneNumber.findOne({ phone: newPhone, });
    if(phoneExists){ return res.status(404).json({Error:"رقم الهاتف موجود مسبقاً"})} 
    if(oldPhone!=null||oldPhone!=undefined &&newPhone!=null||newPhone!=undefined ){
    if(findOldPhone.phone[0]==oldPhone&&findOldPhone.user_initiate==userId){

    resultPhone= await  UpdatePhoneUser(req,userId);//this do update phone number
    console.log(resultPhone);
    if(resultPhone==true){
    return res.status(200).json({"Error":'You must send your previous phone number ' })
    }else if(resultPhone=='not found'){
    return res.status(404).json({"Error":`not found ${newPhone}`})
    }
    }
    }
    }

    var data = {
    email:body.email??null,
    username:body.username??null,
    password:body.password??null,
    age:body.age??null,
    }
    if(data.password!=null||data.password!=undefined){//this for bcrypt password
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    data.password = await bcrypt.hash(data.password, salt);
    }

    function clean(obj) {//check object if value equal null remove that value
    for (var propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined) {
    delete obj[propName]; }}
    return obj
    }
    console.log(clean(data));

    const userUpdate = await userPro.findByIdAndUpdate(
    userId, clean(data), { new: true },
    function (err) {
    if (err) {
    logger.error("UpdateUser===>" + err); return res.status(400).json({ "Error": err.message });
    }
    })
    if (userUpdate == null) return res.status(400).json({ "Error": "not found this user" })
    let result;
    if(resultPhone==null){
    result={
    'age':userUpdate.age,
    "email":userUpdate.email,
    'password':userUpdate.password,
    "username":userUpdate.username,
    };
    }
    result={
    'age':userUpdate.age,
    "email":userUpdate.email,
    'password':userUpdate.password,
    "username":userUpdate.username,
    "phone":resultPhone
    };

    return res.status(200).json(result)

    } catch (error) {
    logger.error("UpdateUser===>" + error);
    console.log(error);
    return res.status(401).json({ "Error": error.message });
    }

    }

    }
    async function UpdatePhoneUser(req,id) {
    console.log(id);
    const oldPhone = req.body.oldPhone;
    const newPhone = req.body.newPhone;
    if(oldPhone==null||oldPhone==undefined){ return true }
    const userUpdate = await phoneNumber.updateOne(
    { user_initiate: id, phone: oldPhone },
    { $set: { "phone.$": newPhone } }
    ); console.log(userUpdate);
    if (userUpdate.n == 1) return newPhone; else return  `not found`;

    }
    async function setDetailsUserInProfile(userId, age,) {
    await userPro.findByIdAndUpdate(userId, { $set: { age: age, }, new: true, });
    };


    async function setDetailsUserInUser(userId, sex, userType, governorateId, cityId, streetId) {
    await user.findByIdAndUpdate(userId, {
    $set: {
    sex: sex,
    userType: userType,
    location: {
    governorateId: governorateId,
    cityId: cityId,
    streetId: streetId,
    }
    },
    }, { new: true, });
    };

    const validationLogin = req => {
    const Schema = {
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(8).max(255).required(),
    };
    return Joi.validate(req, Schema)
    };

    const validationDetailsUser = req => {
    const Schema = {
    age: Joi.number().integer().min(12).max(100).required(),
    userType: Joi.string().valid(['userType2', 'userType3', 'userType1']).min(9).required(),
    sex: Joi.string().valid(['مخصص', 'انثى', 'ذكر']).min(3).required(),
    streetName: Joi.string().min(3).max(15).required(),
    governorateId: Joi.string().min(3).required(),
    cityName: Joi.string().min(3).max(15).required(),
    userId: Joi.string().min(3).required(),



    };
    return Joi.validate(req, Schema)
    };

    module.exports = new UserController();