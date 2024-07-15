const multer = require('multer');//middlware that handle file uploads
const ApiError = require('../utils/apiError');//require error handler class

const multerOptions = () => {

  const multerStorage = multer.memoryStorage();//multerstorage to control the file storage and file name

  const multerFilter = function (req, file, cb) {//cb:call back function
    if (file.mimetype.startsWith('image')) {//check if the file contain image

      //mimeType: is a label used to identify the type of data contained in a file
      cb(null, true);
    } else {
      cb(new ApiError('Only Images allowed', 400), false);//error message if the file is not image
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

  return upload;
};

exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);//(function)creating middleware to upload single file

exports.uploadMixOfImages = (arrayOfFields) =>
  multerOptions().fields(arrayOfFields);//(function)creating middleware to upload single file(1 image) or many images
