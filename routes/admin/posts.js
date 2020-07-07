const express = require("express");
const router  = express.Router();
const Post = require("../../models/Post");
const Category = require("../../models/Category");
const { isEmpty, uploadDir} = require("../../helpers/upload-helpers");
const fs = require("fs");
const Comment = require('../../models/Comments');
// const {userAuthenticated} = require('../../helpers/authentication');




router.all("/*", (req, res, next)=>{

    req.app.locals.layout = "admin";
    next();


});


router.get("/", (req, res)=>{

    // Post.findOne({_id: req.params.id})
    // .populate({path: "comments", populate: {path: "user", model: "users"}})
    // .populate("user")

    Post.find({})
    .populate("category")
    .then(posts=>{

    res.render('admin/posts', {posts: posts});

    })
    .catch(error=>{
        console.log(error);
    })
    // res.send("hello")





});

router.get("/create", (req, res)=>{


    Category.find({}).then(categories=>{

        res.render('admin/posts/create', {categories: categories});

    });





 
    // res.send("hello")
});


router.post('/create', (req, res)=>{

    let errors = [];


    if(!req.body.title) {

        errors.push({message: 'please add a titles'});

    }


    if(!req.body.tag) {

        errors.push({message: 'please enter a tag'});

    }

    if(!req.body.title) {

        errors.push({message: 'please add a titles'});

    }


    if(errors.length > 0){

        res.render('admin/posts/create', {

            errors: errors

        })

    } else {


     let filename = 'BMW-Z4.jpg';
    //  let upload_filename = 'BMW-Z5.zip';

    // console.log(req.files.file1.name);



     if(!isEmpty(req.files)){

        let file = req.files.file;
        // let upload_file = req.files.file1;

        filename = Date.now() + '-' + file.name;

        // upload_filename = Date.now() + '-' + upload_file.name;


        file.mv('./public/uploads/' + filename, (err)=>{

            if(err) throw err;

        });

        // file.mv('./public/uploads/' + upload_filename, (err)=>{

        //     if(err) throw err;

        // });



    }




    let allowComments = true;

    if(req.body.allowComments){

        allowComments = true;

    } else{

        allowComments = false;

    }


    const newPost = new Post({


        user: req.user.id,
        title: req.body.title,
        status: req.body.status,
        allowComment: allowComments,
        body: req.body.body,
        tags: req.body.tag,
        category: req.body.category,
        file: filename
        // uploadFile: upload_filename

    });

    // console.log(req.body.category)


    newPost.save().then(savedPost =>{

        req.flash("success_message", `Post ( ${savedPost.title} ) was created successfully `);

        res.redirect('/admin/posts');


    }).catch(validator=>{
        res.render("admin/posts/create", {errors: validator.errors})
        // console.log(error, "could not save post");
    })









    }


    // console.log(req.files.file1.name);


});

router.get('/my-posts', (req, res)=>{


    Post.find({user: req.user.id})
        .populate('category')
        .then(posts=>{

            res.render('admin/posts/my-posts', {posts: posts});
        });



});



router.get("/edit/:id", (req, res)=>{

    Post.findOne({_id: req.params.id})
    .then(post=>{

        Category.find({}).then(categories=>{

            res.render('admin/posts/edit', {post: post, categories: categories});

        });


});

   
});


// POST UPDATING



router.put('/edit/:id', (req, res)=>{

    Post.findOne({_id: req.params.id})

        .then(post=>{
            if(req.body.allowComments){
                allowComments = true;
            } else{
                allowComments = false;
            }

            post.user = req.user.id;
            post.title = req.body.title;
            post.status = req.body.status[1];
            post.allowComment = allowComments;
            post.body = req.body.body;
            post.category = req.body.category;




            if(!isEmpty(req.files)){

                let file = req.files.file;
                filename = Date.now() + '-' + file.name;
                post.file = filename;

                file.mv('./public/uploads/' + filename, (err)=>{

                    if(err) throw err;

                });

            }


            post.save().then(updatedPost=>{



                // req.flash('success_message', 'Post was successfully updated');

                 req.flash("success_message", `Post was edited successfully `);




                res.redirect('/admin/posts');
            });

        });


});


router.delete('/:id', (req, res)=>{

    // console.log(req.params.id)

    Post.findOne({_id: req.params.id})
        .populate('comments')
        .then(post =>{

            fs.unlink(uploadDir + post.file, (err)=>{


                if(!post.comments.length < 1){

                      post.comments.forEach(comment=>{

                      comment.remove();

                   });

                }

                post.remove().then(postRemoved=>{



                    req.flash('delete_message', `Post ( ${postRemoved.title} ) was successfully deleted`);
                    res.redirect('/admin/posts/');


                });


            });

     });
});







module.exports = router;