
const express = require("express");
const router  = express.Router();
// const {userAuthenticated} = require('../../helpers/authethication');
// const faker = require('faker');
// const Post = require("../../models/Post");
// const Comment = require("../../models/Comments");
// const Category = require("../../models/Category");

router.all("/*", (req, res, next)=>{
    req.app.locals.layout = "admin";
    next()



} );

router.get("/", (req, res)=>{
    res.render("admin/payment/")
});


router.get("/silver", (req, res)=>{
    res.render("admin/payment/silver")

});

router.get("/gold", (req, res)=>{
    res.render("admin/payment/gold")

});


router.get("/platinum", (req, res)=>{
    res.render("admin/payment/platinum")
})








// userAuthenticated,


module.exports = router;