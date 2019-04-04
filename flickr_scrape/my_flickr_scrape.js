
const d3 = require("./libs/d3.v5.min.js");
const fs = require('fs');
global.fetch = require("node-fetch");
var parksJson;
var boxesJson;

//first read in files

function loadFiles(){
var rawParks = fs.readFileSync("./data/parks.geojson");
 parksJson = JSON.parse(rawParks);

var rawBoxes = fs.readFileSync("./data/parks.geojson");
 boxesJson = JSON.parse(rawParks);

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

function addPointsFromPage(pageData,parkName){
	for(var picture of pageData.photos.photo){
		geojson.features.push({
	    "type": "Feature",
	    "properties": {
	      "park": parkName,
	      "id": picture.id,
	      "title": picture.title
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

function getPhotos(box,parkName,firstTime){

	var call = `https://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&api_key=8958ae028844656f5de42bb5522abb7d&bbox=${box}&extras=geo&per_page=250&nojsoncallback=1`;
	//make call
	d3.json(call).then(function(data){
		//get total photos estimated in bounding box
	  if(firstTime){
		console.log(data.photos.photo[0]);
	  }
	  firstTime = false;


	  //check if there's more than 4000 returns(250 per page)
	  var numPages = data.photos.pages
	  var needSmallerBoxes = numPages > 16;
	  //if so split
	  if(needSmallerBoxes){
		  var children = splitBox(box);
		  //call again for each child
		  for(var smallBox of children){
		  	  getPhotos(smallBox)
		  }
	  } 
	  //otherwise store photos in json
	  else {
	  		//loop through pages
	    for(var i = 1; i<=numPages;i++){
	    	//generate call for specific page
	    	var pageCall = `https://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&api_key=8958ae028844656f5de42bb5522abb7d&bbox=${box}&extras=geo&per_page=250&nojsoncallback=1&page=${i}`
	    	//make call
	    	d3.json(pageCall).then(function(pageData){
	    		//call function to store photos from page
	    		addPointsFromPage(pageData,parkName);
	    	});
	    }
	  }

	});
}


//run process once for each park
for(var park of parksJson.features){
	
	var i = parksJson.features.indexOf(park);
	var parkName = park.properties["UNIT_NAME"];
	var firstTime = true;


	//test with just first(Olympic)
	if(i == 0){
		//build original box
		var box = [];
		var d3Bounds = d3.geoBounds(park);
		box.push(d3Bounds[0][0]);
		box.push(d3Bounds[0][1]);
		box.push(d3Bounds[1][0]);
		box.push(d3Bounds[1][1]);
		//call recursive function
		getPhotos(box,parkName,firstTime);
	  	
		}

	
}

//wait til whole thing has run, check for duplicates
setTimeout(function(){
	console.log(geojson.features);

	
  var ids= [];
  for(var photo of geojson.features){
    ids.push(photo.properties.id);
  }
  var unique = [...new Set(ids)];
  console.log(unique.length);

},15000);

/*
//push unique features to new set
	for(var photo of geojson.features){
    var add = true;
	    for(var uniqFeature of unique.features){
	        if(photo.properties.id == uniqFeature.properties.id) add = false;
	        if(add) unique.features.push(photo)
	    }
    
	}
*/
		//use turf pointsWithinPolygon to filter out points outside
        //var ptsWithin = turf.pointsWithinPolygon(points, searchWithin);







