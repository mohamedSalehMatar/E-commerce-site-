const mongoose=require('mongoose');
//create schema
const brandSchema= new mongoose.Schema({
    name:{
      type: String,
      required: true,
      unqiue:[true,'Brand must be unique'],
      minlength:[3 , 'too short Brand name '],
      maxlength:[32 , 'too long Brands name'],
  },
   
    slug:{
        type:String,
        lowercase:true,
      },
  
    image: String,

    },{timestamps:true} 
    );
    const setImageURL = (doc) => {
      if (doc.image) {
        const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
        doc.image = imageUrl;
      }
    };
    // findOne, findAll and update
    brandSchema.post('init', (doc) => {
      setImageURL(doc);
    });
    
    // create
    brandSchema.post('save', (doc) => {
      setImageURL(doc);
    });
    
    // change schema to model
    const BrandsModel= mongoose.model('BrandsModel',brandSchema);
    

  //export for Brands model

  module.exports=BrandsModel;
  