const fs = require('fs');

var parks = JSON.parse(fs.readFileSync("./data/parks.geojson"));
var parkNames = parks.features.map(park=>park.properties["UNIT_NAME"].replace(/ /g, "_"));

var fullGeojson = {
    type: "FeatureCollection",
    features: [],
    };

var totalFeatures = 0;

for(var parkName of parkNames){
	  console.log(parkName);
      //load photos for appropriate park
      var parkPhotos = JSON.parse(fs.readFileSync(`./intersect_output/${parkName}.json`));
      console.log(parkPhotos.features.length);
      totalFeatures+=parkPhotos.features.length;
      //push photos to big json   
      for(var photo of parkPhotos.features){
      	 fullGeojson.features.push(photo);
      }

}
console.log(fullGeojson);
//after pushing all photos, save new file

  //for huge json need to increase memory
  //node --max_old_space_size=2000  joiner.js 
      let data = JSON.stringify(fullGeojson);
      fs.writeFileSync(`./allPhotos.json`,data);
      