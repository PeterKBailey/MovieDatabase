const express = require("express");
const app = express();
const session = require("express-session");
// const baseURL = "http://localhost:3000";

app.use(session({secret: "Peter Bailey", resave: true, saveUninitialized: true}));

app.set("view engine", "pug");
app.use(express.static('public'));



//set up a locals property for the app, that way all the data is available in every router
app.locals.users = require("./data/users.json");
app.locals.movies = require("./data/movies-data.json");
app.locals.people = require("./data/people-data.json");
app.locals.genres = require("./data/genres.json");

//makes sure the user is authorised to make a change
function authorise(req, res, next){
    if(req.session.isContributing){
        next();
    }
    else{
        //unauthorised - 403 maybe should be used because that's when we know the client's identity
        res.status(401).send();
    }
}

app.use(express.json());
app.use(express.urlencoded({
    extended: true
  }))

//some middleware for remembering the last page, specifically used for logging in and being returned to the prev page
app.use(function(req,res,next){
    // console.log(req.url);
    if(!req.url.includes("/login") && !req.url.includes("favicon.ico") && req.method === "GET" && !req.url.includes("/list/")){
        req.session.prevURL = req.url;
    }
    next();
})

//router for movies
let moviesRouter = require("./routes/movies-router.js");
app.use("/movies", moviesRouter);

//router for people
let peopleRouter = require("./routes/people-router.js");
app.use("/people", peopleRouter);

//router for users
let usersRouter = require("./routes/users-router.js");
app.use("/users", usersRouter);

app.get("/", loadHome);
app.get("/login", loadLogin);
app.post("/login", handleLogin);
app.get("/movieform", loadMovieForm);
app.get("/personform", authorise, loadPersonForm);

function loadHome(req,res){
    res.render("SearchResults.pug",  {requestingUser: req.session, Found: [], genres: req.app.locals.genres, people: Object.keys(req.app.locals.people)})
}

function loadLogin(req, res){
    res.render("login.pug");
}


/*
Purpose:

handles the signing in process, so it will either create a new user and log them in, or just log them in
then it brings the user back to the page they were last on
*/
function handleLogin(req,res){
    let lowerCaseUsername = req.body.username.toLowerCase();
    console.log("username: " + lowerCaseUsername + " password: " + req.body.password);
    let trueUser;
    //if they're trying to sign up and make a new user
    if(req.body.buttonType === "signup"){
        let newUser = {};
        newUser.username = lowerCaseUsername;
        newUser.password = req.body.password;
        newUser = createUser(newUser, app.locals.users);
        //if the newuser wasn't created
        if(!newUser){
            //406 is not acceptable, means the username was taken.
            res.status(406).send()
            return;
        }
        trueUser = newUser;
    }
    //if they're just logging in
    else if(req.body.buttonType === "login"){
        let user = getUser(lowerCaseUsername, app.locals.users);

        //if there was no user with that name, or the password was wrong, not acceptable
        if(!user || user.password !== req.body.password){
            res.status(406).send();
            return;
        }
        trueUser = user;
    }
    //now that we've verified the credentials, we need to log the user in with a session however you do that
    for(property in trueUser){
        req.session[property] = trueUser[property];
    }
    //The user is brought back to whatever page they were on before logging in, or to their user page if they went directly to the log in page
    if(req.session.prevURL){
        // console.log(baseURL + req.session.prevURL)
        res.status(200).send({page: req.session.prevURL});
    }
    else{
        res.status(200).send({page: "/users/"+req.session.username});
    }
}

/*
Inputs:
Request and response object

Output:
A form for contributing users to create a new movie
*/
function loadMovieForm(req,res){
    let people = Object.keys(req.app.locals.people);
    res.render("MovieForm.pug",{requestingUser: req.session, people, genres: req.app.locals.genres} );
}

/*
Inputs:
request and response object

Output:
A form for contributing users to create a new person
*/

function loadPersonForm(req,res){
    let movies = Object.keys(req.app.locals.movies);
    res.render("PersonForm.pug",{requestingUser: req.session, movies});
}


/*
Assume we are provided with an object containing the user's username and password.

Inputs:
newUser - a user object with username and password

Outputs:
The newly created user if succesfully created, null otherwise
*/
function createUser(newUser, users){
    //must be given a username and password
    if(!newUser.username || !newUser.password){
        return null;
    }
    newUser.username = newUser.username.toLowerCase();
    //must not be in the list already
    if(users.hasOwnProperty(newUser.username)){
        return null;
    }

    //fill in the additional info for a new user
    let today = new Date();
    newUser.dateRegistered = `${today.getDate()}/${today.getMonth()}/${today.getFullYear()}`;


    newUser.isContributing = false;
    newUser.followers = [];
    newUser.usersFollowing =[];
    newUser.peopleFollowing =[];
    newUser.reviews = [];
    newUser.notifications = [];
    newUser.favorites = [];
    newUser.recommended = [];
    newUser.profilepic = "https://www.pphfoundation.ca/wp-content/uploads/2018/05/default-avatar.png";
    users[newUser.username] = newUser;
    return users[newUser.username];
}


/*
Inputs:
username - the username of the user being requested
users - the object we want to find the user from

Output:
The user with the given id, if it exists, otherwise null
*/
function getUser(username, users){
    if(users.hasOwnProperty(username)){
        return users[username];
    }
    return null;
}


app.listen(3000);
console.log("listening at port 3000");