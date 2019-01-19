/*
* All the Front-End Logic of the Application
*
*/



//Container of the Frontend app
var app = {};



app.config = {
	'sessionToken':false,
	'isAdmin':false
};

//Container for the AJAX request operations
app.client = {};

app.client.request = function(headers,path,method,queryStringObject,payload,callback){
  // Gather input from the caller otherwise set defaults
  headers = typeof(headers) == 'object' && headers !== null ? headers : {};
  path = typeof(path) == 'string' ? path : '/';
  method = typeof(method) == 'string' && ['POST','GET','PUT','DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
  queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
  payload = typeof(payload) == 'object' && payload !== null ? payload : {};
  callback = typeof(callback) == 'function' ? callback : false;

  //building the request by adding the queryStringObject as key value pairs 
  if(queryStringObject){
  var requestUrl = path+'?';
  var counter = 0;
  for(var key in queryStringObject){
     if(queryStringObject.hasOwnProperty(key)){
     	counter++
       // If no key value pair added yet dont at the & sign
       if(counter > 1){
         requestUrl+='&';
       }
       // Add the key and value
       requestUrl+=key+'='+queryStringObject[key];
     }
     //increment counter
   } 
  }

  // Form the http request
  var xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);//the true flag is to insure that it is async
  xhr.setRequestHeader("Content-Type", "application/json");//making it a json request

  // looping througgh the supplied header object and adding it to the request
  for(var key in headers){
     if(headers.hasOwnProperty(key)){
       xhr.setRequestHeader(key, headers[key]);
     }
  }

  // If current session token is available, add it to the request
  if(app.config.sessionToken){
    xhr.setRequestHeader("token", app.config.sessionToken.tokenId);
  }

  // When the request comes back, handle the response
  xhr.onreadystatechange = function() {
      if(xhr.readyState == XMLHttpRequest.DONE) {
        var statusCode = xhr.status;
        var responseReturned = xhr.responseText;
      
        // Callback if requested
        if(callback){
       
          try{
            var parsedResponse = JSON.parse(responseReturned);
            callback(statusCode,parsedResponse);
          } catch(e){
            callback(statusCode,false);
          }

        }
      }
  }

  // Send the payload as JSON
  var payloadString = JSON.stringify(payload);
  xhr.send(payloadString); 
};



// Bind the forms
app.bindForms = function(){
	if(document.querySelector("form")!=='null'){
  document.querySelector("form").addEventListener("submit", function(e){
	
    // Stop form submitting default action
    e.preventDefault();
    var formId = this.id;
    var path = this.action;
    var method = this.method.toUpperCase()=='GET'? 'PUT': this.method.toUpperCase();
    if(path.indexOf('?')>-1){
		var querystring = path.split('?')[1].split('=');
		var queryKey = querystring[0];
		var queryValue = querystring[1];
		path = path.split('?')[0];
		var queryStringObject = {}
		queryStringObject[queryKey] = queryValue;
		}
		
		var errorContainer = document.querySelector("#"+formId+" #formError");
		var errorField = document.querySelector("#"+formId+" #formError #errorField");
        
    // Hide the error message due to previous error
    errorContainer.style.display = 'none';
		
    // Getting the inputs and turning them into a payload
    var payload = {};
    var elements = this.elements;
    
    for(var i = 0; i < elements.length; i++){
      if(elements[i].type !== 'submit'){
      	if(elements[i].type=='checkbox'){
      		var valueOfElement = elements[i].checked;
      	}else{
      		var valueOfElement = elements[i].value;
      	};
      	 
        payload[elements[i].name] = valueOfElement;
       
      }
    }
		this.reset();
    // Call the API
    app.client.request(undefined,path,method,queryStringObject,payload,function(statusCode,responsePayload){
    	 // is thte status isnt 200 and there is an error, then display the error
      if(statusCode !== 200){
        // Reading the error from the API if there is any
       var error = responsePayload.Error;
				 // Set the formError to the conatiner of the error displayer
        errorField.innerHTML = error;
					
        // display the error
        errorContainer.style.display = 'block';

      } else {
        // If successful,Sending the form response to the response processor
        app.formResponseProcessor(formId,payload,responsePayload);
      }

    });
    
  });
  };
};


