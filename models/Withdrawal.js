const mongoose = require('mongoose');
const Schema  = mongoose.Schema;

//MAKING AN INSTANCE OF A CLASS MODEL
const WithdrawalSchema = new Schema({


    user: {
        type: Schema.Types.ObjectId,
        ref:'users'
 
    },

    remark:{

        type: String,

    },

    amount:{

        type: Number,
        required: true

    },

    walletAddress: {
        type: String,
    },

    walletType:{

        type: String,
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



module.exports = mongoose.model('withdrawal', WithdrawalSchema);
