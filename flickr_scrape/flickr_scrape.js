var d3 = require("./libs/d3.v5.min.js");

var Switcher = function(){

};

//given json, property to filter on, targets, target property values
//c1.json, "NAME10", "Sheridan County", "Finney County", ["tweets", "tweetClass"]
Switcher.prototype.details = function(json, propFilterOn, target1, target2, propArray){
	
	console.log(json.features.filter(feature=>feature.properties["NAME10"]=="Sheridan County"));

	//create empty arrays for original values
	var ogFirst = [];
	var ogSecond = [];

	//loop through and store index and values we need
	for(var detail of json.features){
		var i = json.features.indexOf(detail);
		var store = {};

		if(detail.properties[propFilterOn] == target1){
			store[propArray[0]] = detail.properties[propArray[0]];
			store[propArray[1]] = detail.properties[propArray[1]];
			store["ogIndex"] = i;
			ogFirst.push(store);

		} else if(detail.properties[propFilterOn] == target2){
			store[propArray[0]] = detail.properties[propArray[0]];
			store[propArray[1]] = detail.properties[propArray[1]];
			store["ogIndex"] = i;
			ogSecond.push(store);

		}
	}

	for(var i=0; i<ogFirst.length; i++){
		var index1 = ogFirst[i]["ogIndex"];
		var index2 = ogSecond[i]["ogIndex"];
		
		for(var prop of propArray){
			json.features[index1].properties[prop] = ogSecond[i][prop];
			json.features[index2].properties[prop] = ogFirst[i][prop];
			
		}
	}

	//console.log(json.features.filter(feature=>feature.properties["NAME10"]=="Sheridan County"));
	return json;

};

Switcher.prototype.counties = function(json, propFilterOn, target1, target2, propArray){
	

	//create empty arrays for original values
	var ogFirst;
	var ogSecond;

	//loop through and store index and values we need
	for(var county of json.features){
		var i = json.features.indexOf(county);
		var store = {};

		if(county.properties[propFilterOn] == target1){
			store[propArray[0]] = county.properties[propArray[0]];
			store[propArray[1]] = county.properties[propArray[1]];
			store["ogIndex"] = i;
			ogFirst = store;

		} else if(county.properties[propFilterOn] == target2){
			store[propArray[0]] = county.properties[propArray[0]];
			store[propArray[1]] = county.properties[propArray[1]];
			store["ogIndex"] = i;
			ogSecond = store;

		}
	}
	
		for(var prop of propArray){
			json.features[ogFirst["ogIndex"]].properties[prop] = ogSecond[prop];
			json.features[ogSecond["ogIndex"]].properties[prop] = ogFirst[prop];
			
		}
	
	return json;

};

module.exports = Switcher;