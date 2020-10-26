const mongoose = require('mongoose');
const Schema  = mongoose.Schema;

//MAKING AN INSTANCE OF A CLASS MODEL
const TransactionSchema = new Schema({


    user: {
        type: Schema.Types.ObjectId,
        ref:'users'
 
    },

    description:{

        type: String,
        required: true

    },

    capital:{

        type: Number,
        required: true

    },

    interest:{

        type: Number,
        required: true
    },

    
    cummInterest:{

        type: Number,
        required: true
    },
      
    interestWithdraw:{

        type: Number,
        required: true
    },
    capitalWithdraw:{

        type: Number,
        required: true
    },
    total:{

        type: Number,
        required: true
    },
    balance:{

        type: Number,
        required: true
    },

    status: {
        type: String,
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



module.exports = mongoose.model('transaction', TransactionSchema);
