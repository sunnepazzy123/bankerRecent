const express = require("express");
const router  = express.Router();
const User = require("../../models/User");
const Passbook = require("../../models/Passbook");
const Bank = require("../../models/Bank");
const {userAuthenticated, userAwaitAcc} = require('../../helpers/authethication');
const {isEmpty, uploadDir} = require('../../helpers/upload-helpers');
const fs = require("fs");


// userAuthenticated,
router.all("/*",  (req, res, next)=>{

    req.app.locals.layout = "admin";
    next();


});


router.get("/", (req, res)=>{

     Passbook.find({user: req.user.id})
     .sort({_id: -1})
     .limit(1)
     .then(lastPassbook=>{
        // console.log(passbook)     
        res.render("admin/", {lastPassbook: lastPassbook});

    }).catch(err=>{
        console.log(err);
    });

    
  
});



//get transaction history
router.get("/recent_transaction", (req, res)=>{
     
    Passbook.find({user: req.user.id})
    .populate('users')
    .then(passbookLedger=>{

        res.render('admin/recent_transaction', {passbookLedger: passbookLedger});
    });

});

//view user profile
router.get("/profile", (req, res)=>{

    User.find({id: req.user.id}).then(savedUser=>{

        res.render("admin/profile",{savedUser: savedUser});
        

    });


});



