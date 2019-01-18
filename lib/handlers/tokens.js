/*
*All tokens related handlers
*
*/


//Dependencies
var _data = require('../data');
var helpers = require('../helpers');
var util = require('util');
var debug = util.debuglog('tokens');

//Container of the module
var handlers = {};


//Recieves all routes 
handlers.tokens = (data,callback)=>{
	var acceptedMethods = ['post','put','delete','get'];
	if(acceptedMethods.indexOf(data.method)>-1){
		handlers[data.method](data,callback);
	}else{
		callback(400,{'Error':'Method not accepted'})
	}
};

//handles requests with post method
handlers.post = (data,callback)=>{
		//required data
	var email = typeof(data.payload.email)=='string' && data.payload.email.trim().length>0?data.payload.email.trim():false;
	var password = typeof(data.payload.password)=='string' && data.payload.password.trim().length>0?data.payload.password.trim():false;
	//Error if the required data id not provided
if( email && password ){
	//reading the matcher file to get userId
	_data.read('matcher','matcher',(err,matcherData)=>{
		if(!err && matcherData){
			//getting userId
			userId = typeof(matcherData[email])!=='undefined'?matcherData[email]:false;
			if(userId){
				//reading data to check if the passed password matches the one in the FS 
			_data.read('users',userId,(err,userData)=>{
				if(!err && userData){
						var passwordMatched = userData.hashedPassword==helpers.hash(password)?true:false;
						if(passwordMatched){
							//user is Legit and we go ahead and create the token 
							var tokenId = helpers.createRandomString(20);
							var expires = Date.now()+(1000*60*60);
							var tokenData = {
								tokenId,
								userId,
								expires
							}
							//Adding token to disc
							_data.create('tokens',tokenId,tokenData,err=>{
								if(!err){
									//Done - success
									callback(200,tokenData);
								}else{
									callback(500);
									debug("Failed to add new token to disc");
								}
							});
						}else{
							callback(400,{'Error':'password did not match user'});
						}
											
				}else{
					callback(404,{'Error':'User not Found'});
				}
			});

			}else{
				callback(404,{'Error':'User not Found'});
			}
					}else{
			callback(500);
			debug('Failed to open matcher file');
		}
	})
}else{
	callback(400,{'Error':'Missing  required fields'});
};
};


//get method handler
handlers.get = (data,callback)=>{
	var id = typeof(data.queryStringObject.id)=='string' && data.queryStringObject.id.trim().length ==20?data.queryStringObject.id.trim():false;
//validating the id
if(id){
	//lookup token by id
	_data.read('tokens',id,(err,tokenData)=>{
		//continue if the re is data and no Error
		if(!err && tokenData){
			callback(200,tokenData);
		}else{
			callback(404,{'Error':'Token not found'});
		}
	});
	
}else{
	callback(400,{'Error':'Missing required field'});
}
};


//put token subhandler
handlers.put = (data,callback)=>{
	var tokenId = typeof(data.payload.tokenId)=='string' && data.payload.tokenId.trim().length == 20?data.payload.tokenId.trim():false;
	
	//validate id
	if(tokenId){
		//lookup the id
		_data.read('tokens',tokenId,(err,tokenData)=>{
			//continue if no Error and the there is data
			if(!err && tokenData){
				//check if token is still valid - not expired
				if(tokenData.expires>Date.now()){
					var newExpiry = Date.now() + 1000*60*60;
					//extending expiry by and hour
					tokenData.expires = newExpiry;
					//writing updates to disc
					_data.update('tokens',tokenId,tokenData,(err)=>{
						if(!err){
							callback(200,tokenData);
						}else{
							callback(500,{'Error':'Could not update token'});
						}
					});
					
				}else{
					callback(400,{'Error':'token has already expired'});
				}
			}else{
				callback(400,{'Error':'Token not found'})
			}
		});
	}else{
		callback(400,{'Error':'Missing required fields'});
	}	
};


//delete token subHandlers
handlers.delete = (data,callback)=>{
var id = typeof(data.payload.tokenId)=='string' && data.payload.tokenId.trim().length == 20?data.payload.tokenId.trim():false;
	//validate id
	if(id){
	//veryfying if the token exists by reading it
	_data.read('tokens',id,(err,tokenData)=>{
		if(!err && tokenData){
			//delete the token
		_data.delete('tokens',id,(err)=>{
			if(!err){
				callback(200);
			}else{
				callback(500,{'Error':'failed to delete the token'})
			}
		});
		}else{
			callback(404)
		};
	});
			
}else{
	callback(400,{'Error':'Missing required fields'});
}

};

//Token Validator
handlers.verifyToken = (userId,tokenId,callback)=>{
	//lookup the token
	_data.read('tokens',tokenId,(err,tokenData)=>{
		if(!err && tokenData){
			//check if the token hasn't expired and if it belongs to the requester
			if(tokenData.expires > Date.now() && userId == tokenData.userId){
				//Done -success
				callback(false);
			}else{
				callback('token is invalid');
			}
		}else{
			callback("token not found");
		}
	});
};






//Exportation of the module
module.exports = handlers;