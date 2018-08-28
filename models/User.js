




const mysql = require('mysql');
const express = require('express');
const foo = express();
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'Students'
});




const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done){
    done(null, user.id)
});

passport.deserializeUser(function(id, done){
    connection.query("SELECT * FROM logins WHERE id = " +id, function(err, rows){
        done(err, rows[0]);
    });
});





// app.get('/register', function(req, res){
//     res.render('register');
// })

// app.post('/', function(req, res){
//     console.log(res);
// })

module.exports = foo;
module.exports = passport;
