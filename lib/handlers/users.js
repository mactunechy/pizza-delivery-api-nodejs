/*
 * All user handlers
 *
 */

//Dependencies
var helpers = require('../helpers');
var _data = require('../data');
var verifyToken = require('./tokens').verifyToken;
var {
	createCart
} = require('./carts');
//container for the module
var handlers = {};


handlers.emailIsTaken = (email, callback) => {
	//read the user Email matcher file 
	_data.read('matcher', 'matcher', (err, data) => {
		if (!err) {
			emailList = typeof (data) == 'object' ? data : {};
			emailIsTaken = typeof (emailList[email]) !== 'undefined' ? true : false;
			callback(emailIsTaken);
		} else {
			callback(err);
		}
	})
};

//Checking g if User is Admin 
handlers.isAdmin = (userId, callback) => {
	//read the user from the fileSystem 
	_data.read('users', userId, (err, userData) => {
		if (!err && userData) {
			var userIsAdmin = typeof (userData.isAdmin) !== 'undefined' && userData.isAdmin == true ? true : false;
			callback(userIsAdmin);
		} else {
			callback(false);
			console.log(err);
		}
	});
}


//Recieving all users routes
handlers.users = (data, callback) => {
	var acceptedMethods = ['post', 'get', 'put', 'delete'];
	if (acceptedMethods.indexOf(data.method) > -1) {
		var chosenHandler = handlers[data.method];
		chosenHandler(data, callback);
	} else {
		callback(403, {
			'message': 'method not allowed'
		});
		console.log('error', data.method);
	}
};

//handler - post
//required infomation - FirstName - lastName - email - streetAddress - password - tosAgreement
handlers.post = (data, callback) => {
	var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
	var email = typeof (data.payload.email) == 'string' && helpers.validateEmail(data.payload.email.trim()) ? data.payload.email.trim() : false;
	var streetAddress = typeof (data.payload.streetAddress) == 'string' && data.payload.streetAddress.trim().length > 0 ? data.payload.streetAddress : false;

	var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
	var tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

	if (firstName && lastName && email && password && tosAgreement && streetAddress) {

		var userId = helpers.createRandomString(20),
			//create the userObject to save to Disc
			userObject = {
				userId,
				firstName,
				lastName,
				email,
				'hashedPassword': helpers.hash(password),
				tosAgreement,
				streetAddress
			}
		//checking if there is no user with this email
		handlers.emailIsTaken(email, emailIsTaken => {
			if (!emailIsTaken) {
				//reading the matcher file
				_data.read('matcher', 'matcher', (err, matcherData) => {
					if (!err) {
						matcherData = typeof (matcherData) == 'object' ? matcherData : {};
						matcherData[email] = userId;
						//updating th e matcher with a new user
						_data.update('matcher', 'matcher', matcherData, err => {
							if (!err) {
								//add the user to the fs 
								_data.create('users', userId, userObject, err => {
									if (!err) {
										//creating user's permanent shopping cart 
										createCart(userId, err => {
											if (!err) {
												callback(200);
											} else {
												callback(500);
												console.log(err);
											}
										});
									} else {
										callback(500, {
											'Error': 'Failed to create the user'
										});
									}
								});
							} else {
								callback(500);
								console.log('failed to update matcher');
							}
						});
					} else {
						callback(500);
						console.log('failed to open matcher file');
					}
				})
			} else {
				callback(400, {
					'Error': 'email is taken'
				});
			}
		});
	} else {
		callback(400, {
			'Error': 'Missing required fields'
		});
	};


};

//handler - get
handlers.get = (data, callback) => {
	//required
	var userId = typeof (data.queryStringObject.userId) == 'string' && data.queryStringObject.userId.trim().length == 20 ? data.queryStringObject.userId.trim() : false;
	var token = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;
	if (userId && token) {
		//verifying the token supplied
		verifyToken(userId, token, tokenNotValid => {
			if (!tokenNotValid) {
				//lookup user
				_data.read('users', userId, (err, userData) => {
					if (!err && userData) {
						delete userData.hashedPassword;
						callback(200, userData);
					} else {
						callback(404, {
							'Error': 'User not found'
						});
					}
				});

			} else {
				callback(400, {
					'Error': 'Invalid token was supplied'
				});
			}
		});
	} else {
		callback(400, {
			'Error': 'Missing required fields'
		});
	}

};

