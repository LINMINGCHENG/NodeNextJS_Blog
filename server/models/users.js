const mongoose = require('mongoose');

const crypto =  require('crypto');


const userSchema = new mongoose.Schema(
    {
        username:{
            type:String,
            trim:true,
            required:true,
            max:12,
            unique:true,
            index:true,
            lowercase:true
        },
        name:{
            type:String,
            trim:true,
            required:true,
            max:32
        },
        email:{
            type:String,
            trim:true,
            required:true,
            unique:true,
            lowercase:true
         },
         hashed_password:{
             type:String,
             required:true,
         },
         salt:String,
         role:{
             type:String,
             default:'subscriber'
         },
         resetPassordLink:{
            data:String,
            default:''
         }
    },{timestamps:true}
)


//virtual fields

userSchema.virtual('password')
    .set(function(password){
        //create temp variable called _password
       this._passord = password

       //generate salt
        this.salt = this.makeSalt()
       //encrypt password
       this.hashed_password = this.encryptPassword(password)
    })
    .get(function(){
        return this._password
    })



//method  > authentication encryptPassword MakeSalt
userSchema.methods ={

  authenticate: function(plainText){
     return this.encryptPassword(plainText) === this.hashed_password;
  },

  encryptPassword:function(password) {
      if(!password) return ''
      try {
          return crypto.crypto.createHmac('sha1', this.salt)
              .update(password)
              .digest('hex');
      } catch (error) {
          return ''
      }
  },


  makeSalt:function(){
   return Math.round(new Date().valueOf() * Math.random()) + '';
  }

};

module.exports = mongoose.model('User');