        const csvtojson = require("csvtojson");
        const modelCsv = require("../../models/csv");
        const { Joi, logger } = require('../../utils/utils');
        const { findNetwork } = require('../../utils/find_utils');
        const { customValidation } = require('../../utils/validation');
        const { deleteImageFromFileUploads } = require('../../utils/delete_pathFiles')
        const { validationArrayCsv,} = require("../../models/csv");
        require('express-async-errors');
        Joi.objectId = require('joi-objectid')(Joi)

        global.__basedir = __dirname;/* this for know direct file upload */


        /*  <<<// Documentation names //>>>
        1- existC = existCards  
        2- existD = exist Data Cards
        3- resultR = resultResponse
        4- resDa = response Data
        5- resultU = resultUsername
        6- resultP = resultPassword
        7- resultS = resultSerialNumber
        8- resP = response Password
        9- resU = response Username
        10- resS = response SerialNumber
        11- mRS = myResultSearch
        12- findN= find Network
        13- fC = find Cards

        */

        class CSV {

        async CreatCsv(req, res,) {

        try {

        const body = req.body;
        const schema = Joi.object({ networkId: Joi.objectId(), packageId: Joi.objectId(), })

        var bodyData = {
        networkId: body.networkId,
        packageId: body.packageId,
        }

        const e = customValidation(bodyData, schema);
        if (e.error) {
        await deleteImageFromFileUploads(req);
        return res.status(404).json({ 'Error': e.error.details[0].message })}

        if (req.file == undefined) { 
        await deleteImageFromFileUploads(req);
        return res.status(404).json({ Error: 'Csv يجب رفع ملف ' }) }

        const csvData = await csvtojson({ delimiter: "auto",trim:true,checkColumn:true}).fromFile(__basedir + '/public/uploads/' + req.file.filename)
                
        var validate = await findN(res, body,)
        if (!validate) return validate;
        if (validate[0] == true) {
        await deleteImageFromFileUploads(req)
        return res.status(404).json({ "Error": "not found this network" })}
        //search in packages for  same Package id who received you from FrontEnd
        const greaterThanTen = validate[1].packages.filter(element => element._id == body.packageId);
        if (greaterThanTen[0] == null || greaterThanTen[0] == undefined){
        await deleteImageFromFileUploads(req)
        return res.json({Error:'not found this package'})

        }
        if (csvData[0] == undefined) {
        await deleteImageFromFileUploads(req)
        return res.status(404).json({ Error: ' لذا تاكد من نوع الملف الذي رفعته اولاً Csv لا توجد كروت من نوع ' })
        }
        var packagePrice = greaterThanTen[0].package_Price;
        var findByUsername = csvData.map(function (id) { return id.username; });
        var findByPassword = csvData.map(function (id) { return id.password; });
        var findBySerialNor = csvData.map(function (id) { return id.serialNu; });
        let resultSearch;


        function cardData(item) {
        if (greaterThanTen[0].havePassword == true) {

        if (greaterThanTen[0].equalUAP == false && greaterThanTen[0].equalUAP != null) {/* check if package cards not Equal Username And Password*/

        resultSearch = {
        networkId: body.networkId,
        username: { $in: findByUsername },
        password: { $in: findByPassword },
        serialNu: { $in: findBySerialNor },
        }

        return new modelCsv({
        username: item.username,
        password: item.password,
        serialNu: item.serialNu,
        isActive: true,
        Is_new: true,
        packagePrice: packagePrice,
        networkId: body.networkId,
        packageId: body.packageId,

        });
        } else if (greaterThanTen[0].equalUAP == true && greaterThanTen[0].equalUAP != null) {
        return new modelCsv({
        username: item.username,
        /* <//<<password: item.password>>//> i am disable password because username same password so i dont need save password in my database  */
        serialNu: item.serialNu,
        isActive: true,
        Is_new: true,
        packagePrice: packagePrice,
        networkId: body.networkId,
        packageId: body.packageId,

        });
        }
        } else {

        return new modelCsv({
        username: item.username,
        //password: item.password,  /* i am deleted password because havePassword equal false */
        serialNu: item.serialNu,
        isActive: true,
        Is_new: true,
        packagePrice: packagePrice,
        networkId: body.networkId,
        packageId: body.packageId,

        });
        }
        }

        const { error } = validationArrayCsv(csvData);
        if (error) {
        await deleteImageFromFileUploads(req)
        return res.status(404).json({ Error: error.details[0].message })}
        var myRS = validationFindCard(
        body, greaterThanTen, resultSearch,
        findByUsername, findByPassword, findBySerialNor)
        console.log(myRS+'myRS0');

        var existC = await existD(res,req,greaterThanTen, {
        networkId: myRS.networkId,
        username: myRS.username,
        password: myRS.password,
        serialNu: myRS.serialNu
        })
        if (existC) return existC


        async function injectKeyValueInArray(array, keyValues) {
        return new Promise((resolve) => {
        if (!array.length) return resolve(array);
        array.forEach((object) => {
        for (let key in keyValues) {
        object[key] = keyValues[key]
        }
        }); resolve(array);
        })
        };

        injectKeyValueInArray(csvData,).then((newArrOfObj) => {

        newArrOfObj.forEach(myFunction);
        async function myFunction(item, index) {

        const Data = cardData(item)

        await modelCsv.insertMany([Data], { rawResult: true })
        }

        return res.status(200).json({
        'msg': 'File uploaded/import successfully!', 'file': req.file,
        'count cards': csvData.length
        });
        })

        } catch (error) {
                console.log(error);
        await deleteImageFromFileUploads(req)
        logger.error("injectKeyValueInArray Csv Cards==>" + error);
        return res.status(404).json({ Error: error.message });
        };
        }

        async getAllCSV(req, res) {
        const data = await modelCsv.find()
        var lengthData = data.length;
        return res.status(200).json({ "data": data, "status": 200, "lengthData": lengthData })
        }

        async getByIdCSV(req, res) {
        const id = req.params._id;
        const getAllData = await modelCsv.find({ packageId: id }).populate('packageId');
        return res.status(200).json({ "lengthData": getAllData.length, data: getAllData })

        }

        async deleteAllPackageCardsByid(req, res) {
        const id = req.params._id;
        const deleteAllData = await modelCsv.deleteMany({ packageId: id });
        let result;
        if (deleteAllData.deletedCount == 0) {
        result = 'لقد تم حدف الكروت الخاصه بهذه الباقة بالفعل'
        } else { result = ' تم حذف ' + deleteAllData.deletedCount + ' كرت بنجاح  '; }
        return res.status(200).json(result)
        }

        }
        /* this is for validate if username or password or serialNumber exist or no */
        async function existD(res,req,greaterThanTen, { networkId, username, password, serialNu },) {

        const resultU = await fC({ networkId: networkId, username: username })
        const resultP = await fC({ networkId: networkId, password: password })
        const resultS = await fC({ networkId: networkId, serialNu: serialNu })


        if (resultU[0]) {
        await deleteImageFromFileUploads(req)
        var resU = findBy(resultU,)/* this is response details */
        return resDa(res, resU, 'this is cards already exist . (The username already exist)')/* this is custom response */
        } if(greaterThanTen[0].equalUAP != true && greaterThanTen[0].equalUAP != null||greaterThanTen[0].havePassword==false){
        if (resultP[0]) {
        await deleteImageFromFileUploads(req)
        var resP = findBy(resultP)
        return resDa(res, resP, 'this is cards already exist . (The password already exist)')
        }}
        if (resultS[0]) {
        await deleteImageFromFileUploads(req)
        var resS = findBy(resultS,)
        return resDa(res, resS, 'this is cards already exist . (The serialNumber already exist)')
        }
        }
        function findBy(result) {
        return result.map(function (data) {//this is the cards if it already exist
        return ({
        "username": data.username,
        "password": data.password ?? data.username,/* i am do if value password equal null give it value username because maybe password and username equal or password equal false */
        "serialNu": data.serialNu
        });
        });
        }
        
        function resDa(res, result, error) {//response data
        if (result[0] != undefined) {
        return res.status(400).json({ Error: error, "count": result.length, "cards": result, });
        }
        }
        async function fC(data) {
        return await modelCsv.find(data).select('username , password , serialNu -_id');

        }

        function validationFindCard(
        body, greaterThanTen, resultSearch,
        findByUsername, findByPassword, findBySerialNor) {
        if (greaterThanTen[0].havePassword == true) {

        if (greaterThanTen[0].equalUAP == false && greaterThanTen[0].equalUAP != null) {/* check if package cards not Equal Username And Password*/

        resultSearch = {
        networkId: body.networkId,
        username: { $in: findByUsername },
        password: { $in: findByPassword },
        serialNu: { $in: findBySerialNor },

        }

        } else if (greaterThanTen[0].equalUAP == true && greaterThanTen[0].equalUAP != null) {
        resultSearch = {
        networkId: body.networkId,
        username: { $in: findByUsername },
        /* <//<<password: item.password>>//> i am  disable Search this password because do error because not found password in database because equalUAP =true */
        serialNu: { $in: findBySerialNor },
        }

        }
        } else {
        resultSearch = {
        networkId: body.networkId,
        username: { $in: findByUsername },
        /* <//<<password: { $in: findByUsername },>>//> i am  disable Search this password =false */
        serialNu: { $in: findBySerialNor },
        }

        }
        console.log(resultSearch.networkId);
        return resultSearch


        }
        async function findN(res, body,) {
        const findN = await findNetwork(body.networkId)
        return findN
        }
        module.exports = new CSV();
        module.exports.validationFindCard = validationFindCard;
        module.exports.findN = findN;
        module.exports.findBy = findBy;
        module.exports.resDa = resDa;
        module.exports.fC = fC;










