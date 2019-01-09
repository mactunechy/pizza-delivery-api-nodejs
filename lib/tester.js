/*
* Testing the handler functions without running the server
*
*/



//Dependencies
//var orders = require('./handlers/orders');
var tokens = require('./handlers/tokens');
//var carts = require('./handlers/carts');
var {emailReceipt,chargeCustomer} = require('./helpers');
var _data = require('./data');

//stripeToken=&stripeToken=tok_1DqLLJI1pw8QwzYByAGR2zJ2&stripeTokenType=card&stripeEmail=dmuchengapadare%40gmail.com
var stripeToken = 'tok_1DqLLJI1pw8QwzYByAGR2zJ2'
var orderId = '3qz7nlka0bwlzdl6jbs0'

/*
_data.read('orders',orderId,(err,orderData)=>{
	if(!err && orderId ){
		chargeCustomer(orderData,stripeToken,err=>{
			console.log(err);
		});
	}else{
		console.log('failed to read order');
	}
})

*/

emailReceipt(undefined,undefined,err=>{
	console.log(err)
})


/*
//data container

var data = {};
data.headers = {
	'token':'ja244jjtsa58jws569az'
};

data.queryStringObject = {
	//'id':'3qz7nlka0bwlzdl6jbs0',
	'all':'true',
	'cartId':'9qmua44lqbn4f3ogs7lj'
}

data.payload = {
	'cartId':'9qmua44lqbn4f3ogs7lj',
	'mealId':'pcnq91awjbswxcnqav7h',
	'password':'test123',
	'email':'sandy@gmail.com'
	
}
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