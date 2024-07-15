const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');

const Product = require('../models/productModel'); //require models
const Coupon = require('../models/couponModel');
const Cart = require('../models/cartModel');

const calcTotalCartPrice = (cart) => {
                            //cart model
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {//loop for elements in the cart
    totalPrice += item.quantity * item.price;//calc sum
  });
  cart.totalCartPrice = totalPrice;//update total_cart_price
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};

// @desc    Add product to  cart
// @route   POST /api/v1/cart
// @access  Private/User
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body; //getting the added product from request body
  const product = await Product.findById(productId);//get product (as object)

  // 1) Get Cart for logged user
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {//user dont have a cart
    // create cart fot logged user with product he added
    cart = await Cart.create({
      user: req.user._id,//logged in user id
      cartItems: [{ product: productId, color, price: product.price }],
                                                //after getting product object
    });
  } else {
    // product exist in cart in same color , update product quantity
    const productIndex = cart.cartItems.findIndex(
      //find this product index(if exist)
      (item) => item.product.toString() === productId && item.color === color
    );

    if (productIndex > -1) {//means that product is found in the cart
      const cartItem = cart.cartItems[productIndex];
      //cart item is one object from cart items array(of objects)
      cartItem.quantity += 1;//increment quantity by 1

      cart.cartItems[productIndex] = cartItem;//update the cart after increment of quantity
    } else {
      // product not exist in cart,  push product to cartItems array
      cart.cartItems.push({ product: productId, color, price: product.price });
    }
  }

  // Calculate total cart price
  calcTotalCartPrice(cart);//calling the function
  await cart.save();//save cart

  res.status(200).json({
    status: 'success',
    message: 'Product added to cart successfully',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    Get logged user cart
// @route   GET /api/v1/cart
// @access  Private/User //only user can get his cart
//no need to pass user id(u already logged in)
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
//getting logged in user cart
  if (!cart) {//if he dont have cart
    return next(
      new ApiError(`There is no cart for this user id : ${req.user._id}`, 404)
    );
  }

  res.status(200).json({
    status: 'success',
    numOfCartItems: cart.cartItems.length,//array of cart size
    data: cart,//return data inside the cart
  });
});

// @desc    Remove specific cart item
// @route   DELETE /api/v1/cart/:itemId //write item id in request
// @access  Private/User
exports.removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    //getting logged in user cart
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },//u should send item id in the request
      //pull:delete item from the array if exists
      //pull from cartitems array the item with given id in the req
    },
    { new: true }//to return the cart after the item deleted
  );

  calcTotalCartPrice(cart);//calc total cart price again
  cart.save();//save the cart

  res.status(200).json({//after deleting the item successfully
    status: 'success',
    numOfCartItems: cart.cartItems.length,//return the new array length
    data: cart,//return cart
  });
});

// @desc    clear logged user cart
// @route   DELETE /api/v1/cart
// @access  Private/User
exports.clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  //deleting the logged in user cart (no need to send user id in request)
  res.status(204).send();
});

// @desc    Update specific cart item quantity
// @route   PUT /api/v1/cart/:itemId //item id is given in the request
// @access  Private/User
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;//write the new quantity in the body

  const cart = await Cart.findOne({ user: req.user._id });
  //get logged in user cart
  if (!cart) {//if he dont have a cart
    return next(new ApiError(`there is no cart for user ${req.user._id}`, 404));
  }

  const itemIndex = cart.cartItems.findIndex(//find index of this item in the array 

    (item) => item._id.toString() === req.params.itemId//given id in the request 
  );
  if (itemIndex > -1) {//if item exists
    const cartItem = cart.cartItems[itemIndex];
    //one object in cartitems array(of objects)

    cartItem.quantity = quantity;//update the quantity with the given value in the request body

    cart.cartItems[itemIndex] = cartItem;//update this cart item after changing the quantity

  } else {//when u try to update quantity to item which is not exist in the array of items
    return next(
      new ApiError(`there is no item for this id :${req.params.itemId}`, 404)
    );
  }

  calcTotalCartPrice(cart);//calc total price after updating quantity

  await cart.save();//save cart

  res.status(200).json({
    status: 'success',
    numOfCartItems: cart.cartItems.length,//return number of items in the cart
    data: cart,//return cart
  });
});

// @desc    Apply coupon on logged user cart
// @route   PUT /api/v1/cart/applyCoupon
// @access  Private/User
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  // 1) Get coupon based on coupon name
  const coupon = await Coupon.findOne({
                       //coupon model
    name: req.body.coupon,//getting coupon name 
    expire: { $gt: Date.now() },
    //check if the expiry date greater than now(check if it is valid coupon)
  });

  if (!coupon) {//dont have coupon or expired coupon
    return next(new ApiError(`Coupon is invalid or expired`));
  }

  // 2) Get logged user cart to get total cart price
  const cart = await Cart.findOne({ user: req.user._id });
                     //cart model
  const totalPrice = cart.totalCartPrice;

  // 3) Calculate price after priceAfterDiscount
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100 //calculating price after discount
  ).toFixed(2); // 99.23

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;//update totalPriceAfterDiscount by the new value
  await cart.save();//save cart

  res.status(200).json({
    status: 'success',
    numOfCartItems: cart.cartItems.length,//return number of items in the cart
    data: cart,//return cart
  });
});
