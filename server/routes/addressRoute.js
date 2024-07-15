const express = require('express');

const authService = require('../services/authService');

const {
  addAddress,
  removeAddress,
  getLoggedUserAddresses,
} = require('../services/addressService');

const router = express.Router();

router.use(authService.protect, authService.allowedTo('user'));
//to edit in adresses u should  be user and logged in("protect")
router.route('/').post(addAddress).get(getLoggedUserAddresses);

router.delete('/:addressId', removeAddress);
//delete address by  adressid
module.exports = router;
