require('express-async-errors');
const network = require("../../models/network");
const PhoneModel = require("../../models/phones");
const { validationPhone } = require("../../models/phones");
const locationM = require('../../models/location');
const { validationNetwork } = require("../../models/network");
const profile = require("../../models/userProfile");
const { deleteImageFromFileUploads } = require('../../utils/delete_pathFiles')
const { Joi, ObjectId, logger, mongoose, } = require('../../utils/utils')
const { SetStreet } = require('../location/location');//Location Controller
const { findUser } = require('../../utils/find_utils')


class network_Controller {
  async getNetwork(req, res) {
    try {

      await network.find(
        function (error, data) {
          if (error) return res.status(404).json({ Error: error.message })

          return res.json(data);
        })
        .populate('coverage_area packages allCoverage_Area')
        .populate({ path: 'allCoverage_Area', select: "allCoverage_Area -_id" })
        .populate({ path: 'coverage_area', select: "-networks -_id -createdAt -updatedAt -updatedAt -isActive -user_initiate -__v" })
        .populate({
          path: 'packages ', populate: {
            path: 'package_PriceId',
            select: "package_Price -_id"
          },//🤨🤨🤨🤨🤨🤨🤨🤨
          populate: { path: 'package_PriceId', select: 'package_Price -_id', },//🤨🤨🤨🤨🤨🤨🤨🤨
          select: 'package_Price -_id',
        })
    } catch (error) {
      logger.error("get All Network==>" + error);
      return res.status(404).json({ Error: error.message })
    }

  }

  async getNetworkById(req, res) {
    const id = req.params;
    try {
      const oneNetwork = await network.findById(id).
        select('-packages ')
        // .populate( { path: "packages", select: "info -_id" })
        // populate('packages','info._id')
        // .populate('user_initiate', 'name -_id')
        .populate({ path: "allCoverage_Area", select: "allCoverage_Area -_id" })
        // .select('allCoverage_Area allCoverage_Area')
        .populate('coverage_area', '-allCoverage_Area -networks-_id -address -user_initiate -createdAt -updatedAt -__v');
      if (!oneNetwork) {
        console.log("oneNetwork not found ! " + id);
        return res.json("لم يتم العثور علا هذه الشبكة" + id);
      }
      const result = {
        _id: id,
        img: oneNetwork.img,
        nameA: oneNetwork.nameA,
      };
      return res.json([oneNetwork]);
    } catch (error) {
      logger.error("getNetworkById==>" + error);
      console.log(error.message);
      return res.status(404).json({ Error: error.message })
    }
  }

  async getNetworkByName(req, res) {
    const searchData = req.params.nameA;
    console.log(searchData);
    try {
      await network.find({ nameA: { $regex: searchData }, isActive: true, },
        function (err, data) {
          if (err) return res.json({ Error: err.message });
          if (data[0] == null) {
            console.log("oneNetwork not found ! " + searchData);
            return res.status(404).json({ Error: "no network found for this name " + searchData });
          }
          return res.status(200).json(data);
        }).select("-packages -coverage_area -allCoverage_Area -phones -user_initiate -createdAt -updatedAt -__v");
    } catch (error) {
      logger.error("getNetworkByName==>" + error);
      console.log(error.message);
      return res.status(404).json({ Error: error.message })
    }
  }

