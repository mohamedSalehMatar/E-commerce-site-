const asyncHandler = require('express-async-handler');

const { v4: uuidv4 } = require('uuid');//library to generate unique id's for images(files) names

const sharp = require('sharp');//package for image processing

const factory = require('./handlersFactory');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');//function to upload single image
const Brand = require('../models/brandsModel');

// Upload single image
exports.uploadBrandImage = uploadSingleImage('image');//function that return a middleware

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)//sharp take file buffer as a paramter
    .resize(600, 600)//max dimensions
    .toFormat('jpeg')//format(extension)
    .jpeg({ quality: 95 })//image quality
    .toFile(`uploads/brands/${filename}`);//images will be saved in "brands" folder

  // Save image into our db 
   req.body.image = filename;

  next();
});

// @desc    Get list of brands
// @route   GET /api/v1/brands
// @access  Public
exports.getBrands = factory.getAll(Brand);

// @desc    Get specific brand by id
// @route   GET /api/v1/brands/:id
// @access  Public
exports.getBrand = factory.getOne(Brand);

// @desc    Create brand
// @route   POST  /api/v1/brands
// @access  Private
exports.createBrand = factory.createOne(Brand);

// @desc    Update specific brand
// @route   PUT /api/v1/brands/:id
// @access  Private
exports.updateBrand = factory.updateOne(Brand);

// @desc    Delete specific brand
// @route   DELETE /api/v1/brands/:id
// @access  Private
exports.deleteBrand = factory.deleteOne(Brand);
