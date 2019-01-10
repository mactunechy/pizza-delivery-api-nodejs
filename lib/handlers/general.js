/*
* Modules for handling all routes
*
*/


//Dependencies
var util = require('util');
var debug = util.debuglog('general');


//Container of the Module 
var handlers = {};

handlers.notFound = (data,callback)=>{
	callback(404,{'Error':'Page notFound'});
};


handlers.ping = (data,callback)=>{
	callback(200,{'Success':'Site is still Up'});
};






//Exportation of the Module
module.exports = handlers;



