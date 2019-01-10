/*
* All Data storing and Maniplations methods
*
*/

//Dependendices
var fs = require('fs');
var path = require('path')
var helpers = require('./helpers');
var util = require('util');
var debug = util.debuglog('data');

//Container of the module
lib = {};

lib.baseDir = path.join(__dirname,'/./../.data/');

lib.create = (dir,filename,data,callback)=>{
	//open file for writing
	fs.open(lib.baseDir+dir+'/'+filename+'.json','wx',(err,fileDescriptor)=>{
		if(!err && fileDescriptor){
			//stringifying the data to be written to the file
			var stringData = JSON.stringify(data);
			//writing to the fileDescriptor
			fs.writeFile(fileDescriptor,stringData,(err)=>{
				if(!err){
					//close the file 
					fs.close(fileDescriptor,err=>{
						if(!err){
							callback(false);
						}else{
							callback('Failed to close the file');
						}
					});
				}else{
					callback('Failed to write to the file');
				}
			});
		}else{
			callback('Failed to open file for writing ');
		}
	});
};

lib.read = (dir,filename,callback)=>{
	//reading the file
	fs.readFile(lib.baseDir+dir+'/'+filename+'.json','utf8',(err,data)=>{
		if(!err && data){
						//pasring the data to be returned to the caller
			var dataOject = helpers.parseJson(data);
			callback(false,dataOject);
		}else{
			callback('Failed to read the file');
		}
	})
};

lib.update =(dir,filename,data,callback)=>{
	//opening file to update
	fs.open(lib.baseDir+dir+'/'+filename+'.json','r+',(err,fileDescriptor)=>{
	//continue if no err
	if(!err && fileDescriptor){
		//truncate contents of the file
		fs.ftruncate(fileDescriptor,err=>{
			if(!err){
				//stringify the new data
				var stringData = JSON.stringify(data);
				//writing the new data
				fs.writeFile(fileDescriptor,stringData,err=>{
					if(!err){
						//closing the file
						fs.close(fileDescriptor,err=>{
							if(!err){
								callback(false);
							}else{
								callback('Failed to close the  file');
							}
						});
					}else{
						callback('Failed to write new data to file');
					}
				})
			}else{
				callback('Failed to truncate the file');
			}
		});
	}else{
		callback('failed to open file for updating');
	}	
	});
};

lib.delete = (dir,filename,callback)=>{
	fs.unlink(lib.baseDir+dir+'/'+filename+'.json',err=>{
		if(!err){
			callback(false);
		}else{
			callback('Faile to delete file');
		}
	})
	
	
};

lib.list = (dir,callback)=>{
	//reading files in a directory supplied
	fs.readdir(lib.baseDir+dir,(err,fileList)=>{
		if(!err && fileList){
			//reading data from each file and adding the returned data into a new Array
			var dataList = [];
			for(i=0;i<fileList.length;i++){
				var file = fileList[i]
				var content = fs.readFileSync(lib.baseDir+dir+'/'+file,'utf8');
				//parsing the content from string to js object
				parsedContent = JSON.parse(content);
				//adding the parsed content to an Array
				dataList.push(parsedContent);
			}
			callback(false,dataList);
		}else{
			callback('Failed to get the file list');
		}

	})
};

lib.listDocs =  (dir,callback)=>{
	fs.readdir(lib.baseDir+dir,(err,docsList)=>{
		if(!err && docsList){
			callback(false,docsList);
		}else{
			callback("failed to read the collection");
		}
	})
}





//Exportation of the  module
module.exports = lib;