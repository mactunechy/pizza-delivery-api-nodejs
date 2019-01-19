/*
* Server Related tasks
*
*/

//Dependencies section
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var helpers = require('./helpers');
var https = require('https');
//handlers list
var generalHandlers = require('./handlers/general');
var usersHandlers = require('./handlers/users');
var tokensHandlers = require('./handlers/tokens');
var mealsHandlers = require('./handlers/meals');
var cartsHandlers = require('./handlers/carts');
var ordersHandlers = require('./handlers/orders');
var checkoutHandlers = require('./handlers/checkout');
var guiHandlers = require('./handlers/gui');

var path = require('path');
var config = require('./config');
var fs = require('fs');
var matcher = require('./matcher.js');
var util = require('util');
var debug = util.debuglog('server');

//Container of the module
var server = {};


server.httpServer = http.createServer((req,res)=>{
 server.unifiedServer(req,res);

});

server.httpsServer = https.createServer(server.httpsServerOptions,(req,res)=>{
	server.unifiedServer(req,res);
});

server.httpsServerOptions = {
	'key': fs.readFileSync('./https/key.pem'),
	'cert':fs.readFileSync('./https/cert.pem')
}

server.unifiedServer = (req,res)=>{
	  
		
	//parsing the url from the request, true argument adds the queryString module to the url.parse method
	var parsedUrl = url.parse(req.url,true);
	
	//getting the path fron the parsedUrl object
	var path = parsedUrl.pathname;
	
	//trimming off the slashes fro from the path
	var trimmedPath = path.replace(/^\/+|\/+$/g,'');
	
	//getting the queryStringObject from the parsed url
	var queryStringObject = parsedUrl.query;
	
	//getting the HTTP method
	var method = req.method.toLowerCase();
	
	//getting the headers from the request method
	var headers = req.headers;
	
	//getting the payload object if any
	var decoder = new StringDecoder('utf-8');
	var buffer = '';
	req.on('data',data=>{
	 buffer+= decoder.write(data);
	 
	 });
	
	req.on('end',()=>{
		buffer+=decoder.end();
		debug(buffer);
		//data to be sent to the route handler	s
		data = {
			'trimmedPath':trimmedPath	,
			'method':method,
			'queryStringObject':queryStringObject,
			'payload':helpers.parseJson(buffer),
			'headers':headers		
		}
		//Chosing a handler according to the trimmed path
		var chosenHandler = typeof(server.router[trimmedPath])!== 'undefined'?server.router[trimmedPath] : generalHandlers.notFound;
		if(trimmedPath.indexOf('public/')>-1){
			chosenHandler = guiHandlers.public;
		}
		
		
		chosenHandler(data,function(statusCode,payload,contentType){
			//get statusCode from arguement of default to 200
			statusCode = typeof(statusCode)=='number'? statusCode:200;
			contentType = typeof(contentType)!=='undefined'?contentType : 'json';
			
			if(contentType=='html'){
				res.setHeader('Content-Type','text/html');
			  res.writeHead(statusCode);
				var payloadString = typeof(payload) == 'string' && payload.trim().length > 0 ? payload : '';
				res.end(payloadString);
				
			}
			if(contentType=='css'){
				res.setHeader('Content-Type','text/css');
			  res.writeHead(statusCode);
				var payloadString = typeof(payload) == 'string' && payload.trim().length > 0 ? payload : '';
				res.end(payloadString);
				
			}
			if(contentType=='json'){
				var payload = typeof(payload)=='object'?payload:{};
				var payloadString = JSON.stringify(payload);
				res.setHeader('Content-Type','application/json');
			  res.writeHead(statusCode);
				res.end(payloadString);
				
			}
			
			if(contentType=='javascript'){
				res.setHeader('Content-Type','text/javascript');
			  res.writeHead(statusCode);
			  var payloadString = typeof(payload) == 'string' && payload.trim().length > 0 ? payload : '';
			  res.end(payloadString);
				
			}
			if(contentType=='jpg'){
				res.setHeader('Content-Type','image/jpeg');
			  res.writeHead(statusCode);
				var payloadString = typeof(payload) == 'string' && payload.trim().length > 0 ? payload : '';
			  res.end(payloadString);
				
			}
			if(contentType=='favicon'){
				res.setHeader('Content-Type','image/x-icon');
			  res.writeHead(statusCode);
				var payloadString = typeof(payload) == 'string' && payload.trim().length > 0 ? payload : '';
			  res.end(payloadString);
				
			}
			if(contentType=='png'){
				res.setHeader('Content-Type','image/png');
			  res.writeHead(statusCode);
			  var payloadString = typeof(payload) == 'string' && payload.trim().length > 0 ? payload : '';
			  res.end(payloadString);
				
			}
			
			
			
			if(statusCode==200){
				debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' '+trimmedPath+' '+statusCode);
			}else{
				debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' '+trimmedPath+' '+statusCode,payload);
			};
			
			
		
		});
	});	
};





server.router = {
	'':guiHandlers.home,
	'account/create':guiHandlers.account.create,
	'account/settings':guiHandlers.account.settings,
	'account/login':guiHandlers.session.create,
	'account/logout':guiHandlers.session.delete,
	'account/delete':guiHandlers.account.delete,
	'account/deleted':guiHandlers.account.deleted,
	'meals/list':guiHandlers.meals.list,
	'meals/add':guiHandlers.meals.add,
	'orders/detail':guiHandlers.orders.detail,
	'orders/checkout':guiHandlers.orders.checkout,
	'orders/thank-you':guiHandlers.orders.thankYou,
	'public/':guiHandlers.public,
	'favicon':guiHandlers.favicon,
	'ping':generalHandlers.ping,
	'api/users':usersHandlers.users,
	'api/tokens':tokensHandlers.tokens,
	'api/meals':mealsHandlers.meals,
	'api/carts':cartsHandlers.carts,
	'api/orders':ordersHandlers.orders,
	'api/checkout':checkoutHandlers.checkout
}

	




//server initialisation funtion
server.init = ()=>{
//Creating matcher object if the is on one 
matcher.init()

//starting thte server
server.httpServer.listen(config.httpPort,()=>{
	console.log('\x1b[35m%s\x1b[0m',`httpServer running on port ${config.httpPort} in ${config.envName}`);
});
server.httpsServer.listen(config.httpsPort,()=>{
	console.log('\x1b[36m%s\x1b[0m',` httpsServer running on port ${config.httpsPort} in ${config.envName}`);
})

};



//Exportation of the module
module.exports = server;