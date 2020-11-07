const mongoose = require('mongoose');
const Schema  = mongoose.Schema;

//MAKING AN INSTANCE OF A CLASS MODEL
const UsdWalletSchema = new Schema({


    user: {
        type: Schema.Types.ObjectId,
        ref:'users'
 
    },

    remark:{

        type: String,
        required: true

    },

    debit:{

        type: Number,
        required: true

    },

    credit:{

        type: Number,
        required: true

    },

    balance: {
        type: Number,
        required: true
    },

    reference: {
        type: Number,
        required: true
    },

    date: {
        type: Date,
        default: Date.now(),
    },


});



// PassbookSchema.methods.testMethod = function(){

//     console.log("from schema method")


// };



module.exports = mongoose.model('usd-wallet', UsdWalletSchema);
