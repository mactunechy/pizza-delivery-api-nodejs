/*
* Some admin related tasks
*/

//Dependencies
var _data = require('./data');
var readline = require('readline');
var {validateEmail,hash,createRandomString} = require('./helpers')
var emailIsTaken = require('./handlers/users').emailIsTaken;
var {createCart} = require('./handlers/carts');



//module Container
var admin = {};

admin.createAdminUser = ()=>{
	var rl = readline.createInterface({
 input: process.stdin,
 output: process.stdout
});
//getting first name
rl.question('FirstName: ', firstName=>{
	firstName = firstName.trim().length > 0?firstName.trim():false;
	if(firstName){
		rl.question('LastName: ', lastName=>{
			lastName = lastName.trim().length > 0 ? lastName.trim():false;
			if(lastName){
				rl.question('Email: ',email=>{
					email = validateEmail(email.trim()) ? email.trim():false;
					if(email){
						rl.question('Password: ',password=>{
							password = password.trim().length > 0 ? password.trim():false;
							if(password){
								//verify if email is not emailIsTaken
								emailIsTaken(email,emailIsTaken=>{
									if(!emailIsTaken){
				//reading the matcher file
			_data.read('matcher','matcher',(err,matcherData)=>{
				if(!err){
					//creating a user randomId
					var userId = createRandomString(20);
					matcherData = typeof(matcherData)=='object'?matcherData:{};
					matcherData[email] = userId;
				//updating th e matcher with a new user
					_data.update('matcher','matcher',matcherData,err=>{
						if(!err){
							//building the userObject
								var hashedPassword = hash(password);
								var isAdmin = true;
								var userObject = {userId,firstName,lastName,hashedPassword,email,isAdmin};
							
	       //add the user to the fs 
						_data.create('users',userId,userObject,err=>{
							if(!err){
									createCart(userId,err=>{
										if(!err){
											console.log('\x1b[32m%s\x1b[0m','Admin user created successfully');
										}else{
											console.log('\x1b[34m%s\x1b[0m','Failed to create a shopping cart ');
										}
									})
									rl.close();
							}else{
								console.log('\x1b[31m%s\x1b[0m','Error: Failed to create the user');
								rl.close();
							}
												});									      				
													}else{
													console.log('\x1b[31m%s\x1b[0m','failed to update matcher');
													rl.close();
													}
												});
											}else{
												console.log('failed to open matcher file');
											rl.close();
											}
										})
																}else{
										console.log('\x1b[35m%s\x1b[0m','email is taken');
									rl.close();
									}
								});
								
							}else{
								console.log('\x1b[36m%s\x1b[0m','Password should not be blank');
							rl.close();
							}
						});
					}else{
						console.log('\x1b[31m%s\x1b[0m','Email is invalid');
						rl.close();
					}
				})
			}else{
				console.log('\x1b[36m%s\x1b[0m','LastName Should not be blank');
				rl.close();
			}
		});
	}else{
		console.log('\x1b[36m%s\x1b[0m'," FirstName Should not be blank");
		rl.close();	
	}
});

}







admin.createAdminUser();




//Exportation of module
module.exports = admin;