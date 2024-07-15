class ApiFeatures {
    constructor(mongooseQuery, queryString) {
      this.mongooseQuery = mongooseQuery;
      this.queryString = queryString;
    }
  
    filter() {
      const queryStringObj = { ...this.queryString };
      const excludesFields = ['page', 'sort', 'limit', 'fields'];
  
      // Exclude specific fields from the query string object
      excludesFields.forEach((field) => delete queryStringObj[field]);
  
      // Apply filtration using [gte, gt, lte, lt]
      let queryStr = JSON.stringify(queryStringObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  
      // Update the mongoose query with the filtered query
      this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
  
      return this;
    }
  
    sort() {
      if (this.queryString.sort) {
        // Sort the mongoose query based on the provided fields
        const sortBy = this.queryString.sort.split(',').join(' ');
        this.mongooseQuery = this.mongooseQuery.sort(sortBy);
      } else {
        // Default sort by '-createAt' if no sort parameter is provided
        this.mongooseQuery = this.mongooseQuery.sort('-createAt');
      }
      return this;
    }
  
    limitFields() {
      if (this.queryString.fields) {
        // Select specific fields in the mongoose query
        const fields = this.queryString.fields.split(',').join(' ');
        this.mongooseQuery = this.mongooseQuery.select(fields);
      } else {
        // Exclude '__v' field if no fields parameter is provided
        this.mongooseQuery = this.mongooseQuery.select('-__v');
      }
      return this;
    }
  
    search(modelName) {
      if (this.queryString.keyword) {
        let query = {};
  
        if (modelName === 'Products') {
          // Construct a search query for 'Products' model
          query.$or = [
            { title: { $regex: this.queryString.keyword, $options: 'i' } },
            { description: { $regex: this.queryString.keyword, $options: 'i' } },
          ];
        } else {
          // Construct a search query for other models
          query = { name: { $regex: this.queryString.keyword, $options: 'i' } };
        }
  
        // Apply the search query to the mongoose query
        this.mongooseQuery = this.mongooseQuery.find(query);
      }
      return this;
    }
  
    paginate(countDocuments) {
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 50;
      const skip = (page - 1) * limit;
      const endIndex = page * limit;
  
      // Pagination result object
      const pagination = {};
      pagination.currentPage = page;
      pagination.limit = limit;
      pagination.numberOfPages = Math.ceil(countDocuments / limit);
  
      // Determine next page
      if (endIndex < countDocuments) {
        pagination.next = page + 1;
      }
  
      // Determine previous page
      if (skip > 0) {
        pagination.prev = page - 1;
      }
  
      // Update the mongoose query with pagination parameters
      this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
  
      // Store the pagination result
      this.paginationResult = pagination;
      return this;
    }
  }
  
  module.exports = ApiFeatures;