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


    startDate:{
        type: Date,
        default: Date.now()

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



module.exports = mongoose.model('package', PackageSchema);