//handler - put
handlers.put = (data, callback) => {
	//Required data
	var userId = typeof (data.queryStringObject.userId) == 'string' && data.queryStringObject.userId.trim().length == 20 ? data.queryStringObject.userId.trim() : false;
	console.log(userId);

	//optional data
	var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName : false;
	var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName : false;
	var email = typeof (data.payload.email) == 'string' && helpers.validateEmail(data.payload.email.trim()) ? data.payload.email.trim() : "myEmail@gmail.com";
	var streetAddress = typeof (data.payload.streetAddress) == 'string' && data.payload.streetAddress.trim().length > 0 ? data.payload.streetAddress : false;

	var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false;

	var token = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;
	if (userId && token) {
		//verifying the token supplied
		verifyToken(userId, token, tokenNotValid => {
			if (!tokenNotValid) {
				//check if any field to update was 	
				if (firstName || lastName || email || password || streetAddress) {
					//reading the user
					_data.read('users', userId, (err, userData) => {
						if (!err && userData) {
							//updating the email
							if (email) {
								//check if email is not taken
								//Conditional-upadating the rest of the data in this condition because of the special treatment of the email updating process
								handlers.emailIsTaken(email, emailIsTaken => {
									if (!emailIsTaken) {
										//reading the matcher file to update the new infomation
										_data.read('matcher', 'matcher', (err, matcherData) => {
											//removing the old email
											if (matcherData[userData.email]) {
												delete matcherData[userData.email];
											} else {
												console.log("Email not found in the matcher");
											}

											//adding new email
											matcherData[email] = userData.userId;

											//updatingthe matcher file
											_data.update('matcher', 'matcher', matcherData, err => {
												if (err) {
													console.log(err);
												}
											});
											//adding the userdata 
											userData.email = email
											if (firstName) {
												userData.firstName = firstName
											}
											if (lastName) {
												userData.lastName = lastName
											}
											if (password) {
												userData.hashedPassword = helpers.hash(password)
											}
											if (streetAddress) {
												userData.streetAddress = streetAddress
											}
											//writing the updated data to disc
											_data.update('users', userId, userData, err => {
												if (!err) {
													callback(200);
												} else {
													callback(500, {
														'Error': "Failed to update the user"
													});
												}
											});

										});
									} else {
										callback(400, {
											'Error': 'email is taken'
										});
									}
								});
							} else {
								//Note- updating the fields as normal since the is no email to be updated
								if (firstName) {
									userdata.firstName = FirstName
								}
								if (lastName) {
									userdata.lasName = lastName
								}
								if (password) {
									userdata.hashedPassword = helpers.hash(password)
								}
								if (streetAddress) {
									userData.streetAddress = streetAddress
								}
								//writing the updated info to Disc
								_data.update('users', userId, userData, err => {
									if (!err) {
										callback(200);
									} else {
										callback(500, {
											'Error': 'failed to update user'
										});
										console.log(err);
									}
								});
							}
						} else {
							callback(404, {
								'Error': 'User not found'
							});
						}
					});
				}

			} else {
				callback(400, {
					'Error': 'Invalid token was supplied'
				});
			}
		});
	} else {
		callback(400, {
			'Error': 'Missing required fields'
		});
	}
};

//handler - delete
handlers.delete = (data, callback) => {
	var userId = typeof (data.queryStringObject.userId) == 'string' && data.queryStringObject.userId.trim().length == 20 ? data.queryStringObject.userId.trim() : false;

	var token = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;
	if (userId && token) {
		//verifying the token supplied
		verifyToken(userId, token, tokenNotValid => {
			if (!tokenNotValid) {
				//read the user from the fileSystem
				_data.read('users', userId, (err, userData) => {
					if (!err && userData) {
						userEmail = userData.email;
						//reading the matcher and deleting the user match 
						_data.read('matcher', 'matcher', (err, matcherData) => {
							if (!err && matcherData) {
								//delete the user matcher
								delete matcherData[userEmail];
								//updating the matcher in the fs
								_data.update('matcher', 'matcher', matcherData, err => {
									if (!err) {
										//proceeding to delete user from fs
										_data.delete('users', userId, err => {
											if (!err) {
												//thern remove thier cart from the Disc
												//using the userId since its the same as the cart id
												_data.delete('carts', userId, err => {
													if (!err) {
														//deleting users's orders
														//--reading the orders collection
														_data.listDocs('orders', (err, fileNames) => {
															if (!err && fileNames) {
																//loop through the orders 
																fileNames.forEach(fileName => {
																	//remove the .json
																	fileName = fileName.replace('.json', '');
																	_data.read('orders', fileName, (err, orderData) => {
																		if (!err && orderData) {
																			//check if an the order has the same cartId as the users's 
																			if (orderData.userEmail == userEmail) {
																				_data.delete('orders', fileName, err => {
																					if (!err) {
																						console.log('Deletion successful');
																					} else {
																						console.log('Failed to delete one of the order document');
																					}
																				});
																			}
																		} else {
																			console.log(err);
																		}
																	});
																})
															} else {
																console.log(err);
															}
														});

														callback(200);
													} else {
														callback(500, {
															'Error': 'User deleted but an error occured'
														});
														console.log(err);
													}
												});
											} else {
												callback(500, {
													'Error': 'Failed delete user'
												});
											}
										})
									} else {
										callback(500);
										console.log('failed to update matcher with new data');
									}
								});
							} else {
								callback(500);
								console.log("could not open matcher file");
							}
						});
					} else {
						callback(404, {
							'Error': 'User not found'
						});
					}
				});

			} else {
				callback(400, {
					'Error': 'Invalid token was supplied'
				});
			}
		});
	} else {
		callback(400, {
			'Error': 'Missing required fields'
		});
	}


};


//Exportation of the module
module.exports = handlers;