const mongoose = require("mongoose");
const URLSlugs = require("mongoose-url-slugs");
const Schema = mongoose.Schema;


const PostSchema = new Schema({

    user: {

        type: Schema.Types.ObjectId,
        ref:'users'
 
    },
 

     category: {
 
         type: Schema.Types.ObjectId,
         ref: 'categories'
 
     },
    
    title: {
        type: String,
        required: true
    },


    status: {
        type: String,
        default: "public"
    },



    allowComment: {
        type: Boolean,
        required: true
    },
    tags:{

        type: String,


    },

    uploadFile:{

        type: String,


    },

    file:{

        type: String,


    },
    
    slug:{

        type: String,


    },

    date: {

        type: Date,
        default: Date.now()

    },


    body: {
        type: String,
        required: true
    },

    comments: [{

        type: Schema.Types.ObjectId,
        ref: 'comments'


    }]



}, {usePushEach: true});

PostSchema.plugin(URLSlugs("title", {field: "slug"}));


module.exports = mongoose.model("posts", PostSchema);
