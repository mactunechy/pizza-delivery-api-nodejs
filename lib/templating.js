/*
*All templating related tasks
*
*/


//Dependencies
var {globals} = require('./config.js');
var fs = require('fs');
var path =require('path');
var util = require('util')
var debug = util.debuglog('gui');
//Container of the module
var lib = {};
lib.baseDir = path.join(__dirname,'/./../templates/');


//getting the main template page
lib.getTemplate = (template,data,callback)=>{
	//read the template from the fileSystem
	fs.readFile(lib.baseDir+template+'.html','utf8',(err,str)=>{
		if(!err && str ){
			// rep  the footer and header around the template string
			lib.baseTemplating(str,(err,str)=>{
				if(!err && str && str.length > 0 ){
					//Sending to the  template intepolator function
					lib.interpolate(str,data,(err,finalString)=>{
						if(!err && finalString && finalString.length > 0){
							callback(false,finalString);
						}else{
							console.log(err);
						}
					});
				}else{
					console.log('Failed to rep footer and header around the str');
				}
			})
		}else{
			console.log('Failed to open the template');
		}
	});
};


lib.getSnippet = (templateName)=>{
	templateName = typeof(templateName)=='string' && templateName.length > 0? templateName+'.html':false;
	var snippetDir = lib.baseDir+'snippets/';
	if(templateName){
		var snippet = fs.readFileSync(snippetDir+templateName,'utf8');
		return snippet;
	}else{
		console.log('templateName invalid');
	}
}







lib.replaceAll = (str, find, replace)=> {
    return str.replace(new RegExp(find, 'g'), replace);
}




//Adding the foolter and the header
lib.baseTemplating = (str,callback)=>{
	//reading the footer
	var footer = fs.readFileSync(lib.baseDir+'includes/footer.html','utf8');
	var header = fs.readFileSync(lib.baseDir+'includes/header.html','utf8');
	if (typeof(footer)=='string' && typeof(header) == 'string'){
		var newString = header+str+footer;
		callback(false,newString);
	}else{
		console.log('failed to read the footer and header html files');
	}
	
};

lib.interpolate = (str,data,callback) =>{
	str = typeof(str)== 'string' && str.length > 0 ? str :false;
	if(str){
		//adding the globals to the data object
		for (key in globals ){
			if(globals.hasOwnProperty(key)){
			data['globals.'+key] = globals[key];
			
			}
	
		}
		//performinh the interpolation of all the variables
		for(key in data ){
			if(data.hasOwnProperty(key)){
				var find = '{'+key+'}';
				var replace = data[key]
				str = lib.replaceAll(str,find,replace);
			}
		}
		//Done callback the new string to the caller
		callback(false,str);
		
	}
};


lib.getStaticFile = (filePath,callback)=>{
	//modifying directory for staticFiles
	var staticFileBaseDir = lib.baseDir.replace('templates','public');
	//determing the contentType of the file 
	if(filePath.indexOf('.css')>-1){
		var contentType = 'css'
	}
	if(filePath.indexOf('.js')>-1){
		var contentType = 'javascript'
	}
	if(filePath.indexOf('.ico')>-1){
		var contentType = 'favicon'
	}
	if(filePath.indexOf('.jpg')>-1){
		var contentType = 'jpg'
	}
	if(filePath.indexOf('.png')>-1){
		var contentType = 'png'
	}
	//reading the file
	fs.readFile(staticFileBaseDir+filePath,'utf8',(err,str)=>{
		if(!err && str ){
			callback(false,str,contentType);
		}else{
			callback('false to read file');
		}
	})
}









//Exportation of the module
module.exports = lib;