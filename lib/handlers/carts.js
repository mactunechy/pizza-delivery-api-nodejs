/*
 *All carts related handlers
 *
 */

//Dependencies
var _data = require('../data');
var helpers = require('../helpers');
var {verifyToken} = require('./tokens');
var util = require('util');
var debug = util.debuglog('carts');

//Container of the module
var handlers = {};

//Since the cart will be automatically created when the user signs up,
//the only accepted methods are for updating and getting the cart.
handlers.carts = (data, callback) => {
	var acceptedMethods = ['put', 'get'];
	if (acceptedMethods.indexOf(data.method) > -1) {
		handlers[data.method](data, callback);
	} else {
		callback(400, {
			'Error': 'Method not accepted'
		})
	}
};


handlers.createCart = (userId, callback) => {
	userId = typeof (userId) == 'string' && userId.trim().length == 20 ? userId.trim() : false;
	if (userId) {
		cartData = {
			'id': userId,
			'items': []
		}
		//add cart to disc
		_data.create('carts', userId, cartData, err => {
			if (!err) {
				callback(false);
			} else {
				callback('User already have a shopping cart');
			}
		});
	} else {
		callback("Invalid userId");
	}
}
//handles put method
handlers.put = (data, callback) => {
	//required infomation
	var cartId = typeof (data.payload.cartId) == 'string' && data.payload.cartId.trim().length == 20 ? data.payload.cartId.trim() : false;
	var mealId = typeof (data.payload.mealId) == 'string' && data.payload.mealId.trim().length == 20 ? data.payload.mealId.trim() : false;
	var remove = typeof (data.payload.remove) == 'boolean' ? data.payload.remove : false;
	var token = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;
	if (cartId && mealId && token) {
		//verifying the token supplied
		verifyToken(cartId, token, tokenNotValid => {
			if (!tokenNotValid) {
				//lookup user
				_data.read('carts', cartId, (err, cartData) => {
					if (!err && cartData) {
						var _meal = typeof (cartData.items.find(item => item.mealId == mealId)) !== 'undefined' ? cartData.items.find(item => item.mealId == mealId) : false;
						//Adding a meal, if it already exists.. we remove the meal
						if (_meal) {
							//if the remove boolean is true, we decrement the quantity of the item 
							if (remove) {
								if (_meal.quantity <= 1) {
									//removing the meal item from the items list
									cartData = handlers.updateCartItems(cartData, mealId, false, true);
								} else {
									//reducig the quantity of the meal item
									cartData = handlers.updateCartItems(cartData, mealId, true);
								}
							} else {
								//else increment the quantity of the item
								cartData = handlers.updateCartItems(cartData, mealId);

							}

						}
						if (!_meal && !remove) {
							//if meal postion is'nt defined and the remove flag is false then we lookup the meal with the id
							_data.read('meals', mealId, (err, mealData) => {
								if (!err && mealData) {
									//add the quantity property to the meal data
									mealData.quantity = 1
									//adding meal to cart
									cartData.items.push(mealData);
									//saving the data to disc
									_data.update('carts', cartId, cartData, err => {
										if (!err) {
											callback(200);
										} else {
											callback(500, {
												'Error': 'Failed to update cartData'
											});
										}
									});

									} else {
									callback(404, {
										'Error': 'Meal not found'
									});
								}
							});
						}else{
						//saving the data to disc
						_data.update('carts', cartId, cartData, err => {
							if (!err) {
								callback(200);
							} else {
								callback(500, {
									'Error': 'Failed to update cartData'
								});
							}
						});
						}
					} else {
						callback(404, {
							'Error': 'Cart not found'
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


//handles carts get method
handlers.get = (data, callback) => {
	//required
	var cartId = typeof (data.queryStringObject.cartId) == 'string' && data.queryStringObject.cartId.trim().length == 20 ? data.queryStringObject.cartId.trim() : false;
	var token = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;
	if (cartId && token) {
		//verifying the token supplied
		verifyToken(cartId, token, tokenNotValid => {
			if (!tokenNotValid) {
				//lookup user
				_data.read('carts', cartId, (err, cartData) => {
					if (!err && cartData) {
						callback(200, cartData);
					} else {
						callback(404, {
							'Error': 'Cart not found'
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


//Handling conditional adjustments to the shopping cart
handlers.updateCartItems = (cartData, mealId, reduce, remove) => {
	var _meal = typeof (cartData.items.find(item => item.mealId == mealId)) !== 'undefined' ? cartData.items.find(item => item.mealId == mealId) : false;
	var mealPosition = cartData.items.indexOf(_meal);
	if (reduce) {
		_meal.quantity--;
		if (mealPosition) {
			//replacing the item
			cartData.items[mealPosition] = _meal;
		}
	}
	if (remove) {
		if (typeof (mealPosition) == 'number') {
			//replacing the item
			cartData.items.splice(mealPosition, 1);
		}
	}
	if (!remove && !reduce) {
		_meal.quantity++;
		cartData.items[mealPosition] = _meal;
	}
	return cartData;
}


//Exportation of the module
module.exports = handlers;