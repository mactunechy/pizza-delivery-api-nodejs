/*
*All order related tasks
*
*/



//Dependencies
var _data = require('../data');
var helpers = require('../helpers');
var {verifyToken} = require('./tokens');
var util = require('util');
var debug = util.debuglog('orders');

//Container of the module
var handlers = {};




handlers.orders = (data,callback)=>{
	var acceptedMethods = ['post','delete','get'];
	if(acceptedMethods.indexOf(data.method)>-1){
		handlers[data.method](data,callback);
	}else{
		callback(400,{'Error':'Method not accepted'})
	}
};    

handlers.post = (data,callback)=>{
	//required -token -cartId
	var cartId = typeof(data.payload.cartId)=='string' && data.payload.cartId.trim().length == 20 ? data.payload.cartId.trim():false;
	var token = typeof(data.headers.token)=='string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;
	
	if(cartId && token ){
		//verifying the token supplied using the cartId since the cartId is the same is the userId
		verifyToken(cartId,token,tokenNotValid=>{
			if(!tokenNotValid){
				
				//read the cart from the FS 
				_data.read('carts',cartId,(err,cartData)=>{
					if(!err && cartData ){
						//read user object to get user email
						_data.read('users',cartId,(err,userData)=>{
							if(!err && userData){
								//create the new order object
						   var subtotal = handlers.calculateCartTotal(cartData.items);
						   var id = helpers.createRandomString(20);
								orderData = {
									id,
									'userEmail':userData.email,
									'items':cartData.items,
									'subtotal':handlers.calculateCartTotal(cartData.items),
									'deliveryCost':5.50,
									'total': subtotal+5.50,
									'status':'pending',
									}
									//save the order to disc
									_data.create('orders',id,orderData,err=>{
										if(!err){
											//empty the shopping cart
											cartData.items= [];
											//updating the cartData
											_data.update('carts',cartId,cartData,err=>{
												if(!err){
														callback(200,orderData);
												}else{
														callback(200,orderData);
														debug('failed to empty cart of a user');	
												}
											});
																					}else{
											callback(500,{'Error':'Failed to create an order'});
										}
									})
									
							}else{
								callback(404,{'Error':'User - owner of the cart not found'});
							}
						});
											
					}else{
						callback(404,{'Error':'Cart not found'});
					}
				});
				
			
			}else{
				callback(400,{'Error':'Invalid token was supplied'});
			}
		});
		}else{
		callback(400,{'Error':'Missing required fields'});	
	}	
};


handlers.calculateCartTotal = (items)=>{
	items = typeof(items)=='object' && items instanceof Array && items.length>0 ? items : false;
	if(items){
		var total = 0;
		for(i=0;i<items.length;i++){
			total+=(items[i].price * items[i].quantity)
		}
		return Math.round(total*100);
	}
}

//handles get method
handlers.get = (data,callback)=>{
	//Should provide one of the  2 
	var id = typeof(data.queryStringObject.id)=='string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
	var all = typeof(data.queryStringObject.all)=='string' && data.queryStringObject.all.trim() == 'true' ? true : false;
	//Required
	var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim():false;
	
//go ahead if token id supplied
if(token){
	if(id || all ){
		//reading the token from FS 
	_data.read('tokens',token,(err,tokenData)=>{
		if(!err && tokenData){
			//verifyToken token supplied
			verifyToken(tokenData.userId,tokenData.tokenId,tokenNotValid=>{
				if(!tokenNotValid){
					//Decide whether to send back a list of orders or or
					if(all){
						//getting an arry of all the orders
						_data.list('orders',(err,orders)=>{
							if(!err && orders){
								callback(200,orders);
							}else{
								callback(500,{'Error':'Failed to read orders list'});
							}
						})
					}
					if(id){
						//get the orders with the specified id
						_data.read('orders',id,(err,orderData)=>{
							if(!err && orderData){
								callback(200,orderData);
							}else{
								callback(404,{'Error':'order not found'});
							}
						})
					}
				}else{
					callback(400,{'Error':'Invalid token supplied'});
				}
			});
		}else{
			callback(404,{'Error':'Token not found'});
		}
	});

	}else{
		callback(400,{'Error':'Missing required fields'});
	}
}else{
	callback(400,{'Error':'missing Required token'});
}	
};


//handler - delete
handlers.delete = (data,callback)=>{
var orderId = typeof(data.queryStringObject.orderId)=='string' && data.queryStringObject.orderId.trim().length == 20 ? data.queryStringObject.orderId.trim():false;

var token = typeof(data.headers.token)=='string' && data.headers.token.trim().length == 20 ? data.headers.token.trim():false;
	if(orderId && token ){
		//read the tooken from FS 
		_data.read('tokens',token,(err,tokenData)=>{
			if(!err && tokenData){
				//verifying the token supplied
		verifyToken(tokenData.userId,token,tokenNotValid=>{
			if(!tokenNotValid){
			//read the order from the fileSystem
	_data.read('orders',orderId,(err,orderData)=>{
		if(!err && orderData){
			//deleting the order 
			_data.delete('orders',orderId,err=>{
				if(!err){
					callback(200);
				}else{
					callback(500,{'Error':'Failed to delete order'});
				}
			})
		}else{
			callback(404,{'Error':'Order not found'});
		}
	});
			
			}else{
				callback(400,{'Error':'Invalid token was supplied'});
			}
		});
			}else{
				callback(404,{'Error':'token not found'});
			}
		});
		
	}else{
	callback(400,{'Error':'Missing required fields'});
}

	
};












//Exportation of the module
module.exports = handlers;







