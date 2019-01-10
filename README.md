### Pizza Delivery NodeJs JSON API
***
#### Introduction
A pizza and other fast food delivery service where users can signup and order their favourite meals.
Users are able to make payments with a credit card and they will recieve a receipt through email.
The receipt shows a list of items they purchased and the cost *just like a physical receipt* 


This is a completely raw Nodejs RestFul Json API that consists the following services:
..* <span style="color:blue"> Users </span>
..* <span style="color:blue"> Tokens </span>
..* <span style="color:blue"> Meals </span>
..* <span style="color:blue"> Carts </span>
..* <span style="color:blue"> Orders </span>
..* <span style="color:blue"> Checkout </span>


## service 1 - `/users` 
Accepted Methods - <span style="color:red">`POST`</span> <span style="color:red">`GET`</span> <span style="color:red">`PUT`</span> <span style="color:red">`DELETE`</span>

Breifly, the <span style="color:red">`/users`</span> endpoint is for peforming Crud operations on the users according to the above mentioned request methods 

#### POST
*-Required Data*
..* firstName 
..* lastName
..* email
..* streetAddress 
..* tosAgreement 
..* password

#### PUT
*-Required Data*
..* token

*-Optional Data*
 any field the user wishes to change

#### DELETE
*-Required Data*
..* userID
..* token 

#### GET
..* userID
..* token




## service 2 - `/tokens` 
Accepted Methods - <span style="color:red">`POST`</span> <span style="color:red">`GET`</span> <span style="color:red">`PUT`</span> <span style="color:red">`DELETE`</span>

Breifly, the <span style="color:red">`/tokens`</span> endpoint is for peforming Crud operations on the tokens according to the above mentioned request methods 


#### POST
*-Required Data*
..* email
..* password 

#### PUT
*-Required Data*
..* token
*NB* - the updating concept of the token is to update its expiry tim if the supplied token is still valid

#### DELETE
*-Required Data*
..* tokenID 

#### GET
..* tokenID

## service 3 - `/meals` 
Accepted Methods - <span style="color:red">`POST`</span> <span style="color:red">`GET`</span> <span style="color:red">`PUT`</span> <span style="color:red">`DELETE`</span>

Breifly, the <span style="color:red">`/meals`</span> endpoint is for peforming Crud operations on the meals according to the above mentioned request methods 


#### POST
*-Required Data*
..* title
..* description
..* price
..* token

*NB* - only admin users can `POST`  to the `/meals` endpoint. 

#### PUT
*-Required Data*
..* mealID
..* token
*-Optional Data*
 any of the fields the users wants to update.

*NB* - only admin users and `PUT`  to the `/meals` endpoint. 

#### DELETE
*-Required Data*
..* mealID
..* tokenID 

*NB* - only admin users can `DELETE`  to the `/meals` endpoint. 

#### GET
..* tokenID
..* Either a mealD -to get the specific meal or a *all* flag to get all thw meals avaiable


## service 3 - `/orders` 
Accepted Methods - <span style="color:red">`POST`</span> <span style="color:red">`GET`</span> <span style="color:red">`DELETE`</span>

Breifly, the <span style="color:red">`/orders`</span> endpoint is for peforming Crud operations on the orders according to the above mentioned request methods 

#### POST
*-required Fields-*
..* cartID
..* tokenID
*NB* - once thet order is created, the cart is emptied.

#### DELETE
*-Required fields-*
..* orderID 
..* tokeenId

#### GET
..* tokenID
..*userID
..* Either *ordeId* to get a specific order or an *all* flag, to get all users orders


## service 4 - `/carts` 
Accepted Methods - <span style="color:red">`PUT`</span> <span style="color:red">`GET`</span> 

Breifly, the <span style="color:red">`/orders`</span> endpoint is for peforming Crud operations on the orders according to the above mentioned request methods 
*NB* - When a new user signs up, a new cart if automatically created for him or her


#### PUT
*-required Fields-*
..* cartID
..* tokenID
..* mealID
*NB* - the `PUT` method on `/carts` is for adding and removing items (meals) to the cart.


#### GET
..* tokenID
..* cartID






## service 5 - `/checkout` 
Accepted Methods - <span style="color:red">`POST`</span>  

Breifly, the <span style="color:red">`/orders`</span> endpoint is for peforming a checkout operation 


#### POST
*-required Fields-*
..* orderID
..* mealID
..* stripeToken


## Receipt

Once the payment is successful, the user will receive his or her payment receipt via email.
the receipt will contain a list of the meals purchased and the respective costs


### the Matcher file

The matcher file contains an association of all user's emails and their respective userIDs. once a user signps up, a record of his or her email and user ID is  added to the matcher file automatically. 


### Admin tool

the admin tool is for creating an admin user who has admin previllages via the command line











