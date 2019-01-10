/*
* Testing the handler functions without running the server
*
*/



//Dependencies
var orders = require('./handlers/orders');
var tokens = require('./handlers/tokens');
var carts = require('./handlers/carts');
var users = require('./handlers/users');
var checkout = require('./handlers/checkout');
var {emailReceipt,chargeCustomer,formatHtmlEmail} = require('./helpers');
var _data = require('./data');

//stripeToken=&stripeToken=tok_1DqLLJI1pw8QwzYByAGR2zJ2&stripeTokenType=card&stripeEmail=dmuchengapadare%40gmail.com
/*var stripeToken = 'tok_1DqLLJI1pw8QwzYByAGR2zJ2'
var orderId = '3qz7nlka0bwlzdl6jbs0'


_data.read('orders',orderId,(err,orderData)=>{
	if(!err && orderData ){
		emailReceipt(orderData,undefined,err=>{
	    console.log(err)
	    
	    })
	
		
	}else{
		console.log('failed to read order');
	}
})

*/
/*
emailReceipt(undefined,undefined,err=>{
	console.log(err)
})
*/

userEmail = 'mactunechy@gmail.com';
_data.listDocs('orders',(err,fileNames)=>{
	if(!err && fileNames){
		//loop through the orders 
		fileNames.forEach(fileName=>{
			//remove the .json
			fileName = fileName.replace('.json','');
			_data.read('orders',fileName,(err,orderData)=>{
				if(!err && orderData){
					//check if an the order has the same cartId as the users's 
					if(orderData.userEmail==userEmail){
						_data.delete('orders',fileName,err=>{
							if(!err){
								console.log('Deletion successful');
							}else{
								console.log('Failed to delete one of the order document');
							}
						});
					}
				}else{
					console.log(err);
				}
			});
		})
	}else{
		console.log(err);
	}
});









//data container

var data = {};
data.headers = {
	'token':'mnewurae125t2cyaa8lz'
};

data.queryStringObject = {
	//'id':'3qz7nlka0bwlzdl6jbs0',
	'all':'true',
	'cartId':'9qmua44lqbn4f3ogs7lj'
}

data.payload = {
	'cartId':'kdads3negi4jm86afw2g',
	'mealId':'pcnq91awjbswxcnqav7h',
	'password':'test123',
	'firstName':'Dellan',
	'lastName':'Chombo',
	'streetAddress':'2334 Hillside',
	'tosAgreement':true,
	'email':'kundaitinashe@gmail.com',
	'orderId':'f8vwkqnw2evrky5m0xfi',
	'stripeToken':'tok_visa'
	//'remove':true
	
}

/*
users.post(data,(status,payload)=>{
	console.log(status,payload)
})
*/
/*
checkout.post(data,(status,payload)=>{
	console.log(status,payload)
})

*/


/*
orders.delete(data,(statusCode,payload)=>{
	console.log(statusCode,payload);
})
*/
/*

tokens.post(data,(status,payload)=>{
	console.log(status,payload)
})
*/
/*
orders.post(data,(status,payload)=>{
	console.log(status,payload)
});
*/





/*
carts.put(data,(status,payload)=>{
	console.log(status,payload)
	});

*/
/*
carts.get(data,(status,payload)=>{
	console.log(status,payload)
	});
*/
/*
orders.get(data,(statusCode,payload)=>{
	console.log(statusCode,payload);
})
*/