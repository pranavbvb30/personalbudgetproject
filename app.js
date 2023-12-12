//require modules
const express = require('express');
const morgan = require('morgan');
const ejs = require('ejs');
const methodOverride = require('method-override');
const tradeRoutes = require('./routes/traderoutes');

const userRoutes = require('./routes/userRoutes');

const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

const mongoose = require('mongoose');

//create app
const app = express();

//configure app
let port = 3001;
let host = '104.236.70.90';
app.set('view engine','ejs');



//mount middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended : true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method')); 


//setup routes
// app.get('/',(req,res)=>{
//     res.render('index');
// })


mongoose.connect('mongodb+srv://doadmin:5j1864x9d3toDPH0@db-mongodb-nyc3-33284-a4283b62.mongo.ondigitalocean.com/admin?tls=true&authSource=admin',{useUnifiedTopology: true,useNewUrlParser: true,useCreateIndex: true})
.then(()=>{
    //start the server
    app.listen(port, host, ()=>{
        console.log('Server is running on port', port);
    })
})
.catch(err=>console.log(err));



//mount middlware
app.use(
    session({
        secret: "ajfeirf90aeu9eroejfoefj",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: 'mongodb+srv://doadmin:5j1864x9d3toDPH0@db-mongodb-nyc3-33284-a4283b62.mongo.ondigitalocean.com/admin?tls=true&authSource=admin'}),
        cookie: {maxAge: 1*60*1000}
        })
);
app.use(flash());
app.use((req, res, next) => {
    //console.log(req.session);
    res.locals.user = req.session.user || null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});


app.get('/',(req,res)=>{
    res.render('index');
})
app.use('/trades',tradeRoutes);
app.use('/users', userRoutes);

app.use((req,res,next)=>{
    let err = new Error('The server cannot locate '+req.url);
    err.status = 404;
    next(err);
})

app.use((err,req,res,next)=>{
    if(!err.status ){
        err.status = 500;
        // err.message = ("Internal Server Error");
    }
    res.status(err.status);
    res.render('error',{error:err});
})

//start the server  
// app.listen(port,host,()=>{
//     console.log('server is running on port no',port);
// })
