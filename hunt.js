var request = require('request');
var parseString = require('xml2js').parseString;

var RootKeys = false;
var Size = '37';

var keys = []

var objectKeys = {}

function getKeys(NextContinuationToken) {
	var url = 'https://s3-us-west-2.amazonaws.com/2016reinventscavengerhunt/?list-type=2';

	if(NextContinuationToken) {
		url = url + '&NextContinuationToken=' + NextContinuationToken;
	}
	
	console.log(url);
	console.log('Grabbing keys');
	console.log(Object.keys(objectKeys).length);

	request.get(url, function(err, data, resp){

		parseString(data['body'], function (err, result) {
			RootKeys = result['ListBucketResult']['Contents'];
	    	var length = RootKeys.length;

	    	for (var i=0;i<length;i++){
	    		var obj = RootKeys[i];
	    		if(obj['Size'] != '37') {
	    			console.log('HALP SIZE WRONG');
	    			process.exit();
	    		}

	    		objectKeys[obj['Key']] = true;

	    		keys.push(obj['Key']);    	
    		}

			if(result['ListBucketResult']['NextContinuationToken'][0]) {
				getKeys(result['ListBucketResult']['NextContinuationToken'][0]);
			}
			else {

			}
	
	    	//processKey(0);
		});
	});	
}


function processKey(i) {
	request.get('https://s3-us-west-2.amazonaws.com/2016reinventscavengerhunt/' + keys[i], function(err, data, resp){
		console.log(keys[i]);

		var response = data['body'].replace(/\s/g, '');

		if(response != keys[i][0]){
			console.log(response);
			console.log(keys[i][0]);
		}
		
		var newKey = i + 1;
		if(keys[newKey]) {
			processKey(newKey);
		}
	});
}

getKeys(false);