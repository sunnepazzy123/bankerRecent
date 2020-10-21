const mongoose = require('mongoose');
const Schema  = mongoose.Schema;


const UserSchema = new Schema({


    firstName:{

        type: String,
        required: true

    },


    lastName:{

        type: String,
        required: true

    },


    email:{

        type: String,
        required: true

    },

    password:{

        type: String,
        required: true

    },

    status: {
        type: String,
        default: "user"

    }, 

    date: {
        type: Date,
        default: Date.now()
    },





});



// UserSchema.methods.testMethod = function(){

//     console.log("from schema method")


// };



module.exports = mongoose.model('users', UserSchema);
