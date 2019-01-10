/*
*Initializing the matcher object
*
*/


//Dependencies
var _data = require('./data');
var util = require('util');
var debug = util.debuglog('matcher');
//Module container
var matcher = {};

matcher.init = ()=>{
	//first try to read the matcher file
	_data.read('matcher','matcher',(err,matcherData)=>{
		if(err){
			//create new matcher file
			matcherData = JSON.stringify({});
			_data.create('matcher','matcher',matcherData,err=>{
				if(!err){
					debug('New matcher file create successfully');
				}else{
					debug('failed to create new mather which is required');
				}
			});
		}else{
			debug("Matcher already exists");
		}
	})	
}



//Exportation of module
module.exports = matcher;