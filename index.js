const express =  require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport'); 
const LocalStrategy = require('passport-local'); 
const User = require('./models/user'); 


const campgroundsRoutes = require('./routes/campground');
const reviewsRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');


mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser : true,
    useUnifiedTopology:true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console,"connection Error"))
db.once('open',()=>{
    console.log("Database connceted");
})

const app = express();

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.engine('ejs',ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));


const sessionConfig = {
    secret : "This is the False Secret",
    resave : false,
    saveUninitialized : true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());


//authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser()) 
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/campgrounds',campgroundsRoutes);
app.use('/campgrounds/:id/reviews',reviewsRoutes)
app.use('/',userRoutes);



app.get('/',(req,res)=>{
    res.render('home');
})


app.get('/fakeUser' , async(req,res)=>{
    const user = new User({email : 'abcdefff@gmail.com',username :'Bishuuuu'})
    const newUser = await User.register(user,'chicken')
    res.send(newUser);
})


app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404));
})

//Basic custom Error Handler Added.
app.use((err,req,res,next)=>{
    const {statusCode = 500 } = err;
    if(!err.message) err.message = 'Something Went Wrong';
    res.status(statusCode).render('error', { err } );
})

app.listen(3000,()=>{
    console.log('App Started');
})