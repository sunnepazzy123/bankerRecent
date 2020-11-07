const express = require("express");
const router  = express.Router();
const User = require("../../models/User");
const UsdWallet = require("../../models/UsdWallet");
const Deposit = require("../../models/Deposit");
const Package = require("../../models/Package");
const Withdrawal = require("../../models/Withdrawal");


const {userAuthenticated, userAwaitAcc} = require('../../helpers/authethication');
const {isEmpty, uploadDir} = require('../../helpers/upload-helpers');
const fs = require("fs");


// userAuthenticated,
router.all("/*", userAuthenticated, (req, res, next)=>{

    req.app.locals.layout = "admin";
    next();


});


router.get("/", async (req, res)=>{

    try {

        const LastUsdWallet   = await UsdWallet.find({user: req.user.id}).sort({_id: -1}).limit(1);
        const Packager    = await Package.find({user: req.user.id}).sort({_id: -1}).limit(1);
    
            res.render("admin/", {LastUsdWallet: LastUsdWallet, Packager: Packager});
        
    } catch (error) {

        console.log(error);
        
    }




  
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

router.post("/packages/silver",  (req, res)=>{

    res.render("admin/silver_plan");


});

router.post("/silver/subcribe", async (req, res)=>{

    const {amount,  duration} = req.body;
    let interest;
    let income;
    let finalBalance;
    let endDate;

    let packagee;

    if(duration == "3 MONTHS"){
         interest = 0.1;
         endDate = 90;
    }
    if(duration == "6 MONTHS"){
        interest = 0.11;
        endDate = 180;
   }
   if(duration == "9 MONTHS"){
    interest = 0.12;
    endDate = 270;
    }

    //to get the current income
    income = amount * interest;

    // console.log("this is the income ", income);

    //get the finalbalance
    finalBalance = Number(amount) + Number(income);

    // console.log("this is the final balance ", finalBalance);

    // console.log("this is the end date duration ", endDate);
    // console.log(typeof endDate);


    //to get the current date
    let currentDate = new Date();

    // console.log("this is the current date " , currentDate);

    function addDays(date, days){
        const copy = new Date(Number(date));
        copy.setDate(date.getDate() + days);
        return copy;
    }

    
    //to get future end date
    let futureDate = addDays(currentDate, endDate)
    // console.log("this is the future date " , futureDate);




    //Retrieve Wallet balance
    const usdWallet = await UsdWallet.findOne({user: req.user.id}).sort({_id: -1}).limit(1);
    //Rretrieve Package 
    const package = await Package.findOne({user: req.user.id}).sort({_id: -1}).limit(1);
    console.log(package)
    //
    // // console.log(usdWallet)
    const newAmount = usdWallet.balance - amount;
    // // console.log(newAmount);

    if(package === null){
         packagee = {
            status: "unsubcribe"
        }
    
    }else{
        packagee = {
            status: "subcribe"
        }
    }


    if(packagee.status == "subcribe"){
        req.flash('error_message', 'You are still on a current packages');
        res.redirect("/admin/packages/silver");

    }
 
    if(usdWallet.balance >= 100 && amount >= 100){

        if(amount > usdWallet.balance){

            req.flash('error_message', 'The amount is too large than the your wallet amount');
            res.redirect("/admin/packages/silver");

        }else{
            //create a new wallet ledger
            let walletLedger = {
                debit: amount,
                credit: 0,
                balance: newAmount,
                reference: Math.floor(Math.random(100, 900) * 9999),
                remark: "debit wallet",
                user: req.user.id
            }
    
        // select package plan
            let packagePlan = {
                    packagePlan: "Silver Plan",
                    user: req.user.id,
                    amount: amount,
                    interest: interest,
                    income: income,
                    finalBalance: finalBalance,
                    duration: duration,
                    endDate: futureDate,
                    status: "subcribe"
            }


            // console.log(packagePlan)
        
            let updateWallet = await UsdWallet.create(walletLedger);
        
            let newPackage =  await Package.create(packagePlan);
        
            // console.log(newPackage);
            // console.log(updateWallet);
            req.flash('success_message', 'Your package have been created');
            
            res.redirect("/admin");

        }

     
    

    }else{

        req.flash('error_message', 'The wallet amount is too small for subcribing or amount is too small for subcription');
        res.redirect("/admin/packages/silver");

    }

 

});

router.get("/packages/silver", (req, res)=>{
    res.render("admin/silver_plan")
});









router.get("/packages_list", async (req, res)=>{

    const packages = await Package.find({user: req.user.id})

    console.log(packages);



    res.render("admin/packages_list", {packages: packages});
})


router.get("/withdraw", async(req, res)=>{
    res.render("admin/withdraw")
})

router.get("/withdraw/wallet", async(req, res)=>{
    res.render("admin/wallet_withdrawal");
});

router.post("/withdraw/wallet", async(req, res)=>{

    const {walletAddress, amount, walletType} = req.body;

    //check the wallet balance 
    const usdWallet = await UsdWallet.findOne({user: req.user.id}).sort({_id: -1}).limit(1);
    // console.log(usdWallet)
    //get the final balance
    let finalBalance = Number(usdWallet.balance) - Number(amount);

    if(amount > usdWallet.balance ){

        req.flash('error_message', `Your withdrawal amount is greater your wallet balance`);
        res.redirect("/admin/withdraw/wallet");

    }else{

        
    //create a new wallet instance
    let walletLedger = {
        debit: amount,
        credit: 0,
        balance: finalBalance,
        reference: Math.floor(Math.random(10000, 90000) * 9999999),
        remark: "withdrawal debit",
        user: req.user.id
    }

    // console.log(walletLedger)

    // //make a withdrawal slip
    const withdrawalSlip = {
        walletAddress: walletAddress,
        amount: amount,
        walletType: walletType,
        status: "approve",
        reference: Math.floor(Math.random(10000, 90000) * 9999999),
        user: req.user.id

    }

        //Create a new wallet instance
        const newWalletInstance = await UsdWallet.create(walletLedger);
  
        const withdrawalInstance = await Withdrawal.create(withdrawalSlip);

        // console.log(withdrawalInstance)


        req.flash('success_message', `Your withdrawal of $${amount} have been created`);
        res.redirect("/admin/");

    }




    
});

router.get("/withdraw/income", async(req, res)=>{
    res.render("admin/package_withdrawal");
});

router.get("/withdraw/history", async(req, res)=>{


    const withdrawalHistory = await Withdrawal.find({user: req.user.id}).sort({_id: -1}).limit(1);
    console.log(withdrawalHistory)
    res.render("admin/withdrawal_history" , {withdrawalHistory: withdrawalHistory});
});

router.get("/withdrawal_request", async(req, res)=>{

    const withdrawalHistory = await Withdrawal.find({});


    res.render("admin/withdrawal_request", {withdrawalHistory: withdrawalHistory})
});


router.get("/deposit_history", async(req, res)=>{

    const depositHistory = await Deposit.find({});
    res.render("admin/deposit_history", {depositHistory: depositHistory});
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

    //Request amount from depositors
    const {depositAmt, BTC} = req.body;
    // console.log(depositAmt, BTC);
    //Retrieve the user data from the usd wallet
    const usdWallet = await UsdWallet.findOne({user: req.user.id}).sort({_id: -1}).limit(1);
    // console.log( UsdWallet.balance)
    // //create a  response constance variable from bitpay for success
    const response = {
        amount: depositAmt,
        type: "BTC",
        reference: Math.floor(Math.random(100, 900) * 9999),
        remark: "alert deposit",
        user: req.user.id,
        status: "success",
        date: Date.now()
    }

    // //Add the response to your wallet
        let newWalletAmount = Number(response.amount) + Number(usdWallet.balance)
        //Create an invoice to the wallet from the deposit response from Api 
        let walletLedger = {
            debit: 0,
            credit: response.amount,
            balance: newWalletAmount,
            reference: response.reference,
            remark: "alert deposit",
            user: req.user.id
        }
    
      
        // // //Add the deposit Amount to the user deposit history
        let userWalletDeposit = await Deposit.create(response);
        // Add the deposit Amount to the Btc Wallet
        let updateWallet = await UsdWallet.create(walletLedger);
        
       
        // // console.log(userWalletDeposit)
        req.flash('success_message', `Your deposit of $${depositAmt} have been created`);
        res.redirect("/admin");
      

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