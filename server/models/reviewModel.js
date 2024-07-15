const mongoose = require('mongoose');
const Product = require('./productModel');//require productmodel

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [1, 'Min ratings value is 1.0'],
      max: [5, 'Max ratings value is 5.0'],
      required: [true, 'review ratings required'],
    },
    user: {//only users can make a review
      //user as ID

      type: mongoose.Schema.ObjectId,//reference documents from other collections
      ref: 'User',//references the 'User' model in Mongoose.
      required: [true, 'Review must belong to user'],
    },
    // parent reference (one to many) used bec number of  reviews is big
    product: {//review must belong to product
      //product as ID
      type: mongoose.Schema.ObjectId,//reference documents from other collections
      ref: 'Product',//references the 'Product' model in Mongoose.
      required: [true, 'Review must belong to product'],
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {//'pre' middlware to show the name of the user who wrote the review
  this.populate({ path: 'user', select: 'name' });//populate (show) username
  next();
});

reviewSchema.statics.calcAverageRatingsAndQuantity = async function (
  //function to calcualte avg rating and quantity of reviews for each product
  productId
) {
  const result = await this.aggregate([ //take array of stages
    // Stage 1 : get all reviews in specific product
    {
      $match: { product: productId },
      //method to get only the  reviews that matches this productID
    },
    // Stage 2: Grouping reviews based on productID and calc avgRatings, ratingsQuantity
    {
      $group: {
        _id: 'product',//group the reviews of same product id
        avgRatings: { $avg: '$ratings' },//calculate their avg
        ratingsQuantity: { $sum: 1 },//count their quantity
                          //counter
      },
    },
  ]);

  // console.log(result); //results is array of ratings
  if (result.length > 0) { //if there are ratings on the product(not empty array)
    await Product.findByIdAndUpdate(productId, { //always updating avgratings,quantity values
                                                 //when user create  review
      ratingsAverage: result[0].avgRatings,
      ratingsQuantity: result[0].ratingsQuantity,
    });
  } else {//no ratings
    await Product.findByIdAndUpdate(productId, {//default values=0
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post('save', async function () {//call calcAverageRatingsAndQuantity after saving(creating) the review
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
                                                        //productid that we grouped it to do the operations
});

reviewSchema.post('remove', async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);
