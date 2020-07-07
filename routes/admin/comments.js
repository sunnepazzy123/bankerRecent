const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Comment = require('../../models/Comments');
// const {userAuthenticated} = require('../../helpers/authentication');

// userAuthenticated,
router.all('/*', (req, res, next)=>{


    req.app.locals.layout = 'admin';
    next();


});





router.get('/', (req, res)=>{

    Comment.find({user: "5e764c2d5611c12cecd891fc"}).populate('user')

        .then(comments=>{

        res.render('admin/comments', {comments: comments});

    });


});



router.post('/', (req, res)=>{   

    Post.findOne({_id: req.body.id}).then(post=>{

        // console.log(post)
        const newComment = new Comment({

            user: req.user.id,
            // user: "5e771107fafed51ab4ba09be",
            body: req.body.body

        });



        post.comments.push(newComment);

        post.save().then(savedPost=>{

            newComment.save().then(savedComment=>{

        req.flash("success_message", `Your Comment will be reviewed in a moment `);
        // toastr.success(`Comment with id  was updated`);


                res.redirect(`/blog_post/${post.id}`);


            })



        });


    });



});



router.delete('/:id', (req, res)=>{


    Comment.deleteOne({_id: req.params.id}).then(deleteItem=>{

        Post.findOneAndUpdate({comments: req.params.id}, {$pull: {comments: req.params.id}}, (err, data)=>{

           if(err) console.log(err);

           req.flash('delete_message', `Comment ( ${deleteItem} ) was successfully deleted`);


            res.redirect('/admin/comments');

              });

        });

});



router.post('/approve-comment', (req, res)=>{


    // console.log(req.body.id)

    Comment.findByIdAndUpdate(req.body.id, {$set: {approveComment: req.body.approveComment}}, (err, result)=>{


        if(err) return err;




        res.send(result)


    });



});













module.exports = router;