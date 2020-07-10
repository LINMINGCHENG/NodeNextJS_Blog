const Users=require('../models/users')
const AWS= require('aws-sdk')
const jwt= require('jsonwebtoken')
const { token } = require('morgan')



AWS.config.update({
   acessKeyId:process.env.AWS_ACCESS_KEY,
   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
   region: process.env.AWS_REGION
})

const ses= new AWS.SES({apiVersion:'2010-12-01'})



exports.register = (req, res)=>{
 
   const {name,email,password} = req.body;

    //check if users exist in our dbpath
    Users.findOne({email}).exec((err,user) =>{
       if(user){
             return res.status(400),json({
                err:'Email is token'
             });
       }

       //generate token with user name email and password
     const token =jwt.sign({name,email,password},process.env.JWT_ACCOUNT_ACTIVETION,{
         expiresIn:'19m'
      })
     

           //send email
        const params = {
           Source: process.env.EMAIL_FROM,
           Destination: {
              ToAddresses: [email]
           },
           ReplyToAddresses: [process.env.EMAIL_TO],
           Message: {
              Body: {
                 Html: {
                    Charset: "UTF-8",
                    Data: `<html><body><h1>${name}<p>${process.env.CLIENT_URL}/auth/activate/${token}</p></h1></body></html>`
                 }
              },
              Subject: {
                 Charset: 'UTF-8',
                 Data: "Complete your registerzation"
              }
         }};
          const sendEmailOnRegister = ses.sendEmail(params).promise()


        sendEmailOnRegister.
        then((data) => {
              console.log('email submiited to SES', data),
                 res.send('email sent')
           })
           .catch((err) => {
              console.log('ses email on register', err);
              res.send('email failed')
           })
    });

}


