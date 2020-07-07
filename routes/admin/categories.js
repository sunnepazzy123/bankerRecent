const express = require('express');
const router = express.Router();
const Category = require('../../models/Category');
// const {userAuthenticated} = require('../../helpers/authentication');

// 
router.all('/*', (req, res, next)=>{


    req.app.locals.layout = 'admin';
    next();


});



router.get('/', (req, res)=>{

    Category.find({}).then(categories=>{

        res.render('admin/categories/', {categories: categories});

    });





});


router.post('/create', (req, res)=>{

    const newCategory = new Category({

        name: req.body.name

    });


    newCategory.save(savedCategory=>{

        req.flash("success_message", `Category ${savedCategory} was created successfully `);
        res.redirect('/admin/categories/');

    })
    // .catch(error=>{
    //     // res.render("admin/categories", error)
    //     console.log(error, "could not save post");
    // });

});








router.get('/edit/:id', (req, res)=>{

    Category.findOne({_id: req.params.id}).then(category=>{


        res.render('admin/categories/edit', {category: category});

    });



});

router.put('/edit/:id', (req, res)=>{

    Category.findOne({_id: req.params.id}).then(category=>{

        const categoryClone = category.name

        category.name = req.body.name;

        category.save().then(savedCategory=>{

        req.flash("success_message", `Category ( ${categoryClone} ) was finally edited to Category ( ${savedCategory.name} ) successfully `);


            res.redirect('/admin/categories');

        });



    });



});



router.delete('/:id', (req, res)=>{

   Category.deleteOne({_id: req.params.id}).then(result=>{


    req.flash("success_message", `Category ( ${result} ) was finally deleted successfully `);


       res.redirect('/admin/categories');



   });





});






module.exports = router;