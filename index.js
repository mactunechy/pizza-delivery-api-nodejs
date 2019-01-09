/*
*Entry file for Application initialisation
*
*/

//Dependencies
var server = require('./lib/server');
var {emailIsTaken} = require('./lib/handlers/users');




emailIsTaken('dee@gmail.com',isTaken=>{
	console.log(isTaken);
})

//starting the server
server.init(); 