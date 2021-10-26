const {privateKey,jwt}=require('../utils/utils')
module.exports = function (req, res, next) {

  if (req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  } try {
    if (token == undefined) {
      res.status(401).json({ Error: 'الوصول مرفوض تاكد من ارسال التوكن' })
      return false;
    } else
    if (!token)return res.status(401).json({ Error: 'الوصول مرفوض تاكد من ارسال التوكن' })/* ا  (401)===>المقصد منه ان اليوزر غير مرخص */
    const decodeToken = jwt.verify(token, privateKey);
    req.userProf = decodeToken;
    next();
  } catch (e) {
    return res.status(400).json({ Error: '... رمز التوكن خطاء' })
  }
}