  async NetworksCount(req, res) {

    try {

      const network1 = await network.countDocuments({},
        function (err, count) {
          if (err) return res.status(401).json({ "Error": err.message })
          return count
        });
      if (!network1) return res.json("no network found");
      return res.status(200).json({ "networks": network1 });
    } catch (error) {
      logger.error("NetworksCount" + error);
      console.log(error.message);
      return res.status(404).json({ Error: error.message })
    }
  }
  async postPhone(req, res) {
    const { error } = validationPhone(req.body);
    if (error) {

      return res.status(404).json({ Error: error.details[0].message })
    }
    console.log(req.body);
    const postMyPhonefd = PhoneModel({
      phone: req.body.phone
    })
    postMyPhonefd.save(function (error) {
      if (error) return res.json({ error: error });
      return res.json(postMyPhonefd)
    })
    // res.json(postMyPhonefd)
  }


}
async function CreateNetwork(req, res) {
  try {
    const id = new mongoose.Types.ObjectId();
    const idPone = new mongoose.Types.ObjectId();
    const body = req.body;

    const { error } = validationNetwork(req.body);
    if (error) {
      await deleteImageFromFileUploads(req)
      return res.status(404).json({ Error: error.details[0].message })
    }

    const errorUser = await findUser(body.user_initiate);
    if (errorUser[0] == null || errorUser[0] == undefined) {
      await deleteImageFromFileUploads(req)
      return res.status(400).json({ "Error": 'this user is not found' });
    }

    const hasN = await profile.findOne({ _id: body.user_initiate });//if Has Network
    if (hasN.network != null) {
      await deleteImageFromFileUploads(req)
      return res.status(400).json({ "Error": 'You already have a network added' })
    }
    const idS = new mongoose.Types.ObjectId();
    let idCity, idStreet;
    const findGovernorate = await locationM.findOne({ _id: ObjectId(body.governorateId) })//Find Governorate By Id
    if (!findGovernorate) {
      await deleteImageFromFileUploads(req)
      res.status(401).json({ "Error": 'not found this governorate' })
      return false;
    } else if (findGovernorate) {

      const findSameDetailsNetwork = await network.find({
        nameA: body.nameA, "location.governorateId": body.governorateId,
      }).populate({
        path: 'location',
        populate: { path: 'governorateId', model: 'location' },
      }).select('governorateId')
      if (findSameDetailsNetwork[0]) {
        /* this for search name city  in database if find same name which sended it user return error */
        const findCity = findSameDetailsNetwork[0].location.governorateId.cities.filter(element => element.name == body.cityName);
        /* this for search name street  in database if find same name Which sended it user return error */
        if (findCity[0]) {
          const findStreet = findCity[0].streets.filter(element => element.name == body.streetName);
          if (findStreet != null || findStreet != undefined) {
            await deleteImageFromFileUploads(req)
            return res.status(404).json({ "Error": 'A network has been added with such details, please change the name or location of the network' })
          }

        }
      }
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
        { $project: { cities: "$list" } },

      ]).exec()
      if (city[0] == undefined) {// This for check if city is not exist do set city 
        idStreet = idS;
        idCity = idC;
        await locationM.findByIdAndUpdate(body.governorateId,
          { $push: { cities: { _id: idCity, name: body.cityName.trim() }, } })
          .then(data => {
            SetStreet(res, body.streetName, body.cityName, idStreet, body.governorateId)
            saveNetwork(id, idPone, req, res, body.governorateId, idCity, idStreet)
            // setDetailsUserInProfile(userId,age,);
            // setDetailsUserInUser(userId,sex,userType,body.governorateId,idCity,idStreet,)
            //return res.status(200).json({'userType':userType})
          });

      } else { //This for check if street is not exist do set street  
        idCity = city[0].cities._id;
        const street = await locationM.aggregate([[
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
          ]]).exec()
         console.log(street[0]);

        if (street[0] == undefined) {

          SetStreet(res, body.streetName, body.cityName, idS, body.governorateId)
          saveNetwork(id, idPone, req, res, body.governorateId, idCity, idS)

        } else {
          saveNetwork(id, idPone, req, res, body.governorateId, idCity, street[0]._id,)
        }
      }
    }

  } catch (error) {
    await deleteImageFromFileUploads(req)
    logger.error("CreateNetwork===>" + error);
    console.log(error.message);
    return res.status(404).json({ Error: error.message })
  }

}

async function setIdNetworkInUserProfile(networksId, userId,) {
  await profile.findByIdAndUpdate(userId, { $set: { network: networksId, isAdmin: true }, }, { new: true, });
};

async function saveNetwork(id, idPone, req, res, governorateId, cityId, streetId,) {
  const network1 = new network({
    _id: id,
    nameA: req.body.nameA,
    nameE: req.body.nameE,
    img: req.file.filename,
    // img: `http://172.16.0.8:3000/${req.file.path}`,
    user_initiate: req.body.user_initiate,
    phones: id,
    address: req.body.address,
    location: {
      governorateId: governorateId,
      cityId: cityId,
      streetId: streetId,
    }
  });
  console.log(req.body);
  network1.save(function (err) {
    if (err) return res.json(err.message);
    var newArr = JSON.parse('' + [req.body.maintenancePhone].join() + '');
    const Phone = PhoneModel(
      {
        _id: idPone,
        phone: newArr,
        network_ini: id,/* this is for create phone for network by id network */
      });
    Phone.save(function (err) {
      setIdNetworkInUserProfile(network1._id, req.body.user_initiate)
      if (err) return res.json(err.message);
      return res.status(200).json({ "id": id, })

    });
  })
}


module.exports = new network_Controller();
module.exports.CreateNetwork = CreateNetwork;
