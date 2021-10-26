const fsPromises = require('fs').promises 
async function deleteImageFromFileUploads(req){
    const path = `./public/uploads/${req.file.filename}`
    await fsPromises.rmdir(path, {
      recursive: true
    })
  }

module.exports.deleteImageFromFileUploads=deleteImageFromFileUploads;
