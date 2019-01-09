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
	'httpPort':3000,
	'httpsPort':3001,
	'hashingSecret':'hashThePassword',
	'stripe':{
		'secretKey':'sk_test_WMWPRkuDOPMuzEvL2D1I6KRL',
		'publishableKey':'pk_test_asUyqxjr0Kf7HeffNxJYTC0g'
	},
	'mailGun':{
		'apiKey':'24864f1c60689961fa8b632684757d9b-060550c6-8f83be9d',
		'baseUrl':'https://api.mailgun.net/v3/mg.awesome-dev.com',
		'sandboxDomain':'sandbox0476dcefe4ad43abbe9aee12f8aac62d.mailgun.org',
	  'defaultEmail':'hello@mg.aawesome-dev.com',
		'domainName':'mg.awesome-dev.com'
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
		'apiKey':'24864f1c60689961fa8b632684757d9b-060550c6-8f83be9d',
		'baseUrl':'https://api.mailgun.net/v3/mg.awesome-dev.com',
		'sandboxDomain':'sandbox0476dcefe4ad43abbe9aee12f8aac62d.mailgun.org',
		'defaultEmail':'hello@mg.aawesome-dev.com',
		'domainName':'mg.awesome-dev.com'
	}
}

//given environment key
var givenEnv = typeof(process.env.NODE_ENV)=='string'&& process.env.NODE_ENV.length>0? process.env.NODE_ENV:'staging'; 
//Selecting an environment
var chosenEnv = typeof(environments[givenEnv])!=='undefined'?environments[givenEnv]:environments.staging;


//Export chosen environment
module.exports = chosenEnv;