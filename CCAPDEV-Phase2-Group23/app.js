//Install Command:
//npm init
//npm i express express-handlebars body-parser mongodb

const express = require('express');
const server = express();

const bodyParser = require('body-parser');
server.use(express.json()); 
server.use(express.urlencoded({ extended: true }));

const handlebars = require('express-handlebars');
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
    extname: 'hbs',
}));

server.use(express.static('public'));

// ===================================================================================

// require mongodb
const { MongoClient } = require('mongodb');
const databaseURL = "mongodb://127.0.0.1:27017/";
const mongoClient = new MongoClient(databaseURL); //client instance

const databaseName = "tastetalks"; //like schema 'survey'
const coll1 = "restaurants"; //like tables 'respondents'

//generic functions
function errorFn(err){
    console.log('Error fond. Please trace!');
    console.error(err);
}
function successFn(res){
    console.log('Database query successful!');
} 

// connection to client 
mongoClient.connect().then(function(con){
  console.log("Attempt to create!");
  const dbo = mongoClient.db(databaseName);
  dbo.createCollection("restaurants")
    .then(successFn).catch(errorFn);
  dbo.createCollection("profiles")
    .then(successFn).catch(errorFn);
}).catch(errorFn); 

// ===================================================================================

// when opening site -----------------------------------------------------------------
server.get('/', function(req, resp){
  resp.render('login',{
    layout: 'index',
    title: 'Login to TasteTalks',
    pageStyles: '<link href="/common/login-styles.css" rel="stylesheet" />'
  });
});

// login (to home page) -------------------------------------------------------------
server.post('/submit_login', function(req, resp){
  const name = req.body.username;
  const pass = req.body.password;
  
  const dbo = mongoClient.db(databaseName);
  const colProfile = dbo.collection("profiles");

  const searchQuery = { username: name, password: pass };
  
  colProfile.findOne(searchQuery).then(function(val){

    if(val !== null){
      const colResto = dbo.collection("restaurants");
      
      const cursor = colResto.find();
      cursor.toArray().then(function(vals){
        console.log('List successful');
        resp.render('main',{
          layout: 'index',
          title:  'Home - TasteTalks', 
          pageStyles: '<link rel="stylesheet" href="/common/main-styles.css">',
          'restaurants': vals
        });
      }).catch(errorFn);
    } else {
      resp.render('login',{
        layout: 'index',
        title: 'Login to TasteTalks',
        pageStyles: '<link href="/common/login-styles.css" rel="stylesheet" />'
      });
      console.log('error searching for account');
    }

  }).catch(errorFn);
});

// register -------------------------------------------------------------------------
server.get('/register', function(req, resp){
  resp.render('register',{
    layout: 'index',
    title:  'Register for TasteTalks',
    pageStyles: '<link rel="stylesheet" href="/common/register-styles.css">',
  }); 
});

//home page ------------------------------------------------------------------------
server.get('/view_home', function(req, resp){
  const dbo = mongoClient.db(databaseName);
  const col = dbo.collection("restaurants");
  
  const cursor = col.find();
  cursor.toArray().then(function(vals){
    console.log('List successful');
    resp.render('main',{
      layout: 'index',
      title:  'Home - TasteTalks', 
      pageStyles: '<link rel="stylesheet" href="/common/main-styles.css">',
      'restaurants': vals
    });
  }).catch(errorFn);
});

// individual resto pages ----------------------------------------------------------
server.get('/view_resto', function(req, resp){
  const dbo = mongoClient.db(databaseName);
  const col = dbo.collection("restaurants");

  const restaurantId = req.query.restaurantId;
  const searchQuery = { name: restaurantId };
  
  col.findOne(searchQuery).then(function(vals){
    console.log('List successful'); 

    resp.render('resto',{
      layout: 'index',
      title:  restaurantId+' - TasteTalks',
      pageStyles: '<link rel="stylesheet" href="/common/resto-styles.css">',
      restaurant:  vals
    } );
  }).catch(errorFn);
});

// add review page ------------------------------------------------------------------
server.get('/add_review', function(req, resp){
  const dbo = mongoClient.db(databaseName);
  const col = dbo.collection("restaurants");

  const restaurantId = req.query.restaurantId;
  const searchQuery = { name: restaurantId };
  
  col.findOne(searchQuery).then(function(vals){
    console.log('List successful'); 

    resp.render('review',{
      layout: 'index',
      title:  'Review '+restaurantId+' - TasteTalks',
      pageStyles: '<link rel="stylesheet" href="/common/review-styles.css">',
      restaurant:  vals
    } );
  }).catch(errorFn);
});

// profile page -------------------------------------------------------------------
server.get('/view_profile', function(req, resp){
  const dbo = mongoClient.db(databaseName);
  const col = dbo.collection("profiles");

  //const restaurantId = req.query.restaurantId;
  const searchQuery = { username: 'admin' }; 
  
  col.findOne(searchQuery).then(function(vals){
    console.log('List successful'); 
    resp.render('profile-page',{
      layout: 'index',
      title:  'Profile - TasteTalks',
      pageStyles: '<link rel="stylesheet" href="/common/profile-styles.css">',
      user:  vals
    } );
  }).catch(errorFn);
});

// edit profile page ---------------------------------------------------------------
server.get('/edit_profile', function(req, resp){
  const dbo = mongoClient.db(databaseName);
  const col = dbo.collection("profiles");

  //const restaurantId = req.query.restaurantId;
  const searchQuery = { username: 'admin' }; 
  
  col.findOne(searchQuery).then(function(vals){
    console.log('List successful'); 
    resp.render('edit-profile',{
      layout: 'index',
      title:  'Edit profile - TasteTalks',
      pageStyles: '<link rel="stylesheet" href="/common/edit-profile-styles.css">',
      user:  vals
    } );
  }).catch(errorFn);
});

// change password page ------------------------------------------------------------
server.get('/change_password', function(req, resp){
  const dbo = mongoClient.db(databaseName);
  const col = dbo.collection("profiles");

  //const restaurantId = req.query.restaurantId;
  const searchQuery = { username: 'admin' }; 
  
  col.findOne(searchQuery).then(function(vals){
    console.log('List successful'); 
    resp.render('change-password',{
      layout: 'index',
      title:  'Edit password - TasteTalks',
      pageStyles: '<link rel="stylesheet" href="/common/change-password-styles.css">',
      user:  vals
    } );
  }).catch(errorFn);
});

/*references below =================================================================

server.post('/add-entry', function(req, resp){
  const dbo = mongoClient.db(databaseName);
  const col = dbo.collection(collectionName);

  const info = {
    name: req.body.name,
    age: req.body.age,
    email: req.body.email,
    fav_color: req.body.fav_color,
    active: 'true'
  };
  
  col.insertOne(info).then(function(res){
    resp.render('result',{
      layout: 'index',
      title:  'Result page',
      msg:  'User created successfully'
    });
  }).catch(errorFn);
});
*/

function finalClose(){
    console.log('Close connection at the end!');
    mongoClient.close();
    process.exit();
}

process.on('SIGTERM',finalClose);  //general termination signal
process.on('SIGINT',finalClose);   //catches when ctrl + c is used
process.on('SIGQUIT', finalClose); //catches other termination commands

const port = process.env.PORT | 9090;
server.listen(port, function(){
    console.log('Listening at port '+port);
});

