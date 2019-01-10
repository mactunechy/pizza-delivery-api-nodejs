/*
*All checkout functions

*
*/


//Depepndencies
var _data = require('../data');
var https = require('https');
var helpers = require('../helpers');
var { verifyToken } = require('./tokens');
var {emailReceipt} = require('../helpers');
var util = require('util');
var debug = util.debuglog('checkouts');
//container of the module
var handlers = {};



handlers.checkout = (data,callback)=>{
	var acceptedMethods = ['post'];//add a get method when refactoring for GUI
	if(acceptedMethods.indexOf(data.method)>-1){
		handlers[data.method](data,callback);
	}else{
		callback(400,{'Error':'Method not accepted'})
	}
};





handlers.post = (data,callback)=>{
	var stripeToken = typeof(data.payload.stripeToken)=='string' && data.payload.stripeToken.trim().length>0 ? data.payload.stripeToken.trim():false;
	var orderId = typeof(data.payload.orderId)=='string' && data.payload.orderId.trim().length == 20 ? data.payload.orderId.trim():false;

	var token = typeof(data.headers.token)=='string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;
	
	if(stripeToken && token && orderId ){
		_data.read('tokens',token,(err,tokenData)=>{
		if(!err && tokenData){
			//verifyToken token supplied
			verifyToken(tokenData.userId,tokenData.tokenId,tokenNotValid=>{
				if(!tokenNotValid){
					//read the order from FS 
					_data.read('orders',orderId,(err,orderData)=>{
						if(!err && orderData){
							if(orderData.status == 'pending'){
							//pass to a function that charges the customer
							helpers.chargeCustomer(orderData,stripeToken,err=>{
								if(!err){
									//Update the status of the order in the fileSystem
									orderData.status = 'complete';
									_data.update('orders',orderId,orderData,err=>{
										if(!err){
											callback(200,{'message':'Payment successul, you will recieve your receipt in your mail box'});
									     //Sending thet receiot to the user via email
									    //fetch users email 
									     _data.read('users',tokenData.userId,(err,userData)=>{
										     if(!err && userData){
											    //pass to an email sending function
											    emailReceipt(orderData,userData,err=>{
												    if(!err){
												    	debug('receipt sent successfully');
												    }else{
												    	debug('Failed to send email')
												    }
											      });
								      }else{
											debug('User not found');
										}
									});
									}else{
											callback(500)
											debug('payment completed but failed to update the status of the order')
										}
									});
									}else{
									callback(500,{'Error':err});
								}
							});
						}else{
							callback(404,{'Error':'Order not found'});
						}
						}else{
							callback(400,{'Error':'Order is already checkedout'});
						}
					});
				}else{
					callback(400,{'Error':'Invalid token supplied'});
				}
			});
		}else{
	     callback(404,{'Error':'Token not found'});
	}

});
}else{
	callback(400,{'Error':'Missing require fields'});
}
}


//Exportation of the module
module.exports = handlers;
