function wrapper(){

var boundary, path, pathPoint, projection;

var svg = d3.select("div.map")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .call(d3.zoom().on("zoom", function () {
              svg.attr("transform", d3.event.transform);
            }))
            .append("g");

var w = $("div.map").width();
var h = $("div.map").height();
var center;




//when current park is updated, reload this
window.makeMap = function(park_name) {

  svg.selectAll("path").remove(); //clear map
  var filename = park_name.replace( / /g, "_") + ".json"; //get filename
  Promise.all([
    d3.json("../flickr_scrape/scraper/input_data/parks.json"),
    d3.json("../flickr_scrape/scraper/input_data/boxes.geojson"),
    d3.json("../flickr_scrape/data/" + filename),
  ]).then(function([park, boxes, photos]) {
          //find park in the json file, and get projection
          for (var i = 0; i < park.features.length; i = i+1) {
            if (park.features[i].properties.UNIT_NAME === park_name) getProjection(boxes.features[i]);
          }
          loadPark(park);
          loadPhotos(photos);
          });
}  


//function that makes projection based on park coordinates
function getProjection(park) {

  var center;
  var coords = park.geometry.coordinates[0];
  center = [(coords[0][0] + coords[1][0]) / 2, (coords[1][1] + coords[2][1]) / 2];

  console.log(coords);
  console.log(center);



  projection = d3.geoConicEqualArea()
                      .parallels([center[1]-.4,center[1]+.4])
                      .rotate([-center[0],0,0])
                      .scale(35000)
                      .center([0,center[1]])
                      .translate([w/2,h/2]);

  path = d3.geoPath().projection(projection);
  pathPoint = d3.geoPath();
}

//not currently being used, just for testing:
//load states boundary file
// $.getJSON("data/us-states.geojson",
//   function(d) {
//      svg.selectAll(".states")
//       .data(d.features)
//       .enter()
//       .append("path")
//       .attr("d", path)
//       .attr("fill", "#aaa")
//       .attr("stroke", "#ddd");



//       //plot points for each national park
//       $.getJSON("data/park_coordinates.geojson",
//         function(d) {
//           svg.selectAll("circle")
//             .data(d.features)
//             .enter()
//             .append("circle")
//             .attr('r',5)
//             .on("click", clicked)
//             .attr('cx',function(d) { return albersGlacier(d.geometry.coordinates)[0]})
//             .attr('cy',function(d) { return albersGlacier(d.geometry.coordinates)[1]});
//         });
//   });






//not currently being used (ignore)
function clicked(d) {
  
  var x, y, k;

  if (d && center !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 10;
    center = d;
  } else {
    x = w / 2;
    y = h / 2;
    k = 1;
    center = null;
  }
    svg.selectAll("path")
      .classed("active", center && function(d) { return d === center; });

  svg.transition()
      .duration(750)
      .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}      



console.log(w);
//hexbin generator
var hexbin = d3.hexbin()
    .extent([[0, 0], [w, h]])
    .x(function x(d){
      return d.properties.x;
    })
    .y(function y(d){
      return d.properties.y;
    })
    .radius(2);


var radiusScale = d3.scaleSqrt()
    .range([0, 2]);

var colorScale = d3.scaleSequential(d3.interpolateMagma);

var logScale = d3.scaleLog()
          .range([.25,1]);


function loadPhotos(photos) {
  photos=photos.features;


  for(photo of photos){
    point=projection(photo.geometry.coordinates);
      photo.properties["x"]= point[0];
      photo.properties["y"]= point[1];
    }

//  console.log(photos);
//  console.log(hexbin(photos));
//  console.log(d3.extent(hexbin(photos),bin => bin.length));


  radiusScale.domain(d3.extent(hexbin(photos),bin => bin.length));
  logScale.domain(d3.extent(hexbin(photos),bin => bin.length));

//add points

//will uncomment once we have distance data
  // svg.selectAll(".photos")
  //     .data(photos)
  //     .enter()
  //     .append("path")
  //     .attr("fill", function(d){
  //       if(d.properties["100m"]){
  
  //         return "#253494";
  //       } else if (d.properties["500m"]) {
     
  //         return "#259458";
  //       } else if (d.properties["1000m"]) {
      
  //         return "#259458";
  //       } 
  //       else if (d.properties["6000m"]) {
        
  //         return "#259458";
  //       }else {
      
  //         return "#929425";
  //       }
  //     })
  //           .attr("opacity", .5)
  //           .attr("d", path.pointRadius(.5));

svg.selectAll(".photos")
      .data(photos)
      .enter()
      .append("path")
      .attr("fill", "white")
            .attr("opacity", 1)
            .attr("d", path.pointRadius(.15))
            


/*
  svg.append("g")
        .attr("class", "hexagon")
        .selectAll(".hex")
        .data(hexbin(photos))
        .enter()
        .append("path")
        .attr("d", function(d){
          return hexbin.hexagon(radiusScale(700));
        })
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .attr("fill", function(d){
          return colorScale(logScale(d.length));
        })
        .attr("opacity", 1);
*/        

/*
        svg.append("g")
        .attr("class", "hexagon")
        .selectAll(".hex")
        .data(hexbin(photos))
        .enter()
        .append("path")
        .attr("d", function(d){
          return hexbin.hexagon(radiusScale(200));
        })
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .attr("opacity", function(d){
          return logScale(d.length);
        })
        .attr("fill", "white");
*/


}

//load boundary file
function loadPark(park) {

  boundary=park.features;

  svg.selectAll(".boundary")
      .data(boundary)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "#111")
      .attr("stroke", "#ddd")
      .on("click", clicked);

      
}



}
window.onload = wrapper();
