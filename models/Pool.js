const mongoose = require('mongoose');
const Schema  = mongoose.Schema;


const PoolSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref:'users'
 
    },

    investment:{
        type: String,
        required: true

    },


    interest:{
        type: String,
        required: true

    },

    investmentInterest: {
         type: String,
        required: true

    },

    withdrawal: {
        type: String,
        required: true
    },

    total: {
        type: String,
     
    }, 
    
    balance: {
        type: String,
        
    },

    package: {
        type: String,
        required: true
    },

    snapshot: {
        type: String,
    },

    date: {
        type: Date,
        default: Date.now()
    },
    
    status: {
        type: String,
        default: "unapproved"
    }



});



// UserSchema.methods.testMethod = function(){

//     console.log("from schema method")


// };



module.exports = mongoose.model('pool', UserSchema);
