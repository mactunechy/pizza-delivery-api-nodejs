/*
 * All meals related handlers
 *
 */

//Dependencies
var _data = require('../data');
var helpers = require('../helpers');
var {verifyToken} = require('./tokens');
var {isAdmin} = require('./users');
var util = require('util');
var debug = util.debuglog('meals');
//Container of the  module
var handlers = {};


//Recieves all routes 
handlers.meals = (data, callback) => {
	var acceptedMethods = ['post', 'put', 'delete', 'get'];
	if (acceptedMethods.indexOf(data.method) > -1) {
		handlers[data.method](data, callback);
	} else {
		callback(400, {
			'Error': 'Method not accepted'
		})
	}
};


handlers.post = (data, callback) => {
	//Required data
	var title = typeof (data.payload.title) == 'string' && data.payload.title.trim().length > 0 ? data.payload.title : false;
	var description = typeof (data.payload.description) == 'string' && data.payload.description.trim().length > 0 ? data.payload.description : false;
	//@todo should be to 2 decimals
	var price = typeof (data.payload.price) == 'number' && data.payload.price > 0 && data.payload.price % 1 < 100 ? data.payload.price : false;

	//Grabbing the token from the headers
	var token = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

	if (title && description && price && token) {
		//reading the token from FS 
		_data.read('tokens', token, (err, tokenData) => {
			if (!err && tokenData) {
				//verifyToken token supplied
				verifyToken(tokenData.userId, tokenData.tokenId, tokenNotValid => {
					if (!tokenNotValid) {
						isAdmin(tokenData.userId, userIsAdmin => {
							if (userIsAdmin) {
								//building the meal object
								var mealId = helpers.createRandomString(20);
								var mealObject = {
									mealId,
									title,
									description,
									price
								}
								//finally lets  go ahead and save tehe meal to Disc
								_data.create('meals', mealId, mealObject, err => {
									if (!err) {
										callback(200);
									} else {
										callback(500, {
											'Error': 'Failed to add the new meal to disc'
										});
										debug('Failed to save new meal');
									}
								});
							} else {
								callback(403, {
									'Error': 'Fordden, user is not authorised'
								});
							}
						});
					} else {
						callback(400, {
							'Error': 'Invalid token supplied'
						});
					}
				});
			} else {
				callback(404, {
					'Error': 'Token not found'
				});
			}
		});

	} else {
		callback(400, {
			'Error': 'Missing required Fields'
		});
	}
};

handlers.get = (data, callback) => {
	//Should provide one of the  2 
	var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
	var all = typeof (data.queryStringObject.all) == 'string' && data.queryStringObject.all.trim() == 'true' ? true : false;
	//Required
	var token = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

	//go ahead if token id supplied
	if (token) {
		if (id || all) {
			//reading the token from FS 
			_data.read('tokens', token, (err, tokenData) => {
				if (!err && tokenData) {
					//verifyToken token supplied
					verifyToken(tokenData.userId, tokenData.tokenId, tokenNotValid => {
						if (!tokenNotValid) {
							//Decide whether to send back a list of meals or or
							if (all) {
								//getting an arry of all the meals
								_data.list('meals', (err, meals) => {
									if (!err && meals) {
										callback(200, meals);
									} else {
										callback(500, {
											'Error': 'Failed to read meals list'
										});
									}
								})
							}
							if (id) {
								//get the meal with the specified id
								_data.read('meals', id, (err, mealData) => {
									if (!err && mealData) {
										callback(200, mealData);
									} else {
										callback(404, {
											'Error': 'Meal not found'
										});
									}
								})
							}
						} else {
							callback(400, {
								'Error': 'Invalid token supplied'
							});
						}
					});
				} else {
					callback(404, {
						'Error': 'Token not found'
					});
				}
			});

		} else {
			callback(400, {
				'Error': 'Missing required fields'
			});
		}
	} else {
		callback(400, {
			'Error': 'missing Required token'
		});
	}
};

handlers.put = (data, callback) => {
	//required data
	var id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

	//optional Data
	var title = typeof (data.payload.title) == 'string' && data.payload.title.trim().length > 0 ? data.payload.title : false;
	var description = typeof (data.payload.description) == 'string' && data.payload.description.trim().length > 0 ? data.payload.description : false;
	var price = typeof (data.payload.price) == 'number' && data.payload.price > 0 && data.payload.price % 1 < 100 ? Math.round(data.payload.price * 100) : false;

	//Grabbing the token from the headers
	var token = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

	if (id && token) {
		//check if any field to update has been supplied
		if (title || description || price) {
			//reading the token from FS 
			_data.read('tokens', token, (err, tokenData) => {
				if (!err && tokenData) {
					//verifyToken token supplied
					verifyToken(tokenData.userId, tokenData.tokenId, tokenNotValid => {
						if (!tokenNotValid) {
							isAdmin(tokenData.userId, userIsAdmin => {
								if (userIsAdmin) {
									//Read the meal from disc
									_data.read('meals', id, (err, mealData) => {
										if (!err && mealData) {
											//updating the mealData with the new info 
											if (title) {
												mealData.title = title
											}
											if (description) {
												mealData.description = description
											}
											if (price) {
												mealData.price = price
											}
											//Saving the changes to Disc
											_data.update('meals', id, mealData, err => {
												if (!err) {
													callback(200);
												} else {
													callback(500);
													debug('failed to save meal changes');
												}
											});
										} else {
											callback(404, {
												'Error': 'Meal not found'
											});
										}
									})

								} else {
									callback(403, {
										'Error': 'Fordden, user is not authorised'
									});
								}
							});
						} else {
							callback(400, {
								'Error': 'Invalid token supplied'
							});
						}
					});
				} else {
					callback(404, {
						'Error': 'Token not found'
					});
				}
			});
		} else {
			callback(400, {
				'Error': 'No fields to update supplied'
			});
		}

	} else {
		callback(400, {
			'Error': 'Missing required fields'
		});
	}
};


//delete method handler
handlers.delete = (data, callback) => {
	//required
	var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
	var token = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;


	if (id && token) {
		//reading the token from FS 
		_data.read('tokens', token, (err, tokenData) => {
			if (!err && tokenData) {
				//verifyToken token supplied
				verifyToken(tokenData.userId, tokenData.tokenId, tokenNotValid => {
					if (!tokenNotValid) {
						isAdmin(tokenData.userId, userIsAdmin => {
							if (userIsAdmin) {
								//
								_data.delete('meals', id, err => {
									if (!err) {
										callback(200);
									} else {
										callback(500);
										debug('failed to delete file');
									}
								});
							} else {
								callback(403, {
									'Error': 'Fordden, user is not authorised'
								});
							}
						});
					} else {
						callback(400, {
							'Error': 'Invalid token supplied'
						});
					}
				});
			} else {
				callback(404, {
					'Error': 'Token not found'
				});
			}
		});

	} else {
		callback(400, {
			'Error': 'Missing required Fields'
		});
	}


}


//Exportation of the module
module.exports = handlers