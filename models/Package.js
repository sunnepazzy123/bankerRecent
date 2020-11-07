const mongoose = require('mongoose');
const Schema  = mongoose.Schema;


const PackageSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref:'users'
 
    },

    packagePlan:{
        type: String,
        required: true

    },

    amount: {
        type: Number,
        required: true

    },

    interest: {
        type: Number,
        required: true
    },

    income: {
        type: Number,
        required: true
    },

    finalBalance: {
        type: Number,
        required: true
    },


    startDate:{
        type: Date,
        default: Date.now()

    },

    endDate: {
        type: Date,
    },
    
    duration: {
        type: String,
        default: "inmatured"
    },

    status: {
        type: String,

    }

    





});



// UserSchema.methods.testMethod = function(){

//     console.log("from schema method")


// };



module.exports = mongoose.model('package', PackageSchema);