// Form response processor
app.formResponseProcessor = function(formId,requestPayload,responsePayload){
  var functionToCall = false;
  // immediately log the user in if their account was created successfully
  if(formId == 'accountCreate'){
    // Take the phone and password from the request payload and use it to create a token for the user 
    var newPayload = {
      'email' : requestPayload.email,
      'password' : requestPayload.password
    };

    app.client.request(undefined,'api/tokens','POST',undefined,newPayload,function(newStatusCode,newResponsePayload){
      // Display an error if there is one 
      if(newStatusCode !== 200){

        // Set the formError field with the error text
        errorField.innerHTML = typeof (newResponsePayload.Error) !== 'undefined'? newResponsePayload.Error : 'Sorry, an error has occured. Please try again.';

        // Show  the form error field on the form
        errorContainer.style.display = 'block';

      } else {
        // If successful, set the token and redirect the user
        app.setSessionToken(newResponsePayload);
        window.location = '/meals/list';
      }
    });
  }
  // If login was successful, set the token in localstorage and redirect the user
  if(formId == 'sessionCreate'){
  	app.setSessionToken(responsePayload);
    window.location = '/meals/list';
  }
  if(formId == 'payment'){
  	window.location = 'orders/thank-you';
  }
  if(formId == 'profileSettings'){
  	window.location = 'account/settings?userId='+app.config.sessionToken.userId;
  	var savedAlert  = document.querySelector("#saved") !=='null' ?document.querySelector("#saved") : false ;
  	if(savedAlert){
  		savedAlert.style.display = 'block';
  	}
  }
  if(formId == 'createMeal'){
  	var savedAlert  = document.querySelector("#saved") !=='null' ?document.querySelector("#saved") : false ;
  	if(savedAlert){
  		savedAlert.style.display = 'block';
  	}

  }
  };


// Get the session token from localstorage and set it in the app.config object
app.getToken = function(){
  var stringToken = localStorage.getItem('token');
	
  if(typeof(stringToken) == 'string'){
    try{
      var parsedToken = JSON.parse(stringToken);
      app.config.sessionToken = parsedToken;
      app.getAdmin();
    }catch(e){
      app.config.sessionToken = false;
    }
  }
};

app.getAdmin = () => {
	var isAdmin  = localStorage.isAdmin;
	
	    try{
        	var value = JSON.parse(isAdmin);
        	app.config.isAdmin = value.isAdmin;
        	document.querySelector('#admin-panel a').href+='?userId='+app.config.sessionToken.userId;
        }catch(e){
        	app.config.isAdmin = false;
        }
    
}

// Set the session token in the app.config object as well as localstorage
app.setSessionToken = function(token){
	token = typeof ( token ) == 'object' && token !=='null' ? token :false;
	if(token){
  app.config.sessionToken = token;
  var tokenString = JSON.stringify(token);
  localStorage.setItem('token',tokenString);
  app.getCart();
  }else{
  	localStorage.removeItem('token');
  	app.config.sessionToken = false;
  }
  };
  
  
// Renew the token
app.renewToken = function(callback){
  var currentToken = typeof(app.config.sessionToken) == 'object' ? app.config.sessionToken : false;
  if(currentToken){
    // Update the token with a new expiration
    var payload = {
      'tokenId' : currentToken.tokenId
    };
    app.client.request(undefined,'api/tokens','PUT',undefined,payload,function(statusCode,responsePayload){
      // Display an error on the form if needed
      if(statusCode == 200){
        // setting the new token to the app config 
        if(responsePayload){
        app.setSessionToken(responsePayload);
        callback(false);	
        }
        
        } else {
        app.setSessionToken(false);
        callback(true);
      }
    });
  } else {
    app.setSessionToken(false);
    callback(true);
  }
};

// Loop to renew token often
app.tokenRenewalLoop = function(){
  setInterval(function(){
    app.renewToken(function(err){
      if(!err){
        console.log("Token renewed successfully @ "+Date.now());
      }
    });
  },1000 * 60);
};


app.isLoggedIn = ()=>{
	var login = document.querySelector('#login');
	var logout =  document.querySelector('#logout');
	var signUp = document.querySelector('#signup');
	var cart = document.querySelector('#cart');
	var admin = document.querySelector('#admin-panel');
	var accountSettings = document.querySelector('#accountSettings');
	if(app.config.sessionToken){
		logout.style.display = 'block';
		accountSettings.style.display = 'block';
		cart.style.display = 'block';
		
	}else{
		login.style.display = 'block';
		signUp.style.display = 'block';
	}
	if(app.config.isAdmin){
		admin.style.display = 'block';
	}
};

