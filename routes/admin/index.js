const express = require("express");
const router  = express.Router();
const User = require("../../models/User");
const EthWallet = require("../../models/EthereumWallet");
const BtcWallet = require("../../models/BitcoinWallet");

const {userAuthenticated, userAwaitAcc} = require('../../helpers/authethication');
const {isEmpty, uploadDir} = require('../../helpers/upload-helpers');
const fs = require("fs");


// userAuthenticated,
router.all("/*", userAuthenticated, (req, res, next)=>{

    req.app.locals.layout = "admin";
    next();


});


router.get("/", (req, res)=>{

    BtcWallet.find({user: req.user.id})
     .sort({_id: -1})
     .limit(1)
     .then(LastBtcWallet=>{
        // console.log(passbook) 
        
        EthWallet.find({user: req.user.id})
                .sort({_id: -1})
                .limit(1)
                .then(LastEthWallet=>{
                    res.render("admin/", {LastBtcWallet: LastBtcWallet, LastEthWallet: LastEthWallet });


                });
                


    }).catch(err=>{
        console.log(err);
    });

    
  
});




//view user profile
router.get("/profile", (req, res)=>{

    User.find({id: req.user.id}).then(savedUser=>{
        res.render("admin/profile",{savedUser: savedUser});      

    });

});


//view Package Plan
router.get("/package", (req, res)=>{

    res.render("admin/packages");      
    

});

router.get("/package/silver", (req, res)=>{

    res.render("admin/packages/silver");      
    
});


router.get("/deposit", (req, res)=>{

        res.render("admin/deposit")

});

router.post("/deposit", (req, res)=>{

    const {depositAmt, BTC} = req.body;
 
    // console.log(depositAmt)
    res.render("admin/deposit_preview", {depositAmt, BTC});

});


router.post("/deposit_preview", async (req, res)=>{
    // console.log(req.user.id)
    //Request amount from depositors
    const {depositAmt, BTC} = req.body;
    // console.log(depositAmt, BTC);
    //Retrieve the data from the btc wallet
    const btcWallet = await BtcWallet.findOne({user: req.user.id});
        // console.log(btcWallet);


    // res.render("admin/deposit_preview", {depositAmt, BTC});

});


//manage all users
router.get("/manage", (req, res)=>{

        User.find({}).then(users=>{

           
            res.render("admin/manage_client", {users: users});

        });
});

//call to create a user
router.get("/manage/create", (req, res)=>{

        res.render("admin/create_client")

});


//Edit user from admin
router.get("/manage/edit/:id", (req, res)=>{

     User.findOne({_id: req.params.id}).then(user=>{
          
             res.render("admin/update_client", {user: user} );

        });

});

//Update user
router.put("/manage/edit/:id", (req, res)=>{

        User.findById({_id: req.params.id}).then(user=>{
           
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.email = req.body.email;
            user.password = req.body.password


            // console.log("New User upda>te >", user)
            user.save().then(updatedUser=>{
                req.flash('success_message', 'User updated Successfully');
                res.redirect("/admin/manage");


            });

        });
    
  
});
/////////////////////////////////////////////////////////////////////////////////////////////////categories
//delete user 
router.delete("/manage/delete/:id", (req, res)=>{

    User.findOne({_id: req.params.id}).then(user=>{
        // console.log(user.file)
            fs.unlink(uploadDir + user.file, (err)=>{
                user.remove();
                req.flash('delete_message', 'User Deleted Successfully');
                res.redirect("/admin/manage")
            });

    });

});

//logout user
router.get("/logout", (req, res)=>{
        req.logOut();
        res.redirect("/login");
});



// userAuthenticated,


module.exports = router;