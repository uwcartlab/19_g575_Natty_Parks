const d3 = require("./libs/d3.v5.min.js");
const fs = require('fs');
const turf = require('@turf/turf')

var parks = JSON.parse(fs.readFileSync("./data/parks.geojson"));
var parkNames = parks.features.map(park=>park.properties["UNIT_NAME"].replace(/ /g, "_"));

for(var i=46; i<parkNames.length;i++){

      //get reference to park feature
      var park = parks.features[i];
      console.log(park.properties["UNIT_NAME"]);
      //load photos for appropriate park
      var parkPhotos = JSON.parse(fs.readFileSync(`./output/${parkNames[i]}.json`));
      console.log(parkPhotos.features.length);
      //calculate intersection
      var within =turf.pointsWithinPolygon(parkPhotos, park);
      console.log(within.features.length);

      let data = JSON.stringify(within);
      fs.writeFileSync(`intersect_output/${parkNames[i]}.json`,data);


}

