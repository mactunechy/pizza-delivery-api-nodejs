/*
*Module containing functions of handling various tasks
*
*/


//Dependencies
var crypto = require('crypto');
var config = require('./config');
var https = require('https');
var querystring = require('querystring');

//Container for the module
var helpers = {};


 //helper for parsing a json string into an object
helpers.parseJson = str=>{
	if(typeof(str)=='string' && str.length>0){
		try{
		return JSON.parse(str);
	}catch(e){
		console.log(e,'failed to parse json');
		return {};
	}
	}else{
		return {};
	}	
};

//hashing method using sha256
helpers.hash = str=>{
	if(typeof(str)=='string' && str.length > 0){
		var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
		return hash;
	}else{
		return false;
	}
}

//helper for generating a random string
helpers.createRandomString = function(strLength){
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength){
    // Define all the possible characters that could go into a string
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    var str = '';
    for(i = 1; i <= strLength; i++) {
        // Get a random character from the possibleCharacters string
        var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        // Append this character to the string
        str+=randomCharacter;
    }
    // Return the final string
    return str;
  } else {
    return false;
  }
};


helpers.validateEmail = email=>{
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};


//Charges the customer with stripe
helpers.chargeCustomer = (orderData,stripeToken,callback)=>{
		//building the payload to be sent to stripe api
		var payload = {
			description:'Pizza Delivery',
			amount:orderData,total,
			currency:'usd',
			source:'tok_visa' //@TODO to be changed to stripeToken
		}
		var stringPayload = querystring.stringify(payload);
		requestOptions = {
			'protocol':'https:',
			'hostname':'api.stripe.com',
			'path':'/v1/charges',
			'method':'POST',
			 'headers': {
    				'Authorization': `Bearer ${config.stripe.secretKey}`,
    				'Content-Type': 'application/x-www-form-urlencoded',
    				'Content-Length': Buffer.byteLength(stringPayload)
  							}
		}
		//making a request
		var req = https.request(requestOptions,res=>{
			var status = res.statusCode;
			/*if(status==200){
				callback(false);
			}else{
				callback(res);
			}*/
			res.on('data',data=>{
				var parsedData = JSON.parse(data);
				if(parsedData.error){
					callback(parsedData.error)
				}else{
					callback(false);
				}
			})
			
		});
		req.on('error', ()=>{
			console.log('payment failed');
		})
		//attaching the  string payload
		req.write(stringPayload);
		//sending the request
		req.end();
}

helpers.emailReceipt = (orderData,userData,callback)=>{
				var message = helpers.formatEmail(orderData);		
						
		
		var payload = {
			'from':config.mailGun.defaultEmail,
			'to':'dmuchengapadare@gmail.com',
			'subject':'Receipt - Pizza Delivery',
			'text':message
		}
	var stringPayload = querystring.stringify(payload);
	 
	 var requestOptions = {
	 	'protocol':'https:',
	 	'hostname':'api.mailgun.net',
	 	'method':'POST',
	 	'path':`/v3/${config.mailGun.domainName}/messages`,
	 	'headers': {
    'Authorization': `Basic ${Buffer.from(`api:${config.mailGun.apiKey}`).toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(stringPayload)
  }
	 }
	//making a request
		var req = https.request(requestOptions,res=>{
			var status = res.statusCode;
			if(status==200){
				callback(false);
				console.log(res);
			}else{
				callback(res);
			}
		});
		req.on('error', ()=>{
			console.log('Email failed to send');
		})
		//attaching the  string payload
		req.write(stringPayload);
		//sending the request
		req.end();

	
	
}



helpers.formatEmail = orderData=>{
	var message = orderData.id+'\n'+'------------------------------------------------------------\n';
				for(i=0;i<orderData.length;i++){
					var item = orderData.items[1];
					for(var key in item){
						if(item.hasOwnProperty(key)){
							message+=key+'     '+item[key];
						}
					}
					message+='\n';
				}
				
				message+='\n--------------------------------------------------------';
		return message;
}






//Exportation of the  Module
module.exports = helpers;