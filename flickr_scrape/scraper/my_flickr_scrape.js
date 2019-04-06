
const d3 = require("./libs/d3.v5.min.js");
const fs = require('fs');
const turf = require('@turf/turf')
global.fetch = require("node-fetch");
var parksJson;
var parkName;

//first read in files

function loadFiles(){
var rawParks = fs.readFileSync("./data/parks.geojson");
 parksJson = JSON.parse(rawParks);

}
loadFiles();

var geojson = {
    type: "FeatureCollection",
    features: [],
    };

var unique = {
    type: "FeatureCollection",
    features: [],
    };

function addPointsFromPage(pageData,specParkName){
	console.log(specParkName);
	for(var picture of pageData.photos.photo){
		geojson.features.push({
	    "type": "Feature",
	    "properties": {
	      "park": specParkName,
	      "id": picture.id,
	      "title": picture.title,
	      "accuracy": +picture.accuracy,
	      "date_taken": picture.datetaken,
	      "date_granularity": picture.datetakengranularity
	    },
	    "geometry": {
	      "type": "Point",
	      "coordinates": [parseFloat(picture.longitude), parseFloat(picture.latitude)]
	    }
	  });

	}
}

function splitBox(big){
   var children = [];
   var box1 = [big[0], (big[1]+big[3])/2, (big[0]+big[2])/2, big[3]];
   var box2 = [(big[0]+big[2])/2, (big[1]+big[3])/2, big[2], big[3]];
   var box3 = [big[0], big[1], (big[0]+big[2])/2, (big[1]+big[3])/2];
   var box4 = [(big[0]+big[2])/2, big[1], big[2], (big[1]+big[3])/2];
   children.push(box1,box2,box3,box4);
   return children;

}

function checkWithin(photos){
	var photosWithin = turf.pointsWithinPolygon(photos, parksJson);
	return photosWithin;

}

function getPhotos(box,specParkName){

	var call = `https://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&api_key=8958ae028844656f5de42bb5522abb7d&bbox=${box}&accuracy=16&extras=geo,date_taken&per_page=250&nojsoncallback=1`;
	//make call
	d3.json(call).then(function(data){
	  //check if there's more than 4000 returns(250 per page)
	  var numPages = data.photos.pages
	  var needSmallerBoxes = numPages > 16;
	  //if so split
	  if(needSmallerBoxes){
		  var children = splitBox(box);
		  //call again for each child
		  for(var smallBox of children){
		  	  getPhotos(smallBox,specParkName)
		  }
	  } 
	  //otherwise store photos in json
	  else {
	  		//loop through pages
	    for(var i = 1; i<=numPages;i++){
	    	//generate call for specific page
	    	var pageCall = `https://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&api_key=8958ae028844656f5de42bb5522abb7d&bbox=${box}&accuracy=16&extras=geo,date_taken&per_page=250&nojsoncallback=1&page=${i}`
	    	//make call
	    	d3.json(pageCall).then(function(pageData){
	    		//call function to store photos from page
	    		addPointsFromPage(pageData,specParkName);
	    	});
	    }
	  }

	});
}

var parkNames = parksJson.features.map(park=>park.properties["UNIT_NAME"].replace(/ /g, "_"));
console.log(parkNames);
//2(Everglades), wolf trap consider dropping
var n = 2;



//run process once for each park
for(var park of parksJson.features){
	
	var i = parksJson.features.indexOf(park);

	if(i == n){

		var specParkName = park.properties["UNIT_NAME"].replace(/ /g, "_");
		//build original box
		var box = [];
		var d3Bounds = d3.geoBounds(park);
		box.push(d3Bounds[0][0]);
		box.push(d3Bounds[0][1]);
		box.push(d3Bounds[1][0]);
		box.push(d3Bounds[1][1]);
		//call recursive function
		getPhotos(box,specParkName);

	}
		
	
}


//wait til whole thing has run, check for duplicates and inside park
		setTimeout(function(){
	  	//check if within parks layer
	  	//geojson.features = checkWithin(geojson);


		var uniqueFeatures = [];
		var map = new Map();

		for (var photo of geojson.features) {
		    if(!map.has(photo.properties.id)){
		        map.set(photo.properties.id, true);    // set any value to Map
		        uniqueFeatures.push(photo);
		    }
		}

		unique.features = uniqueFeatures;
		console.log(unique.features);

		  let data = JSON.stringify(unique);
		  fs.writeFileSync(`output/${parkNames[n]}.json`,data);

		},30000);
        







