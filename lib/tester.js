/*
* Testing endpoint functions without running the server
*
*/



//Dependencies 
var {getTemplate} = require('./templating');
var  _data = require('./data');
var {emailReceipt} = require('./helpers');


_data.read('users','aisybi3ec1zlktf1rds0',(err,userData) => {
	_data.read('orders','0irxdrwlrruzdbx2uefx',(err,orderData) => {
		emailReceipt(orderData,userData,status => {
			console.log(status);
		})
	});
});





/*
data = {
	'head.title':'home'
}

getTemplate('index',data,(err,str)=>{
	console.log(err,str);
});

*/