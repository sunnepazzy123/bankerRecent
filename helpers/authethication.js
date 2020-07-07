const User = require("../models/User");

module.exports = {



    userAuthenticated: function(req, res, next){


        if(req.isAuthenticated()){


            return next();

        }

        res.redirect('/login');


    },



    userAwaitAcc: async function (account){

        const userAcc = await User.findOne({account: account});
                if(!userAcc){
                    // console.log("not found");
                    return false;
                }else{
                // console.log(userAcc) ;
                // return userAcc;
                return true;

                }

    }





};