app.getCart = () => {
	//get the api cart items from the api 
		var queryStringObject = {
			'cartId':app.config.sessionToken.userId
		};
		
		//making the api request for the cart 
	app.client.request(undefined,'api/carts','GET',queryStringObject,undefined,function(statusCode,responsePayload){

      // Display an error if there is one 
      if(statusCode !== 200){
					console.log(statusCode);
      } else {
				//Save the cart to the localstorage 	
 				app.saveCart(responsePayload.items);
     }
    });
};



app.saveCart = items => {
	items = typeof ( items ) == 'object' && items instanceof Array ? items : false;
	if(items){
		var stringItems = JSON.stringify(items);
		localStorage.setItem('items',stringItems);
	}
};

app.addDataToCart = () => {
	
	//GRAB the shopping cart table 
	var cart = document.querySelector("tbody");
	//get the items from the localstorage 
	var stringItems = localStorage.getItem('items');
	try{
		var parsedItems = JSON.parse(stringItems);
		//looping through all the items in the cart
		for( i = 0; i < parsedItems.length; i++ ){
			var item = parsedItems[i];
			var tr = document.createElement("tr");
			//looping through the details of an item object
			for(var key in item ){
				if( item.hasOwnProperty(key) ){
					if(key!=='mealId'){
						//creating a cart item entry to the table
					var td = document.createElement("td");
					td.setAttribute('style','color:red !important');
					td.classList += "text-center";
					td.textContent = item[key];
					tr.appendChild(td);
				 }else{
				 	tr.setAttribute('id',item[key]);
				 }
				}
			}
			
			//Add/Remove buttons container 
			var div = document.createElement("div");
			div.classList +="text-center ";
			//Remove
			var removeBtn = document.createElement("button");
			var minusIcon = document.createElement("i");
			minusIcon.classList += "remove fa fa-minus";
			removeBtn.classList +=" btn btn-sm btn-danger btn-round btn-icon mr-1";
			removeBtn.appendChild(minusIcon);
			//Add
			var addBtn = document.createElement("button");
			var plusIcon = document.createElement("i");
			plusIcon.classList += "fa fa-plus add";
			addBtn.appendChild(plusIcon);
			addBtn.classList +=" btn btn-sm btn-success btn-round btn-icon ml-1";
			
			div.appendChild(removeBtn);
			div.appendChild(addBtn);
			//adding the div containing btn to the tr
			tr.appendChild(div);
		cart.appendChild(tr);
		}
	}catch(e){
		console.log(e);
	}
};

app.modifyCart = () => {
	//get the tr element of the cart table 
	try{
	document.querySelector("tbody").addEventListener("click",e=>{
		if(e.target.classList.contains("add")){
		  // getting the meal Id
			mealId = e.target.parentElement.parentElement.parentElement.id; 
			//building the payload 
			var payload = {
				'cartId':app.config.sessionToken.userId,
				'mealId':mealId
			};
			//Making the Api request 
			app.client.request(undefined,'api/carts','PUT',undefined,payload,(statusCode,responsePayload)=>{
				if(statusCode==200){
					var items = responsePayload.items;
					//sending to the saveCart function 
				  app.saveCart(items);
				  //re-render the cart table 
				  var cart = document.querySelector("tbody");
					cart.innerHTML = '';
					app.addDataToCart();
				 }else{
					console.log(statusCode);
				}
			});
		};
		if(e.target.classList.contains("remove")){
			//gettin the meal id
			mealId = e.target.parentElement.parentElement.parentElement.id; 
			//building the payload 
			var payload = {
				'cartId':app.config.sessionToken.userId,
				'mealId':mealId,
				'remove':true
			};
			
			//Making the Api request 
			app.client.request(undefined,'api/carts','PUT',undefined,payload,(statusCode,responsePayload)=>{
				if(statusCode==200){
					var items = responsePayload.items;
					//sending to the saveCart function 
				  app.saveCart(items);
				  //re-render the cart table 
				  var cart = document.querySelector("tbody");
					cart.innerHTML = '';
					app.addDataToCart();
				 }else{
					console.log(statusCode);
				}
			});
			
		}
	});
	}catch(e){
		console.log(e);
	}
	
};

