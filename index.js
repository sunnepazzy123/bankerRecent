const express = require("express");
const app = express();
const path = require("path")
const exphbs = require("express-handlebars");
const Handlebars = require("handlebars");
const {allowInsecurePrototypeAccess} = require("@handlebars/allow-prototype-access");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const fileUpload = require("express-fileupload");
const methodOverride = require("method-override");
const passport = require("passport");
const cron = require('node-cron');
const Package = require("./models/Package");
// const {mongoDbUrl} = require("./config/database");
// require("dotenv").config();

// 


//DATABASE CONNECTION
const mongoDbUrl = "mongodb://localhost:27017/cryptobank" ;

    // const  mongoDbUrl = process.env.MONGO_DB_URI
    
// const mongoDbUri = "mongodb+srv://sunnepazzy_20:sunnepazzy_20@cluster0.xgyxi.mongodb.net/cryptonew?retryWrites=true&w=majority"


// const mongoDbUrl = "mongodb://bankapp123:bankapp123@cluster0-shard-00-00-ul9hr.mongodb.net:27017,cluster0-shard-00-01-ul9hr.mongodb.net:27017,cluster0-shard-00-02-ul9hr.mongodb.net:27017/<dbname>?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority"

mongoose.connect(mongoDbUrl, {useUnifiedTopology: true, useNewUrlParser: true } )
        .then(db=>{
            console.log("Mongo Connected");
        }).catch(error => console.log(error));
 


app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/admin")));



const {select, generateDate, smartText, paginate, html_text, detectAdmin , currencyFormat, detectAdminHome} = require('./helpers/handlebars-helpers');


// //SET TEMPLATE ENGINE
app.engine("handlebars", exphbs({defaultLayout: "home", handlebars: allowInsecurePrototypeAccess(Handlebars), helpers: {select: select, smartText: smartText, detectAdmin: detectAdmin, html_text: html_text, currencyFormat: currencyFormat, detectAdminHome:detectAdminHome,  generateDate: generateDate, paginate: paginate}} ));
app.set("view engine", "handlebars");

//BODY PARSER
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.use(methodOverride('_method'));
app.use(fileUpload());

//SESSION SETUPS
app.use(session({
    secret: "wiredevteam@wdt.com",
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));
//SESSION FLASH SETUPS 
app.use(flash());

// //PASSPORT 
app.use(passport.initialize());
app.use(passport.session());


// //LOCAL VARIABLES USING MIDDLEWARES
app.use((req,res,next)=>{


res.locals.user = req.user || null;
res.locals.error = req.flash('error');
res.locals.error_message = req.flash('error_message');
res.locals.success_message = req.flash("success_message");
res.locals.delete_message = req.flash("delete_message");

    next();



});

//LOAD ROUTE
const home = require("./routes/home/main");
const admin = require("./routes/admin/index");
// const payment = require("./routes/admin/payment");


//Task scheduler CronJob

//  cron.schedule('*/10 * * * * *', async ()=>{
//    console.log('Automated Task running every 10seconds');
//     const pkg = await Package.find({});

//     console.log(pkg)

//  });





//USE ROUTE
app.use("/", home);
app.use("/admin", admin);
// app.use("/admin/payment", payment);




//setting of environment port
const PORT = process.env.PORT || 9999

app.listen(PORT, ()=>{
    console.log(`listening to port ${PORT}`);
});