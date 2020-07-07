const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//MAKE AN INSTANCE OF A CLASS MODEL

const BankSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
});



//EXPORT THE MODEL CLASS
module.exports = mongoose.model('banks', BankSchema);