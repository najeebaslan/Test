module.exports= function (req,res,next) {
console.log(req.userProf.isAdmin);
if(!req.userProf.isAdmin)
/*Admin ا(403)===>المقصد منه انك ليس لديك امكانية الوصول بمعنى انك لست */
return res.status(403).json('You are is not Admin user....');
next();


}
