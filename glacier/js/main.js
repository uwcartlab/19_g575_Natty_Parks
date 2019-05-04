function wrapper(){

var boundary, path, pathPoint, projection;

var svg = d3.select("div.map")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%");
            
var w = $("div.map").width();
var h = $("div.map").height();
var center;


//whenever current park is updated, this function is called
window.makeMap = function(park_name) {

  svg.selectAll("path").remove(); //clear map
  var filename = park_name.replace( / /g, "_") + ".json"; //get filename
  Promise.all([
    d3.json("../flickr_scrape/scraper/input_data/parks.json"),
    d3.json("../flickr_scrape/scraper/input_data/boxes.geojson"),
    d3.json("../flickr_scrape/data/" + filename),
  ]).then(function([parks, boxes, photos]) {
          
          //find park in the json file, and get projection
          for (var i = 0; i < parks.features.length; i = i+1) {
            if (parks.features[i].properties.UNIT_NAME === park_name) getProjection(boxes.features[i]);
          }
          loadPark(parks);
          loadPhotos(photos);
          svg.selectAll("path")
          .call(d3.zoom().on("zoom", function () {
              svg.selectAll("path").attr("transform", d3.event.transform);
              svg.selectAll("g").attr("transform", d3.event.transform);
            }));
          $("div.loading").html("");
          });
          $("div.loading").append("loading...");
          displayInfo(park_name);
}  


//add arrows
function displayInfo(park) {

  //(calculate previous and next park)
  var previous, next;
  for (var i = 0; i < parks.length; i++) {
    if (park === parks[i]) {
      if (i != 0) previous = parks[i-1];
      else previous = "";
      if (i != parks.length - 1) next = parks[i+1];
      else next = "";
    }
  }

//TODO: display info: number of photos, visitors, area, miles of road, photo of park, violin plot?
//this should probably all go on the left side

  data = d3.csv("../park characteristics/data/characteristics.csv");

  //display park name at top, and update previous/next buttons
  $("div.parkname").html("");
  $("div.parkname").append(park);
  $("div.next").html("");
  $("div.previous").html("");
  if (next != "") $("div.next").append('<button class="skip" id="nextbutton">Next (' + next + ')</button>');
  if (previous != "") $("div.previous").append('<button class="skip" id="previousbutton">Previous (' + previous + ')</button>');
  $(".skip").click(function() {
    if ($(this).attr('id') == 'nextbutton') makeMap(next);
    else if ($(this).attr('id') == 'previousbutton') makeMap(previous);
  });
}


//function that makes projection based on park coordinates
function getProjection(park) {

  var center;
  var coords = park.geometry.coordinates[0];
  center = [(coords[0][0] + coords[1][0]) / 2, (coords[1][1] + coords[2][1]) / 2];

  console.log(coords);
  console.log(center);

  var height = coords[2][1] - coords[1][1];
  var parallel_one = coords[1][1] + (1/3)*(height);
  var parallel_two = coords[1][1] + (2/3)*(height);
  console.log(parallel_one);
  console.log(parallel_two);



  projection = d3.geoConicEqualArea()
                      .parallels([parallel_one, parallel_two])
                      .rotate([-center[0],0,0])
                      .scale(35000 * (1/height))
                   //   .fitSize([w, h], park.geometry)
                      .center([0,center[1]])
                      .translate([w/2,h/2]);

  path = d3.geoPath().projection(projection);
  pathPoint = d3.geoPath();
}


//console.log(w);
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



//loads all the photos of a park
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
  svg.selectAll(".photos")
      .data(photos)
      .enter()
      .append("path")
      .attr("fill", function(d){
        return "#253494";})
//       //   if(d.properties["100m"]){
  
//       //     return "#253494";
//       //   } else if (d.properties["500m"]) {
     
//       //     return "#259458";
//       //   } else if (d.properties["1000m"]) {
      
//       //     return "#259458";
//       //   } 
//       //   else if (d.properties["6000m"]) {
        
//       //     return "#259458";
//       //   }else {
      
//       //     return "#929425";
//       //   }
//       // })
            .attr("opacity", .5)
            .attr("d", path.pointRadius(.5));

svg.selectAll(".photos")
      .data(photos)
      .enter()
      .append("path")
      .attr("fill", "white")
            .attr("opacity", 1)
            .attr("d", path.pointRadius(.15))
            


//hexagons:
  // svg.append("g")
  //       .attr("class", "hexagon")
  //       .selectAll(".hex")
  //       .data(hexbin(photos))
  //       .enter()
  //       .append("path")
  //       .attr("d", function(d){
  //         return hexbin.hexagon(radiusScale(700));
  //       })
  //       .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
  //       .attr("fill", function(d){
  //         return colorScale(logScale(d.length));
  //       })
  //       .attr("opacity", 1);
        


  //       svg.append("g")
  //       .attr("class", "hexagon")
  //       .selectAll(".hex")
  //       .data(hexbin(photos))
  //       .enter()
  //       .append("path")
  //       .attr("d", function(d){
  //         return hexbin.hexagon(radiusScale(200));
  //       })
  //       .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
  //       .attr("opacity", function(d){
  //         return logScale(d.length);
  //       })
  //       .attr("fill", "white");



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
      .attr("stroke", "#ddd");
      

      
}



}
window.onload = wrapper();