//navigate to transfer page
router.get("/transfer", (req, res)=>{
    res.render("admin/transfer")
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//transfer to domestic bank
router.get("/transfer/domestic_bank", (req, res)=>{
    res.render("admin/domestic_bank")
});

//Transfer to Dosmeticbank
router.post("/transfer/domestic_bank", (req, res)=>{

    let errors = [];
        //VALIDATING REQUEST
    if(!req.body.name) {

        errors.push({message: 'please add a Receiver Name'});

    }

    if(!req.body.account) {

        errors.push({message: 'please add an Account Number'});

    }

    
    if(!req.body.amount) {

       errors.push({message: 'please add an Amount Number'});

   }
 
if(errors.length > 0){

   res.render('admin/domestic_bank', {

       errors: errors,
       name: req.body.name,
       account: req.body.lastName,
       amount: req.body.amount,
       pincode:req.body.pincode

   });


}else{

    let depositSlip = {
        depositor: req.user.id,
        reciever: req.body.name,
        account: req.body.account,
        amount: req.body.amount,
        reference: Math.random(0, 4),
        date: Date.now(),
        pin: req.body.pincode
    }

    res.render("admin/confirm_transfer", {depositSlip: depositSlip} );


}


   
});

/////////////////////////////////////////////////////////////////////////////////////

//domestic transfer success or fail
router.post("/transfer/domestic_bank/transact_success", (req, res)=>{

    let name = req.body.name;
    let account = req.body.account;
    let amount = req.body.amount;
    let pincode = req.body.pincode;
 //CREATE AN Display MESSAGE For Success or Fail
    let messageDisplay = {
        insufficientFund: false,
        incorrectPin: false,
        success: false,
        receiverAccount: false,       
    }

        //COMPARE USER PIN TO CURRENT PIN
        if(pincode === req.user.pin){
            //Find receiver account number exist
              
           // LAST ENTRY PASSBOOK FOR USER
            Passbook.find({user: req.user.id})
            .sort({_id: -1})
            .limit(1)
            .then(lastPassbook=>{
                //Retrieve Last Ledger Balance
                let balance = lastPassbook[0].balance;
                let finalBalance = balance - parseInt(amount);
    
                // console.log("here is the last passbook --", lastPassbook );
    
                if(finalBalance >= 0){
    
                    //Create a new Record for Passbook
                    let ledger = {
                        remark: `Debit initiated to Account Number ${account} with Bank name of Swiss `,
                        debit : parseInt(amount),
                        credit: 0,
                        balance: finalBalance,
                        reference: Math.random(),
                        user: req.user.id,
                    };
    
                    //INSTANCIATING THE PASSBOOK MODEL
                  const newPassbook = new Passbook(ledger);
                    //CREATING A NEW RECORD FOR PASSBOOK
                    newPassbook.save().then(ledgerPassbook=>{
                        // console.log(ledgerPassbook);    
                        messageDisplay.success = true;             
                     req.flash("success_message", `Your Transfer was successfully `);
                       res.render("admin/transact_success", {messageDisplay: messageDisplay});
    
                    });//new Passbook record created
    
    
                }else{
                    messageDisplay.insufficientFund = true;
                    req.flash("error_message", `Error!!..Insufficient Fund !!!`);             
                    res.render("admin/transact_success", {messageDisplay: messageDisplay});
                }//CHECK FINAL BALANCE GREATER THAN ZERO
    
    
             });//Initial passbook wrapper
    
    
        }else{   
            //Incorrect Pin Display    
            messageDisplay.incorrectPin = true;
            req.flash("error_message", `Error!!..Incorrect Pin.. Try Again!!!`); 
            res.render("admin/transact_success", {messageDisplay: messageDisplay});
    
        }// INCORRECT PIN
        
        


  


});




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





//make a request to forigen bank
router.get("/transfer/foreign_bank", (req, res)=>{
    res.render("admin/foreign_bank");
});

//post request to foreign bank
router.post("/transfer/foreign_bank", (req, res)=>{

    let errors = [];
        //VALIDATING REQUEST

    if(!req.body.name) {

        errors.push({message: 'please add a Receiver Name'});

    }
   
    if(!req.body.bank) {
        errors.push({message: 'Please add a Bank Name'});
    }

    if(!req.body.account && req.body.account.length > 3 ) {

        errors.push({message: 'please add an Account Number'});

    }

   
    if(!req.body.amount) {

       errors.push({message: 'please add an Amount Number'});

   }

   if(!req.body.pincode) {

    errors.push({message: 'please add an Amount Number'});

}
 
  
if(errors.length > 0){

   res.render('admin/foreign_bank', {

       errors: errors,
       name: req.body.name,
       account: req.body.account,
       amount: req.body.amount,
       pincode:req.body.pincode,
       bank: req.body.bank

   });


}else{


    let depositSlip = {
        depositor: req.user.id,
        reciever: req.body.name,
        account: req.body.account,
        amount: req.body.amount,
        reference: Math.random(0, 4),
        date: Date.now(),
        pin: req.body.pincode,
        bank: req.body.bank,
    }

    res.render("admin/foreign_confirm_transfer", {depositSlip: depositSlip} );



}



   
});

//AJAX REQUEST
router.post("/transfer/foreign_bank/account_search", (req, res)=>{

    const accountNumber = req.body.account;
        
    let getUserAccount = async function(accountNumber){

            let userAccount = await User.findOne({account: accountNumber});

                    console.log(userAccount) ; 
                }
    
    console.log("this is the first",accountNumber)
    getUserAccount(accountNumber);
    console.log("this is the last",accountNumber)

    res.send( )

    // res.render("/transfer/foreign_bank/", accountNumber)






    // console.log(req.body.account)
});


//transfer to foreign bank
router.post("/transfer/foreign_bank/foreign_transact_success", (req, res)=>{

    let name = req.body.name;
    let account = req.body.account;
    let bank = req.body.bank;
    let amount = req.body.amount;
    let pincode = req.body.pincode;


     //CREATE AN Display MESSAGE For Success or Fail
     let messageDisplay = {
        insufficientFund: false,
        incorrectPin: false,
        success: false,
        receiverAccount: false,
        
    }

        //COMPARE USER PIN TO CURRENT PIN
        if(pincode === req.user.pin){
            //Find receiver account number exist
              
           // LAST ENTRY PASSBOOK FOR USER
            Passbook.find({user: req.user.id})
            .sort({_id: -1})
            .limit(1)
            .then(lastPassbook=>{
                //Retrieve Last Ledger Balance
                let balance = lastPassbook[0].balance;
                let finalBalance = balance - parseInt(amount);
    
                // console.log("here is the last passbook --", lastPassbook );
    
                if(finalBalance >= 0){
    
                    //Create a new Record for Passbook
                    let ledger = {
                        remark: `Debit initiated to Account Number ${account} with ${bank} `,
                        debit : parseInt(amount),
                        credit: 0,
                        balance: finalBalance,
                        reference: Math.random(),
                        user: req.user.id,
                    };
    
                    //INSTANCIATING THE PASSBOOK MODEL
                  const newPassbook = new Passbook(ledger);
                    //CREATING A NEW RECORD FOR PASSBOOK
                    newPassbook.save().then(ledgerPassbook=>{
                        // console.log(ledgerPassbook);    
                        messageDisplay.success = true;             
                     req.flash("success_message", `Your Transfer was successfully `);
                       res.render("admin/transact_success", {messageDisplay: messageDisplay});
    
                    }).catch(err=>{
                        console.log("User save ", err);
                    });//new Passbook record created
    
    
                }else{
                    messageDisplay.insufficientFund = true;
                    req.flash("error_message", `Error!!..Insufficient Fund !!!`);             
                    res.render("admin/transact_success", {messageDisplay: messageDisplay});
                }//CHECK FINAL BALANCE GREATER THAN ZERO
    
    
             }).catch(err=>{
                 console.log(err);
             })//Initial passbook wrapper
    
    
        }else{   
            //Incorrect Pin Display    
            messageDisplay.incorrectPin = true;
            req.flash("error_message", `Error!!..Incorrect Pin.. Try Again!!!`); 
            res.render("admin/transact_success", {messageDisplay: messageDisplay});
    
        }// INCORRECT PIN
        
    
    





});























/////////////////////////////////////////////////////////////////
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

//Register from admin side
router.post("/manage/create", (req, res)=>{

    let filename = "dummy.png";

    if(!isEmpty(req.files)){

        let file = req.files.meansOfVeri;
        // let upload_file = req.files.file1;
    
        filename = Date.now() + '-' + file.name;
        file.mv('./public/uploads/' + filename, (err)=>{

            if(err) throw err;

        });

 
    }

       //CREATE AN ERROR MESSAGE
    let errors = [];


    if(!req.body.firstName) {

        errors.push({message: 'please add a First Name'});

    }

    if(!req.body.deposit) {

        errors.push({message: 'please add initial Deposit'});

    }


    if(!req.body.lastName) {

        errors.push({message: 'please add a Last Name'});

    }

    if(!req.body.email) {

        errors.push({message: 'please add an Email'});

    }

    if(!req.body.pincode) {

        errors.push({message: 'please enter a Pin Code'});

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

        res.render('admin/create_client', {  
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            pincode: req.body.pincode,
            deposit: req.body.deposit,

        });

} else {
        
    let accountNo = Math.random(0, 6);

    User.findOne({email: req.body.email}).then(userFound=>{

        if(!userFound){
             //INSTANCIATING THE MODEL CLASS
            const newUser = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password,
                account: accountNo,
                file: filename,
                pin: req.body.pincode,
                accountType: req.body.accountType, 
                      
                });

    //SAVING THE MODEL INSTANCE
    newUser.save().then(user=>{

    //CREATING A LEDGER OBJECT
        let ledger = {
            remark: "Opening Balance",
            debit : 0,
            credit: req.body.deposit,
            balance: req.body.deposit,
            reference: Math.random(),
            user: user.id,
        };
        //INSTANCIATING A PASSBOOK CLASS
        const passbook = new Passbook(ledger);
            //SAVING THAT  PASSBOOKINSTANCE TO MONGOOSE
            passbook.save().then(passbook=>{
                //REDIRECT PAGE TO LOGIN VIEW
                req.flash('success_message', 'That User have been created');
                res.redirect("./create");

            }).catch(err=>{
                console.log(err);
            });



        });

   
     }else {

                    req.flash('error_message', 'That email exist please login');
                    res.redirect('http://localhost:9999/admin/manage/create');


            }


     }); //User model

   



    }
    
   


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
            user.pin = req.body.pincode
            user.account = req.body.account

            // console.log("New User upda>te >", user)
            user.save().then(updatedUser=>{
                req.flash('success_message', 'User updated Successfully');
                res.redirect("http://localhost:9999/admin/manage");

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