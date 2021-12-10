var fs = require('fs');
var path = require('path');
var mysql = require('mysql2');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'web2020',
	password : 'web2020',
	database : 'web'
});

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

//app.use(express.static('static'));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

function restrict(req, res, next) {
  if (req.session.loggedin) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.sendFile(path.join(__dirname + '/my/login.html'));
  }
}

app.use('/', function(request, response, next) {
	if ( request.session.loggedin == true || request.url == "/login" || request.url == "/register" ) {
    next();
	}
	else {
    response.sendFile(path.join(__dirname + '/my/login.html'));
	}
});

/*app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/my/opencv/home.html'));
});*/
app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/my/login.html'));
})
app.get('/login', function(request, response) {
	response.sendFile(path.join(__dirname + '/my/login.html'));
});

app.post('/login', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (error) throw error;
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
				response.end();
			} else {
				response.sendFile(path.join(__dirname + '/my/loginerror.html'));
			}			
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/register', function(request, response) {
	response.sendFile(path.join(__dirname + '/my/register.html'));
});

app.post('/register', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	var password2 = request.body.password2;
	var email = request.body.email;

	if (password == password2){
		if (username && password && email) {
			connection.query('SELECT * FROM user WHERE username = ? OR email = ?', [username, email], function(error, results, fields) {
				if (error) throw error;
				
				if (results.length <= 0) {
			connection.query('INSERT INTO user (username, password, email) VALUES(?,?,?)', [username, password, email],
				function (error, data) {
					if (error)
					  console.log(error);
					else
					  console.log(data);
			});
				  response.send(username + ' Registered Successfully!<br><a href="/">Home</a>');
				} 
				
				else {
					response.send('username: '+username+' or email: '+email + ' Already exists!<br><a href="/">Home</a>');
				}			
				response.end();
			});
		} else {
			response.send('Please enter User Information!');
			response.end();
		}
	}
	else{
		response.send(username + ' password Does not match!<br><a href="/">Home</a>');
	}
	
});

app.get('/logout', function(request, response) {
  	request.session.loggedin = false;
	response.sendFile(path.join(__dirname + '/my/login.html'));
});

app.get('/home', restrict, function(request, response) {
	if (request.session.loggedin) {
		app.use(express.static('static'));
		response.sendFile(path.join(__dirname + '/static/index.html'));
		
	} else {
		response.send('Please login to view this page!');
		response.end();
	}
});


app.listen(3000, function () {
    console.log('Server Running at http://127.0.0.1:3000');
});
