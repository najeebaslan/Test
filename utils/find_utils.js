const user = require('../models/users');
const network = require('../models/network');
const { ObjectId} = require('../utils/utils');

const findNetwork = async (id) => {
const findNetwork = await network.findOne({ _id:ObjectId(id)  })
.populate({path:'packages', select: 'user_initiate package_Price havePassword equalUAP',})
.select('_id packages nameA user_initiate')
if (findNetwork) { return [false, findNetwork] } else {return [true]};
}

// const findUser = async (id) => {
//   const findUser = await user.findOne({ _id: id });
//   if (!findUser) { return 'this user not found'; }

// }

const findUser = async (id) => {
  const findUser = await user.findOne({ _id: id });
  if (findUser) { return [false, findUser] } else {return [true]}
  //{ return 'this user not found'; }

}
module.exports = { findUser, findNetwork }