//Creating an order
app.checkout = () => {
	//grabbing the checkout button  and attaching a click event
	document.querySelector("#checkout").addEventListener("click",e =>{
		//grab teh cart id from the app config and building the payload
		var payload = {
		 cartId : app.config.sessionToken.userId
		};
		//hitting the API to make the order 
		app.client.request(undefined,'api/orders','POST',undefined,payload,(status,responsePayload) => {
			//if the request was OK then we continue 
			if( status == 200 ){
				//grabbing the orderID
				var orderId = responsePayload.id;
				window.location = 'orders/detail?orderId='+orderId;
			}else{
				console.log(status);
			}
		});
		
	});
};

app.addToCart = () => {
	//getting the meal lis container and attaching a click event
	try{
	var mealListContainer = document.querySelector('#meal-list') !== 'null' ? document.querySelector('#meal-list') : false;
	
	if(mealListContainer){
	mealListContainer.addEventListener("click",e => {
		if(e.target.classList.contains("add-to-cart")){
			//getting the particular meal ID 
			var mealId = e.target.parentElement.id;
			//building the payload 
			var payload = {
				'cartId':app.config.sessionToken.userId,
				'mealId':mealId
			};
			//Making the Api request 
			app.client.request(undefined,'api/carts','PUT',undefined,payload,(statusCode,responsePayload)=>{
				if(statusCode==200){
					var items = responsePayload.items;
					//sending to the saveCart function 
				  app.saveCart(items);
				  //re-render the cart table 
				  var cart = document.querySelector("tbody");
					cart.innerHTML = '';
					app.addDataToCart();
				 }else{
					console.log(statusCode);
				}
			});

		}
	});
	}
	}catch(e){
		console.log(err);
	};
};


//add userId to account settings link 
app.accountSettingsLink = () => {
	var link =  document.querySelector("#accountSettings a");
	link.href+="?userId="+app.config.sessionToken.userId;
	var profileUpdateForm = document.querySelector("#profileSettings") !== 'null' ?
	document.querySelector("#profileSettings") : false;
	if(profileUpdateForm){
		profileUpdateForm.action += "?userId="+app.config.sessionToken.userId;
		
	}
};
app.logout = () => {
	//grabbling the logout button and attaching an event 
	document.querySelector("#logout button").addEventListener("click",e=>{
		//building the payload 
		var payload = {
			'tokenId':app.config.sessionToken.tokenId
		}
		//Hitting the API 
		app.client.request(undefined,'api/tokens',"DELETE",undefined,payload,(status,responsePayload) => {
			if(status == 200 ){
				app.setSessionToken(false);
				window.location = 'account/logout';
			}
		});
	});
};


app.deleteAccount = () => {
	//grabbbing the button and attaching a click event
	var deleteBtn = document.querySelector("#deleteAccount") !== 'null' ? document.querySelector("#deleteAccount") : false;
	if(deleteBtn){
		deleteBtn.addEventListener("click", e=>{
			//buuilding the queryStringObject 
			var queryStringObject ={
				'userId':app.config.sessionToken.userId
			}
			//hitting the  API 
			app.client.request(undefined,'api/users','DELETE',queryStringObject,undefined, (status,responsePayload) => {
				   if(status == 200 ){
				   	//removing the token from the LS app.config
				   	app.setSessionToken(false);
				   	window.location = 'account/deleted';
				   }
			});
		});
	};
	
	
};

//Check if user is Admin 
app.userIsAdmin = () => {
	var queryStringObject = {
		'userId':app.config.sessionToken.userId
	}
	//hitting the API
	app.client.request(undefined,'api/users','GET',queryStringObject,undefined,(status,responsePayload) => {
		if(status == 200 && responsePayload.isAdmin ){
			var isAdmin = {'isAdmin':true};
			var stringValue = JSON.stringify(isAdmin);
			localStorage.isAdmin = stringValue;
			}
	});
	
};






// Initialisation method
app.init = function(){
  
  // Get the token from localstorage
  app.getToken();
  
  // Renew token
  app.tokenRenewalLoop();

//Displaying appropiate links according the online status of a user
app.isLoggedIn();

//binding the add to cart buttons 
app.addToCart();


//Add cart data to the modal
app.addDataToCart();

// modifying cart contents
app.modifyCart();

//adding userId to the accountSetings like
app.accountSettingsLink();

//binding checkout button
app.checkout();


//account delete button
app.deleteAccount();

//binding logout button
app.logout();

//Checking is user is admin 
app.userIsAdmin();

// handling all form submissions
  app.bindForms();
  
  
   
};
  
// Call the init processes after the window loads
window.onload = function(){
  app.init();
};
  