/*
* All handlers for GUI
*
*/


//Dependencies
var util = require('util');
var debug = util.debuglog('gui');
var templating = require('../templating');
var _data = require('../data');


//Container of  the module
var handlers = {};

//Container for all account related handlers
handlers.account = {};

//Container of all session related handlers
handlers.session = {}

//Conatiner for meals related handlers
handlers.meals = {};

//Container for all orders related handlers
handlers.orders = {};



handlers.home = (data,callback)=>{
	//only accept get method
	if(data.method == 'get'){
		//specific html data for this page which is to be intepolated into the template 
		var data = {
			'head.title':'Home'
		}
		//get the tamplate
		templating.getTemplate('index',data,(err,str)=>{
			if(!err && str ){
				callback(200,str,'html');
			}
		})
	}
}



handlers.public = (data,callback)=>{
	var trimmedPath = typeof(data.trimmedPath)=='string' && data.trimmedPath.trim().length > 0 ? data.trimmedPath.trim():false;
	if(trimmedPath){
		//remove the public/ from the trimmedPath
		filePath  = trimmedPath.replace('public/','');
		//send to the get static file function
		templating.getStaticFile(filePath,(err,str,contentType)=>{
			if(!err && str && str.length > 0 ){
				callback(200,str,contentType);
			}else{
				callback(404);
			}
		});
	}
}


//Creating an account
handlers.account.create = (data,callback)=>{
	//only accept get method
	if(data.method == 'get'){
		//specific html data for this page which is to be intepolated into the template 
		var data = {
			'head.title':'signup',
			'body.title':'Create an Account'
		}
		//get the tamplate
		templating.getTemplate('accountCreate',data,(err,str)=>{
			if(!err && str ){
				callback(200,str,'html');
			}
		})
	}

}
//confirm acccount delete page
handlers.account.delete = (data,callback)=>{
	//only accept get method
	if(data.method == 'get'){
		//specific html data for this page which is to be intepolated into the template 
		var data = {
			'head.title':'Delete Account',
			'body.title':'Delete Account'
		}
		//get the tamplate
		templating.getTemplate('accountDelete',data,(err,str)=>{
			if(!err && str ){
				callback(200,str,'html');
			}
		})
	}
};

handlers.account.deleted = (data,callback) => {
	//only accept get method
	if(data.method == 'get'){
		//specific html data for this page which is to be intepolated into the template 
		var data = {
			'head.title':'Account deleted',
			'body.title':'Account deleted'
		}
		//get the tamplate
		templating.getTemplate('accountDeleted',data,(err,str)=>{
			if(!err && str ){
				callback(200,str,'html');
			}
		})
	}





};

//account setting page
handlers.account.settings = (data,callback)=>{
	//required data 
	var userId = typeof (data.queryStringObject.userId) == 'string' && data.queryStringObject.userId.trim().length =='20' ?data.queryStringObject.userId.trim() : false ;
	
	if(data.method == 'get' && userId ){
		//Lookup the user 
		_data.read('users',userId,(err,userData) => {
			if(!err && userData ){
				//specific html data for this page which is to be intepolated into the template 
				delete userData.hashedPassword;
				delete userData.userId;
		var data = {
			'head.title':'settings',
			'body.title':'Account settings',
			...userData
		}
		//get the tamplate
		templating.getTemplate('accountSettings',data,(err,str)=>{
			if(!err && str ){
				callback(200,str,'html');
			}
		});

			}else{
				callback(500,{'Error':'and error ocurred'});
				debug(err);
			}
		});
	}
};

//Favicon handler 
handlers.favicon = (data,callback) => {
	var filePath = data.trimmedPath;
	templating.getStaticFile(filePath,(err,str,contentType)=>{
		if(!err && str && str.length > 0 ){
			callback(200,str,contentType);
		}
	});
}





handlers.orders.thankYou = (data,callback) =>{
	//only accept get method
	if(data.method == 'get'){
		//specific html data for this page which is to be intepolated into the template 
		var data = {
			'head.title':'checkout complete',
			'body.title':'Delivery will arrive soon!'
		}
		//get the tamplate
		templating.getTemplate('ordersThankYou',data,(err,str)=>{
			if(!err && str ){
				callback(200,str,'html');
			}
		})
	}

};


