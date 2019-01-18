/*
* Application configurations
*
*/

//Dependencies

//Container for the module
environments = {};


//staging environment 
environments.staging = {
	'envName':'staging',
	'httpPort':3200,
	'httpsPort':3201,
	'hashingSecret':'hashThePassword',
	'stripe':{
		'secretKey':'sk_test_WMWPRkuDOPMuzEvL2D1I6KRL',
		'publishableKey':'pk_test_asUyqxjr0Kf7HeffNxJYTC0g'
	},
	'mailGun':{
		'apiKey':'847ce9ba12a73d1b3e1d1d4b46d50c10-060550c6-abcc0144',
		'baseUrl':'https://api.mailgun.net/v3/mg.awesome-dev.com',
		'sandboxDomain':'sandbox2cf47240ab784f78a97a66b5c702ef4b.mailgun.org',
		'defaultEmail':'hi@sandbox2cf47240ab784f78a97a66b5c702ef4b.mailgun.org'
	},
	'globals':{
		'companyName':'Awesome-dev, Inc',
		'chiefEngineer':'Dellan Muchengapdare',
		'appName':'licky-licky',
		'baseUrl':'http://localhost:3200/',
		'yearCreated':'2019'
	}
}

//production environment
environments.production = {
	'envName':'production',
	'httpPort':5000,
	'httpsPort':5001,
	'hashingSecret':'passwordHashing',
	'stripe':{
		'secretKey':'sk_test_WMWPRkuDOPMuzEvL2D1I6KRL',
		'publishableKey':'pk_test_asUyqxjr0Kf7HeffNxJYTC0g'
	},
	'mailGun':{
		'apiKey':'847ce9ba12a73d1b3e1d1d4b46d50c10-060550c6-abcc0144',
		'baseUrl':'https://api.mailgun.net/v3/mg.awesome-dev.com',
		'sandboxDomain':'sandbox2cf47240ab784f78a97a66b5c702ef4b.mailgun.org',
		'defaultEmail':'hi@sandbox2cf47240ab784f78a97a66b5c702ef4b.mailgun.org'
	},
	'globals':{
		'companyName':'Awesome-dev, Inc',
		'chiefEngineer':'Dellan Muchengapdare',
		'appName':'licky-licky',
		'baseUrl':'http://localhost:8200/',
		'yearCreated':'2019'
	}

}
 
//given environment key
var givenEnv = typeof(process.env.NODE_ENV)=='string'&& process.env.NODE_ENV.length>0? process.env.NODE_ENV:'staging'; 
//Selecting an environment
var chosenEnv = typeof(environments[givenEnv])!=='undefined'?environments[givenEnv]:environments.staging;


//Export chosen environment
module.exports = chosenEnv;