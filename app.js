const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

mongoose.connect(config.database);

let db = mongoose.connection;

// Check for connection
db.once('open', function(){
  console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', function(){
  console.log(err);
});

// Init app
const app = express();

// Bring in Models
let Article = require('./models/articles');

// Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body parser middleware
// parse applicatio/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
//parse application/json
app.use(bodyParser.json())

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express messages middleware
app.use(require('connect-flash')());
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msp, value){
    var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;
    
    while(namespace.length){
      fornParam += '[' + namespace.shift() + ']';
    }
    return{
      param : formParam,
      msg : msp,
      value : value
    };
  }
}));

// Passport Config
require('./config/passport')(passport);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

// Home route
app.get('/', function(req, res){
  Article.find({}, function(err, articles){
    if(err){
       console.log(err);
    } else {
      res.render('index', {
        title: 'Articles',
        articles: articles
      });
    }
  });
});

// Route files
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

// Start server
app.listen(80, function(){
  console.log('server started on port 80...');
});