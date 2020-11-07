const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const UsdWallet = require("../../models/UsdWallet");
const Transaction = require("../../models/Transaction");
const Package = require("../../models/Package");
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


router.all("/*", (req, res, next)=>{

    req.app.locals.layout = "home";
    next();


});



router.get("/", (req, res)=>{
    res.render("home")
});

router.get("/about", (req, res)=>{
    res.render("home/about")
});

router.get("/contact", (req, res)=>{
    res.render("home/contact")
});

router.get("/services", (req, res)=>{
    res.render("home/services")
});



router.get("/register",(req, res)=>{
    res.render("home/register")
});

//CREATING OUR REGISTER ROUTING
router.post("/register",  (req, res)=>{

    //CREATE AN ERROR MESSAGE
    let errors = [];


    if(!req.body.firstName) {

        errors.push({message: 'please add a First Name'});

    }


    if(!req.body.lastName) {

        errors.push({message: 'please add a Last Name'});

    }

    if(!req.body.email) {

        errors.push({message: 'please add an Email'});

    }

    if(!req.body.password) {

        errors.push({message: 'please enter a password'});

    }


    if(!req.body.passwordConfirm) {

        errors.push({message: 'This field cannot be blank'});

    }


    if(req.body.password !== req.body.passwordConfirm) {

        errors.push({message: "Password fields don't match"});

    }


 if(errors.length > 0){

        res.render('home/register', {

            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,

        });

    } else {
        
User.findOne({email: req.body.email}).then(userFound=>{

    if(!userFound){
             //INSTANCIATING THE MODEL CLASS
            const newUser = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password,      
        });

    //SAVING THE MODEL INSTANCE
    newUser.save().then(user=>{

    //CREATING A Btc LEDGER OBJECT
        let ledger = {
            remark: "Opening Balance",
            debit : 0,
            credit: 0,
            balance: 0,
            reference: Math.floor(Math.random() * 94521),
            user: user.id,
        };

       
        //Deposit History
        //INSTANCIATING A PASSBOOK CLASS
        const usdWallet =  new UsdWallet(ledger);
      

            //SAVING THAT  Btc Wallet INSTANCE TO MONGOOSE
            usdWallet.save().then(usdWallet=>{
                //REDIRECT PAGE TO LOGIN VIEW

                req.flash('success_message', 'You are now registered, please login');
                        
                res.redirect("/login");
          
                 


            }).catch(err=>{
                console.log(err);
            });



        });

   
            } else {

                req.flash('error_message', 'That email exist please login');


                res.redirect('/register');


            }


        });

   



    }
    
});


//////////////////////////////////////////////////////////////

router.get("/login", (req, res)=>{
    res.render("home/login")
});
//APP LOGIN

passport.use(new LocalStrategy({usernameField: "email"}, (email, password,done)=>{

    // console.log(email)

    User.findOne({email: email}).then(user=>{
        
        if(!user) return done(null, false, {message: "No user found"});

        if(password === user.password){
                return done(null, user);
           
        }else{
                return done(null, false, {message: "Incorrect Password"})

        }
        
 
    });



}));


passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});



router.post("/login", (req, res, next)=>{

    passport.authenticate("local", {
        successRedirect: "/admin",
        failureRedirect: "/login",
        failureFlash: true
    })(req,res, next);

});



module.exports = router;