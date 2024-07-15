// connect with database
const mongoose = require('mongoose');
const dbURI=process.env.DB_URI;
const dbConnection =()=>{
    mongoose.connect(dbURI).then((conn)=>{
    console.log(`database connected: ${conn.connection.host}`);
}).catch((err)=>{
  console.error(`Database error: ${err}`)
  process.exit(1);
});
};

module.exports= dbConnection;