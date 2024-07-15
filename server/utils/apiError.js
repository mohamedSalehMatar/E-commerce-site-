// @desc    this class is responsible about operation errors (errors that i can predict)
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith(4) ? 'fail' : 'error';
    this.isOperational = true; //check weather the error was expected or not(true means that it was expected)
   
  }
}

module.exports = ApiError;