//creating a serrion/logging in
handlers.session.create = (data,callback)=>{
	//only accept get method
	if(data.method == 'get'){
		//specific html data for this page which is to be intepolated into the template 
		var data = {
			'head.title':'Login',
			'body.title':'Already Hungry?'
		}
		//get the tamplate
		templating.getTemplate('sessionCreate',data,(err,str)=>{
			if(!err && str ){
				callback(200,str,'html');
			}
		})
	}


};

//creating a informing logging out success
handlers.session.delete = (data,callback)=>{
	if(data.method=='get'){
					//Data to be interporated into the html template
				var data = {
			'head.title':'loggged out',
			'body.title':'Loggout out'
			
		}
			templating.getTemplate('sessionDeleted',data,(err,str)=>{
			if(!err && str ){
				callback(200,str,'html');
			}
		})
		}else{
			callback(status);
		}


};


// single order detail view
handlers.orders.detail = (data,callback)=>{
	//required data 
	var orderId = typeof (data.queryStringObject.orderId) == 'string' && data.queryStringObject.orderId.trim().length == 20 ? data.queryStringObject.orderId.trim() : false;
	if( data.method == 'get' && orderId ){
		//reading the order from teh FS 
		_data.read('orders',orderId,(err,orderData) => {
			if(!err && orderData ){
				var data = {
					'head.title':'checkout',
					'body.title':'Empty your pockets',
					'userEmail':orderData.userEmail,
					'subtotal':orderData.subtotal,
					'deliveryCost':orderData.deliveryCost,
					'total':orderData.total,
					'id':orderData.id
				}
				//grabbing the template and intepolating the data
				templating.getTemplate('orderDetails',data,(err,str)=>{
			if(!err && str ){
				callback(200,str,'html');
			}
		})
		}else{
				callback(500,{'Error':'Could not find order'});
			}
		});
	}else{
		callback(400,{'Error':'Missing required fields or method is not allowed'});
	}
	
};

//meals listing
handlers.meals.list = (data,callback)=>{
	//only accept get method
	if(data.method == 'get'){
		//getting the list of all the meals
		_data.list('meals',(err,mealsList)=>{
			if(!err && mealsList){
				//building an html section for the meal
				var snippet = '';
				for(i=0;i<mealsList.length;i++){
					var meal = mealsList[i];
					var card = templating.getSnippet('mealCard');
					for(var key in meal ){
						if(meal.hasOwnProperty(key)){
							var find = '{meal.'+key+'}';
							 var replace = meal[key];
							 card = card.replace(find,replace);
						}
					}
					snippet+=card;
					 
				}
				
				
				//specific html data for this page which is to be intepolated into the template 
		var data = {
			'head.title':'Menu',
			'body.title':'Fill up your cart',
			'snippet':snippet
		}
			
		//get the tamplate
		templating.getTemplate('mealList',data,(err,str)=>{
			if(!err && str ){
				callback(200,str,'html');
			}
		})

			}else{
				callback(500,{'Error':'No meals'});
			}
		});
	}
};

handlers.meals.add = (data,callback) => {
	//Required Data 
	var userId =  typeof (data.queryStringObject.userId) == 'string' && data.queryStringObject.userId.trim().length == 20 ? data.queryStringObject.userId.trim() : false;
	if(userId && data.method == 'get'){
		//Lookup the user
		_data.read('users',userId,(err,userData) => {
			if(!err && userData ){
				//continue id user is Admin
				if( typeof (userData.isAdmin) && userData.isAdmin ){
								//Data to be interporated into the html template
				var data = {
			'head.title':'Admin',
			'body.title':'Admin - add a meal'
			
		}
			templating.getTemplate('createMeal',data,(err,str)=>{
			if(!err && str ){
				callback(200,str,'html');
			}
		})
	}else{
									//Data to be interporated into the html template
				var data = {
			'head.title':'Not Allowed',
			'body.title':'You are not Authorised'
			
		}
			templating.getTemplate('notAllowed',data,(err,str)=>{
			if(!err && str ){
				callback(200,str,'html');
			}
		});
		}
	}else{
		callback(400);
	}
})
}else{
	callback(400);
}
};















//Exportation of the module
module.exports = handlers;