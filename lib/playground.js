var fs = require('fs');
var path = require('path')
var _data = require('./data');
var baseDir = path.join(__dirname,'/./../.data/');
var {calculateCartTotal} = require('./handlers/orders');
/*
var content = fs.readFileSync(baseDir+'users'+'/s9j41yv5h2qzj7wbek8z.json','utf8');

console.log(content);


fs.readdir(baseDir+'users',(err,fileList)=>{
		if(!err && fileList){
			//reading data from each file and adding the returned data into a new Array
			var dataList = [];
			for(i=0;i<fileList.length;i++){
				var file = fileList[i]
				var content = fs.readFileSync(baseDir+'users'+'/'+file,'utf8');
				parsedContent = JSON.parse(content);
				dataList.push(parsedContent);
			}
			//callback(false,dataList);
				console.log(dataList);
		}else{
			//callback('Failed to get the file list');
		}
	})
	

	
	function readFilePromise(dir,file){
		return new Promise((resolve,reject)=>{
			fs.readFile(baseDir+dir+'/'+file+'.json','utf8',(err,data)=>{
				err ? reject(err) : resolve(data);
			})
		})
	}
	
	
	readFilePromise('users','zr9z8m58sfj7a3w5yo9g').then(result=>console.log(result)).catch(err=>console.log(err));
	
	
function verifyToken(tokenId){
	return new Promise((resolve,reject)=>{
		_data.read('tokens',tokenId,(err,tokenData)=>{
			err ? reject(err) : resolve(tokenData);
		})
	})
}	
	
	
verifyToken('mpbs82ot2uajqnkb48dj').then(result=>console.log(true)).catch(err=>console.log(false));	

	


var couple = [{name:'dellan',age:23},{name:'sandra',age:21}]

//console.log(couple.find('dellan'));
 
const sandra = couple.find(person=>person.name=='sandra');
const position =  couple.indexOf(sandra);

console.log(position);


*/

var cartItems = [
{'mealId':'gsioghghorot','price':3.0,'quantity':3},
{'mealId':'lggssghiishie','price':2.0,'quantity':3}
]

var total = calculateCartTotal(cartItems);
console.log(total);







 