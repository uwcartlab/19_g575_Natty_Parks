function wrapper(){

var all = [];
var sumstat;
var boundaries;
var boxes;
var parkChar;
var boundary, path, pathPoint, projection;
var mapViolin;
var yellowstone;
var yellowW;
var yellowH;

var allParkNames  = [];
//parks with over 5,000 photos
var parkNames = [
  "Olympic_National_Park",
  "Acadia_National_Park",
  "Everglades_National_Park",
  "Great_Smoky_Mountains_National_Park",
  "Redwood_National_Park",
  "Shenandoah_National_Park",
  "Bryce_Canyon_National_Park",
  "Yellowstone_National_Park",
  "Sequoia_National_Park",
  "Channel_Islands_National_Park",
  "Canyonlands_National_Park",
  "Kings_Canyon_National_Park",
  "Capitol_Reef_National_Park",
  "Joshua_Tree_National_Park",
  "Pinnacles_National_Park",
  "Death_Valley_National_Park",
  "Lassen_Volcanic_National_Park",
  "Badlands_National_Park",
  "Mount_Rainier_National_Park",
  "Yosemite_National_Park",
  "Haleakala_National_Park",
  "Carlsbad_Caverns_National_Park",
  "Zion_National_Park",
  "Crater_Lake_National_Park",
  "Glacier_National_Park",
  "Saguaro_National_Park",
  "Grand_Teton_National_Park",
  "Petrified_Forest_National_Park",
  "Big_Bend_National_Park",
  "Rocky_Mountain_National_Park",
  "Arches_National_Park",
  "Grand_Canyon_National_Park",
  "Mesa_Verde_National_Park",
  "Virgin_Islands_National_Park",
  `Hawaii_Volcanoes_National_Park`,
  "Cuyahoga_Valley_National_Park",
  "Glacier_Bay_National_Park",
  "Denali_National_Park"
];

 parkNames = [
 "Acadia_National_Park",
  "Arches_National_Park",
  "Badlands_National_Park",
  "Big_Bend_National_Park",
  "Bryce_Canyon_National_Park",
  "Canyonlands_National_Park",
  "Capitol_Reef_National_Park",
  "Carlsbad_Caverns_National_Park",
  "Crater_Lake_National_Park",
  "Cuyahoga_Valley_National_Park",
  "Denali_National_Park",
  "Everglades_National_Park",
  "Glacier_Bay_National_Park",
  "Glacier_National_Park",
  "Grand_Teton_National_Park",
  "Great_Smoky_Mountains_National_Park",
  "Haleakala_National_Park",
  `Hawaii_Volcanoes_National_Park`,
  "Kings_Canyon_National_Park",
  "Lassen_Volcanic_National_Park",
  "Mesa_Verde_National_Park",
  "Mount_Rainier_National_Park",
  "Olympic_National_Park",
  "Petrified_Forest_National_Park",
  "Pinnacles_National_Park",
  "Redwood_National_Park",
  "Rocky_Mountain_National_Park", 
  "Sequoia_National_Park",
  "Shenandoah_National_Park",
  "Yellowstone_National_Park",
  "Yosemite_National_Park",
  "Zion_National_Park"  
];


//console.log(w);
//hexbin generator
var hexbin = d3.hexbin()
    .extent([[0, 0], [w, h]])
    .x(function x(d){
      return d.x;
    })
    .y(function y(d){
      return d.y;
    })
    .radius(1);


var radiusScale = d3.scaleSqrt()
    .range([0, 2]);


var myInterpolator = d3.interpolateHsl("hsl(60, 24%, 99%)", "hsl(209, 100%, 100%)");

var colorScale = d3.scaleSequential(d3.interpolateMagma);
var colorScale2 = d3.scaleSequential(myInterpolator)
//colorScale =  d3.scaleSequential(d3.interpolateYlOrRd);

var logScale = d3.scaleLog()
          .range([.35,1]);

d3.select("div.violinPhoto")
        .on("mouseover", function(d){
          d3.select(this).style("opacity",1)
        })
        .on("mouseout", function(d){
          if(highlight){
             d3.select(this).style("opacity",0.8);
          }
         
        }).on("click", function(d){
              backToViolin();
        });

function backToViolin(){
    highlight = false;

    violinGroup.attr("opacity", 1).style("pointer-events", "auto");
    mapGroup.attr("opacity", 0).style("pointer-events", "none");
    d3.select("div.mapInfo").style("opacity", 0);
    d3.select("div.violinPhoto").style("pointer-events", "none").style("opacity", 0);
    d3.select("p.centerText").style("opacity", 1);
    mapViolin.remove();
    d3.selectAll(".mapViolin").remove();
    d3.select("p.visitors").html("");
    d3.select("p.area").html("");

}


//function that makes projection based on park coordinates
function getProjection(park,yellowstone) {

  console.log(park);
  var name = park.properties["UNIT_NAME"];

  var center;
  var coords = park.geometry.coordinates[0];
  //console.log(park.geometry.coordinates);
  center = [(coords[0][0] + coords[1][0]) / 2, (coords[1][1] + coords[2][1]) / 2];

  var height = coords[2][1] - coords[1][1];
  var width = coords[1][0] - coords[0][0];
  var parallel_one = coords[1][1] + (1/3)*(height);
  var parallel_two = coords[1][1] + (2/3)*(height);




  projection = d3.geoConicEqualArea()
                      .parallels([parallel_one, parallel_two])
                      .rotate([-center[0],0,0])
                      .scale(35000 * (0.8/height))
                   //   .fitSize([w, h], park.geometry)
                      .center([0,center[1]])
                      .translate([w/2,h/2]);

  if(name == "Crater Lake National Park"){
    console.log("crater");

     projection = d3.geoConicEqualArea()
                      .parallels([parallel_one, parallel_two])
                      .rotate([-center[0],0,0])
                      .scale(65000 * (0.8/height))
                   //   .fitSize([w, h], park.geometry)
                      .center([0,center[1]])
                      .translate([w/2,h/2-75]);

  }

  if(name == "Badlands National Park"){

     projection = d3.geoConicEqualArea()
                      .parallels([parallel_one, parallel_two])
                      .rotate([-center[0],0,0])
                      .scale(35000 * (0.8/height))
                   //   .fitSize([w, h], park.geometry)
                      .center([0,center[1]])
                      .translate([w/2+75,h/2]);

  }

  if(name == "Hawaii Volcanoes National Park"){

     projection = d3.geoConicEqualArea()
                      .parallels([parallel_one, parallel_two])
                      .rotate([-center[0],0,0])
                      .scale(28000 * (0.8/height))
                   //   .fitSize([w, h], park.geometry)
                      .center([0,center[1]])
                      .translate([w/2,h/2]);

  }



  if(yellowstone){
    console.log("yellowstone");

    projection = d3.geoConicEqualArea()
                      .parallels([parallel_one, parallel_two])
                      .rotate([-center[0],0,0])
                      .scale(35000 * (0.7/height))
                   //   .fitSize([w, h], park.geometry)
                      .center([0,center[1]])
                      .translate([yellowW/2,yellowH/2]);

  }

  path = d3.geoPath().projection(projection);
  pathPoint = d3.geoPath();

  var botLeft = park.geometry.coordinates[0][0];
  var botRight = park.geometry.coordinates[0][1];

  var botLeftPix = projection(botLeft);
  var botRightPix = projection(botRight);
  
  var distancePix = botRightPix[0]- botLeftPix[0];
  // console.log(distancePix);

  // console.log(botLeftPix);
  // console.log(botRightPix);
  
  // console.log(botLeft);
  // console.log(botRight);

  var distance = d3.geoDistance(botLeft,botRight)*6371000;

  // console.log(distance);
  // console.log(distance/distancePix);

}


//loads all the photos of a park
function drawPhotos(photos) {

  console.log(photos);
 // photos=photos.features;

  for(photo of photos){
     point=projection([photo.long,photo.lat]);
      photo.x= point[0];
      photo.y= point[1];
    }

  radiusScale.domain(d3.extent(hexbin(photos),bin => bin.length));
  logScale.domain(d3.extent(hexbin(photos),bin => bin.length));

//hexagons:
  mapGroup.append("g")
        .attr("class", "hexagon")
        .selectAll(".hex")
        .data(hexbin(photos))
        .enter()
        .append("path")
        .attr("d", function(d){
          return hexbin.hexagon(0.8);
        })
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .attr("fill", function(d){
          return colorScale(logScale(d.length));
        })
        .attr("opacity", 1);

}

//load boundary file
function drawBoundary(parkBoundary) {
 

  mapGroup.selectAll(".boundary")
      .data([parkBoundary])
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#888")
      .attr("stroke-width", 1)
      .style("filter", "url(#glow)");

  mapGroup.selectAll(".boundary")
      .data([parkBoundary])
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", "clip-area")
      .attr("fill", "#111")
      .attr("opacity", 0.5)
      .attr("stroke", "#aaa")
      .attr("stroke-width", 0.25);

           
}

function drawMapViolin(photos){

    console.log(photos);
  
  var xScale = d3.scaleLinear()
                    .range([w/4, w-w/4]);

  var yNum = d3.scaleSqrt()
    .range([0, 75]);

  var length = photos.parkLength;

    //height of violin proportional to total
    yNum.domain([0, 0.5]);
    xScale.domain(photos.xDom);

    //calculate max distance from road in miles
  var max = (photos.xDom[1]*0.000621371).toFixed(0);

//build groups
       mapViolin =  mapGroup.append("g")
           .datum(photos)
              .attr("parkLength", function(d){
                        return d.parkLength;
              })
              .attr("id", "mapViolin")
                    .attr("transform", function(d){
                        return `translate(0 ${h-h/15})`;
                    });

            mapViolin.append("path")
                .datum(function(d){ return(d.value)})     // So now we are working bin per bin
                    .style("stroke", "none")
                    .style("fill","#c9d1ff")
                    .attr("fill-opacity", 0.7)
                    .attr("d", d3.area()
                                        .y0(function(d){ 
                                          return(-1*yNum(d.length/length));
                                        })
                                        .y1(function(d){ 
                                          return(yNum(d.length/length)); 
                                        })
                                        .x(function(d){ 
                                          return(xScale(d.x0)); 
                                        })
                                        .curve(d3.curveCatmullRom)
                                        );


                //remove previous
                d3.selectAll(".mapViolin").remove();

                var axis = mapViolin.append("rect")
                          .attr("class", "mapViolin")
                          .attr("width", w/2)
                          .attr("height", 0.5)
                          .attr("x", w/4)
                          .attr("y", 0)
                          .attr("fill", "#fff");

                var labelLeft = d3.select("div.mapInfo")
                                  .append("p")
                                  .attr("class", "mapViolin")
                                  .style("position", "absolute")
                                  .style("left", w/4-55+"px")
                                  .style("top",h-h/10+"px")
                                  .style("width", "50px")
                                  .style("font-size", "12px")
                                  .style("text-align", "right")
                                  .html(`0 miles from road`);

                var labelRight = d3.select("div.mapInfo")
                                  .append("p")
                                  .attr("class", "mapViolin")
                                  .style("position", "absolute")
                                  .style("left", w-w/4+5+"px")
                                  .style("top",h-h/10+"px")
                                  .style("width", "50px")
                                  .style("font-size", "12px")
                                  .html(`${max} miles from road`);                


}


function makeYellowstone(){


   yellowW = $("div.yellowstoneMap").width();
   yellowH = $("div.yellowstoneMap").height();

  var yellowstoneSvg = d3.select("div.yellowstoneMap")
                         .append("svg")
                         .attr("width", yellowW)
                         .attr("height", yellowH);

  var boxInd = allParkNames.indexOf("Yellowstone_National_Park");
  console.log(boxInd);

  //set projection for yellowstone
  getProjection(boxes[boxInd],true);

  var parkBoundary = boundaries[boxInd];

  //draw boundary for yellowstone
    yellowstoneSvg.selectAll(".boundary")
      .data([parkBoundary])
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#888")
      .attr("stroke-width", 1)
      .style("filter", "url(#glow)");

  yellowstoneSvg.selectAll(".boundary")
      .data([parkBoundary])
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", "clip-area")
      .attr("fill", "#111")
      .attr("opacity", 0.5)
      .attr("stroke", "#aaa")
      .attr("stroke-width", 0.25);


  var photos = yellowstone;
  //draw photos for yellowstone
  for(photo of photos){
     point=projection([photo.long,photo.lat]);
      photo.x= point[0];
      photo.y= point[1];
    }

  radiusScale.domain(d3.extent(hexbin(photos),bin => bin.length));
  logScale.domain(d3.extent(hexbin(photos),bin => bin.length));

           
//hexagons:
  yellowstoneSvg.append("g")
        .attr("class", "hexagon")
        .selectAll(".hex")
        .data(hexbin(photos))
        .enter()
        .append("path")
        .attr("d", function(d){
          return hexbin.hexagon(0.8);
        })
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .attr("fill", function(d){
          return colorScale(logScale(d.length));
        })
        .attr("opacity", 1);


}

function makeYellowstoneViolin(){

  //add svg
  yellowW = $("div.yellowstoneViolin").width();
  yellowH = $("div.yellowstoneViolin").height();

  var yellowstoneViolinSvg = d3.select("div.yellowstoneViolin")
                         .append("svg")
                         .attr("width", yellowW)
                         .attr("height", yellowH);

  var yellowSumstat = [];

  console.log(yellowstone);
  var ind = parkNames.indexOf("Yellowstone_National_Park");


    var park = yellowstone;
    var parkName = parkNames[ind];
    var parkLength = park.length;

  var m = 50;
  var r = Math.min(yellowW,yellowH)/2-m;



        for(var photo of park){
            photo["name"] = parkName;

        }



    var domMax = d3.max(park.map(photo => +photo.distance));


     var log = d3.scaleLinear()
                    .domain([0,domMax])
                    //.base(10)
                    .range([yellowW/2,yellowW/2+r/2]);


      var histogram = d3.histogram()
        .domain(log.domain()) //domain
        .thresholds(log.ticks(100))  //number of bins
        .value(d => d); //value accessor

      var parkSumstat = d3.nest()  // nest function allows to group the calculation per level of a factor
        .key(function(d) { return d.name})
        .rollup(function(d) {   // For each key..
          input = d.map(function(g) { return +g.distance;})    // Keep the variable called Sepal_Length
         // console.log(input);
          bins = histogram(input)   // And compute the binning on it.
          return(bins)
        })
        .entries(park);

        //calculate max number in a bin for each park
        var maxNum = 0;
        for (var i in parkSumstat ){
             var allBins = parkSumstat[i].value
             var lengths = allBins.map(function(a){return a.length;})
             var longest = d3.max(lengths)
              if (longest > maxNum) { maxNum = longest }
        }

        //console.log(maxNum);
        parkSumstat[0]["maxNum"] = maxNum;
        parkSumstat[0]["xDom"] = log.domain();
        parkSumstat[0]["parkLength"] = parkLength;

        yellowSumstat.push(parkSumstat[0]);

        console.log(yellowSumstat);


  var photos = yellowSumstat[0];
  
  var xScale = d3.scaleLinear()
                    .range([yellowW/4, yellowW-yellowW/4]);

  var yNum = d3.scaleSqrt()
    .range([0, 75]);

  var length = photos.parkLength;
  console.log(length);

    //height of violin proportional to total
    yNum.domain([0, 0.5]);
    xScale.domain(photos.xDom);


    //calculate max distance from road in miles
  var max = (photos.xDom[1]*0.000621371).toFixed(0);

//build groups
    var yellowstoneViolin =  yellowstoneViolinSvg.append("g")
           .datum(photos)
              .attr("parkLength", function(d){
                        return d.parkLength;
              })
              .attr("id", "yellowstoneMapViolin")
                    .attr("transform", function(d){
                        return `translate(0 ${yellowH/2})`;
                    });
              // .on("mouseover", function(d){
              //         var park = d.key;
              //           d3.select(this).select("path").attr("fill-opacity", 1);
              //       })
              // .on("mouseout", function(d){
              //         var park = d.key;
              //           d3.select(this).select("path").attr("fill-opacity", 0.7);
              //       });

            yellowstoneViolin.append("path")
                .datum(function(d){ return(d.value)})     // So now we are working bin per bin
                    .style("stroke", "none")
                    .style("fill","#c9d1ff")
                    .attr("fill-opacity", 0.7)
                    .attr("d", d3.area()
                                        .y0(function(d){ 
                                          return(-1*yNum(d.length/length));
                                        })
                                        .y1(function(d){ 
                                          return(yNum(d.length/length)); 
                                        })
                                        .x(function(d){ 
                                          return(xScale(d.x0)); 
                                        })
                                        .curve(d3.curveCatmullRom)
                                        );

                var axis = yellowstoneViolin.append("rect")
                          .attr("class", "mapViolin")
                          .attr("width", yellowW/2)
                          .attr("height", 0.5)
                          .attr("x", w/4)
                          .attr("y", 0)
                          .attr("fill", "#fff");

                var labelLeft = d3.select("div.yellowInner")
                                  .append("p")
                                  .attr("class", "mapViolin")
                                  .style("position", "absolute")
                                  .style("left", yellowW/4-55+"px")
                                  .style("top",yellowH/2-15+"px")
                                  .style("width", "50px")
                                  .style("font-size", "12px")
                                  .style("text-align", "right")
                                  .html(`0 miles from road`);

                var labelRight = d3.select("div.yellowInner")
                                  .append("p")
                                  .attr("class", "mapViolin")
                                  .style("position", "absolute")
                                  .style("left", yellowW-yellowW/4+5+"px")
                                  .style("top",yellowH/2-15+"px")
                                  .style("width", "50px")
                                  .style("font-size", "12px")
                                  .html(`${max} miles from road`);                




}


//add arrows
function displayInfo(park) {
  park = park.replace(/_/g, " ");

  d3.select("div.mapInfo").style("opacity", 1);

  //(calculate previous and next park)
  var previous, next;
  for (var i = 0; i < parkNames.length; i++) {
    if (park === parkNames[i].replace(/_/g, " ")) {
      if (i != 0) previous = parkNames[i-1].replace(/_/g, " ");
      else previous = "";
      if (i != parkNames.length - 1) next = parkNames[i+1].replace(/_/g, " ");
      else next = "";
    }
  }

var parkCharNames = parkChar.map(park=>park.Area_Name);
console.log(parkCharNames);
var parkCharInd = parkCharNames.indexOf(park.replace( / /g, "_"));


  console.log(previous);
  console.log(next);

var char = parkChar[parkCharInd];
console.log(char);
  var area = Math.floor(char["NPS_Fee_Acres"]);
  var visitors = char["y2018"];
  console.log(area);
  console.log(visitors);

  d3.select(".visitors").html(`2018 Visitors: ${d3.format(",")(visitors)}`);
  d3.select(".area").html(`Park Area in Acres: ${d3.format(",")(area)}`);

//display info: number of photos, visitors, area, miles of road, photo of park, violin plot?
//this should probably all go on the left side

  //display park name at top, and update previous/next buttons
  $("div.parkname").html("");
  $("div.parkname").append(park.replace(/_/g, " "));
  $("div.characteristics").html("");







}

//whenever current park is updated, this function is called
window.makeMap = function(park_name) {
//alert(park_name);

  highlight = true;
  //make sure violin is hidden
  violinGroup.attr("opacity", 0).style("pointer-events", "none");
  mapGroup.attr("opacity", 1).style("pointer-events", "auto");
  d3.select("#violin").attr("opacity", 0);
  d3.select("#violin").style("opacity", 0);
  d3.select("div.violinPhoto").style("opacity", 0.8).style("pointer-events", "auto");
  


  var ind = parkNames.indexOf(park_name.replace( / /g, "_"));
  var boxInd = allParkNames.indexOf(park_name.replace( / /g, "_"));
  //remove previous map if there
  mapGroup.selectAll("path").remove();


  getProjection(boxes[boxInd]);
  drawBoundary(boundaries[boxInd]);
  drawPhotos(data[ind]);
  drawMapViolin(sumstat[ind]);

  displayInfo(park_name);

} 


//create fake data for bubble cloud
var cloudData = [];
var smallCloudData = [];
var bigCloudData = [];
var cloudW = $("div.cloud").width();
var cloudH = $("div.cloud").height();


for(var i = 0; i < 7000; i++){

    cloudData.push({
      "uniqueId": i,
      "r": 1.7 + Math.random()*0.3
    });

    if(i<1000){
    smallCloudData.push({
      "uniqueId": i,
      "r": 1.7 + Math.random()*0.3
    });
    } else {
      bigCloudData.push({
      "uniqueId": i,
      "r": 1.7 + Math.random()*0.3
    });
    }

}


var allCircles = d3.packSiblings(cloudData);


var smallCircles = d3.packSiblings(smallCloudData);


var bigCircles = d3.packSiblings(bigCloudData);



for(var t = 0; t < 7000; t++){
  if(t<1000){
    allCircles[t]["smallX"] = smallCircles[t].x;
    allCircles[t]["smallY"] = smallCircles[t].y;
  } else {
    allCircles[t]["bigX"] = bigCircles[t-1000].x;
    allCircles[t]["bigY"] = bigCircles[t-1000].y;
  }
}

              

var cloudSvg = d3.select("div.cloud").append("svg")
                  .attr("width", cloudW)
                  .attr("height", cloudH)
                  .attr("overflow", "visible");

var cloudCircles =  cloudSvg.append("g")
                .attr("transform", `translate(${cloudW/2} ${cloudH/2})`)
          .selectAll("circle")
              .data(allCircles)
              .enter()
              .append("circle")
                  .attr("cx", function(d,i){
                        if(d["uniqueId"]<1000){
                          return d.smallX -150;
                        }else{
                          return d.bigX + 150;
                        }
                    })
                    .attr("cy", function(d,i){
                        if(d["uniqueId"]<1000){
                          return d.smallY ;
                        }else{
                          return d.bigY;
                        }
                    })
                  .attr("r", d=> d.r-0.75)
                  .attr("fill", "#fff");

var cloudLabelLeft = cloudSvg.select("g").append("text")
                         .attr("text-anchor", "center")
                         .text("Distance > 1 mile")
                         .attr("x", -210)
                         .attr("y", -80)
                         .attr("font-size", "1.2em")
                         .attr("fill", "#fff");

var cloudLabelRight = cloudSvg.select("g").append("text")
                        .attr("text-anchor", "center")
                        .text("Distance < 1 mile")
                        .attr("x", 80)
                        .attr("y", -175)
                        .attr("font-size", "1.2em")
                        .attr("fill", "#fff");


/*
function moveCircles(){
    cloudCircles.transition("breakApart")
                .duration(2000)
                    .attr("cx", function(d,i){
                        if(d["uniqueId"]<200){
                          return d.smallX -150;
                        }else{
                          return d.bigX + 150;
                        }
                    })
                    .attr("cy", function(d,i){
                        if(d["uniqueId"]<200){
                          return d.smallY ;
                        }else{
                          return d.bigY;
                        }
                    });

}

setTimeout(function(){
    moveCircles();
},3000)
*/


var data;
var csvData;

//get width
var w = $("div.plot").width();
var h = $("div.plot").height();
var m = 50;
var r = Math.min(w,h)/2-m;

//add svg
var radialSvg = d3.select("div.plot")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("overflow", "visible");

var violinGroup = radialSvg.append("g")
                           .attr("class", "violinGroup");

var mapGroup = radialSvg.append("g")
                          .attr("class", "mapGroup");

var highlight = false;

//Container for the gradients
var defs = radialSvg.append("defs");

//Filter for the outside glow
var filter = defs.append("filter")
    .attr("id","glow");
filter.append("feGaussianBlur")
    .attr("stdDeviation","2")
    .attr("result","coloredBlur");
    /*
var feMerge = filter.append("feMerge");

feMerge.append("feMergeNode")
    .attr("in","coloredBlur");
    
feMerge.append("feMergeNode")
    .attr("in","SourceGraphic");
*/
//draw circle in center
var circle = violinGroup.append("circle")
                          .attr("cx", w/2)
                          .attr("cy", h/2)
                          .attr("r", r)
                          .attr("id", "violin")
                          .attr("fill", "none")
                          .attr("stroke", "#555")
                          .attr("stroke-width", 1);

var centerText = d3.select("div.inner")
                        .append("p")
                        .html(`Max Distance from Road*`)
                            .attr("class", "centerText")
                            .attr("id", "violin")
                            .style("left", w/2 - 40+ "px")
                            .style("top", h/2 - h/30+ "px")
                            .style("width", "80px");

var botRightText = d3.select("div.inner")
                        .append("p")
                        .html("* Varies by Park")
                            .attr("class", "botRightText")
                            .attr("id", "violin");

var textOffset = 5;

var textArcPath = violinGroup.append("path")
                           .attr("id", "textArcPath")
                           .attr("d", function(){
                      return `M ${w/2-r- textOffset}, ${h/2}
                              A ${r+ textOffset} ${r + textOffset} 0
                              0,1
                              ${w/2+r + textOffset}, ${h/2}`
                           })
                           .attr("fill", "none")
                           .attr("stroke", "none");

var textArc = violinGroup.append("text")
                       .append("textPath")
                          .attr("id", "violin")
                          .attr("xlink:href", "#textArcPath")
                          .attr("text-anchor", "middle")
                          .attr("startOffset", "70%")
                          .attr("fill", "#fff")
                          .style("font-size", "0.8em")
                          .text("0 miles from road");



//d3v5 uses promises to load data
//use Promise.all([]).then for multiple files

function loadData(){

Promise.all([
    d3.csv("data/euclidean/Yellowstone_National_Park.csv"),
    d3.json("data/boundaries.json"),
    d3.json("data/boxes.geojson"),
    d3.csv("data/park_characteristics/data/nps_characteristics.csv")
  ])
  .then(function([yellowstoneCsv, boundariesJson, boxesJson, parkCharCsv]){
    //get park names
       yellowstone = yellowstoneCsv;
       boundaries = boundariesJson.features;
       boxes = boxesJson.features;
       parkChar = parkCharCsv;

    for(var box of boxes){
      allParkNames.push(box.properties["UNIT_NAME"].replace( / /g, "_"));
    }

    makeYellowstone();
    makeYellowstoneViolin();
    // //get json urls
    // var files = [];
    // for(var park of parkNames){
    //    // .log(park)
    //     files.push(`data/photos/${park}.json`);
    //}
    //get csv urls
    var csvs = [];
    for(var park of parkNames){
      csvs.push(`data/euclidean/${park}.csv`)
    }

     //build array of promises
     var promises = [];

// files.forEach(function(url) {
//     promises.push(d3.json(url))
// });

csvs.forEach(function(url) {
    promises.push(d3.csv(url))
});

Promise.all(promises).then(function(values) {
    //everything using data in here!
    //console.log(values)

    //log out lengths for each park
   // console.log(values.map(park=>park.features.length));
      console.log(values);
      data = values;
      
      // csvData = values.slice(38,77);
      // console.log(csvData);
    //console.log(big.map(park=> park.features[0].properties.park));
/*
    console.log(big.map(park=> ({
                "name": park.features[0].properties.park,
                "count": park.features.length
    })
 ));
*/  


  //build random data
var randomLogTransform = d3.scaleLog()
                            .base(10)
                            .domain([0.01,1.01])
                            .range([10000, 0]);
    
  var xScale = d3.scaleLinear()
                   // .base(2)
                    .range([r,50]);

   sumstat = [];

    for(var j = 0; j < parkNames.length; j++){

        var park = data[j];
        var parkName = parkNames[j];
        var parkLength = park.length;

        for(var photo of park){

            if(photo.distance>1609.34){
              all.push(photo.distance);
            }
            

            photo["name"] = parkName;
             // if(photo.distance == "0"){
             //   photo.distance = 1;
             // }

        }

      var domMax = d3.max(park.map(photo => +photo.distance));

     var log = d3.scaleLinear()
                    .domain([0,domMax])
                    //.base(10)
                    .range([w/2,w/2+r/2]);


      var histogram = d3.histogram()
        .domain(log.domain()) //domain
        .thresholds(log.ticks(100))  //number of bins
        .value(d => d); //value accessor

      var parkSumstat = d3.nest()  // nest function allows to group the calculation per level of a factor
        .key(function(d) { return d.name})
        .rollup(function(d) {   // For each key..
          input = d.map(function(g) { return +g.distance;})    // Keep the variable called Sepal_Length
         // console.log(input);
          bins = histogram(input)   // And compute the binning on it.
          return(bins)
        })
        .entries(park);

        //calculate max number in a bin for each park
        var maxNum = 0;
        for (var i in parkSumstat ){
             var allBins = parkSumstat[i].value
             var lengths = allBins.map(function(a){return a.length;})
             var longest = d3.max(lengths)
              if (longest > maxNum) { maxNum = longest }
        }

        //console.log(maxNum);
        parkSumstat[0]["maxNum"] = maxNum;
        parkSumstat[0]["xDom"] = log.domain();
        parkSumstat[0]["parkLength"] = parkLength;

        sumstat.push(parkSumstat[0]);

    }

    console.log(all);
    console.log(all.length);

console.log(sumstat);
// set maximum height of a violin
  var yNum = d3.scaleSqrt()
    .range([0, r/12]);
  //.domain([-maxNum,maxNum])

    //number of violins
    var numBins = data.length;
    var rotateConst = 360/numBins;


for(var i; i<sumstat.length; i++){

    var length = sumstat[i].parkLength;

//height of violin proportional to total
    yNum.domain([0, 0.5]);
    xScale.domain(sumstat[i].xDom);


//build groups
    var parkGroup =  violinGroup.append("g")
           .datum(sumstat[i])
              .attr("class", function(d){
                        return d.key;
                    })
              .style("cursor", "pointer")
              .attr("parkLength", function(d){
                        return d.parkLength;
              })
              .attr("id", "violin")
                    .attr("transform", function(d){
                        return `rotate(${i*rotateConst + rotateConst/2 - 90} ${w/2} ${h/2})
                                translate(${w/2} ${h/2})`;
                    })
              .on("click", function(d){
                        if(!highlight){
                          var park = d.key;
                         // console.log(park);
                        }
                    })
              .on("mouseover", function(d){
                      var park = d.key;
                        d3.select(this).select("path").attr("fill-opacity", 1);
                    })
              .on("mouseout", function(d){
                      var park = d.key;
                        d3.select(this).select("path").attr("fill-opacity", 0.7);
                    });

            parkGroup.append("path")
                .datum(function(d){ return(d.value)})     // So now we are working bin per bin
                    .style("stroke", "none")
                    .style("fill","#c9d1ff")
                    .attr("fill-opacity", 0.7)
                    .attr("d", d3.area()
                                        .y0(function(d){ 
                                          return(-1*yNum(d.length/length));
                                        })
                                        .y1(function(d){ 
                                          return(yNum(d.length/length)); 
                                        })
                                        .x(function(d){ 
                                          return(xScale(d.x0)); 
                                        })
                                        .curve(d3.curveCatmullRom)
                                        );                  

//add park labels
              parkGroup.append("g") 
                          .attr("class", "parkLabel")     
                        .append("text")
                          .attr("x", r+5)
                          .attr("y", 0)
                          .attr("opacity", 0.6)
                          .attr("font-size", "0.6em")
                          .style("text-transform", "uppercase")
                          .attr("fill", "#c9d1ff")
                          .text(function(d){
                            return d.key.replace(/_/g, " ").replace("National Park", "");
                          })
                          .attr("transform", function(d){
                                var a = i*rotateConst + rotateConst/2 - 90;
                                if(a>90 && a <= 270){
                                  var length = d3.select(this).node().getComputedTextLength();
                                  tran = (-2*r-length-10,-2*r-length-10);
                                  //tran = ("10,10")
                                  return `rotate(180,0,0)
                                          translate(${tran})`;
                                }
                                if(d.key == "Badlands_National_Park" || d.key == "Big_Bend_National_Park"){
                                    return "translate(12,12)";

                                }


                          });




/*
                 var axes = d3.selectAll(".violin").append("rect")
                          .attr("width", r)
                          .attr("height", 0.25)
                          .attr("x", 0)
                          .attr("y", 0)
                          .attr("fill", "#555");
*/



}

//add empty pie chart for larger footprint

function makePie(){

var pie = d3.pie()
          .value(function(d){
            return d.value;
          })
          .sort(null);

var parkPieData = [];
for(var park of parkNames){
    parkPieData.push({
      "name": park,
      "value": 1
    })
}

 parkPieData = pie(parkPieData);

var piePath = d3.arc()
    .outerRadius(r)
    .innerRadius(0);

var pieArc = violinGroup.selectAll(".pieArc")
                      .data(parkPieData)
                      .enter()
                      .append("g")
                          .attr("cursor", "pointer")
                          .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")")
                          .attr("fill-opacity", 0)
                          .attr("stroke-opacity", 0)
                          .attr("fill", "#000")
                          .attr("stroke", "#c9d1ff")
                          .attr("stroke-width", 0.25)
                          .attr("class", "arc")
                      .append("path")
                          .attr("d", piePath)
                          .on("click", function(d){
                            makeMap(d.data.name);
                          })
                          .on("mouseover", function(d){
                             d3.select(`g.${d.data.name}`).select("path").attr("fill-opacity", 1);
                             d3.select(`g.${d.data.name}`).select("g.parkLabel").select("text").attr("opacity", 1);
                            // d3.select(this).attr("stroke-opacity", 1);
                             
                                })
                          .on("mouseout", function(d){
                             d3.select(`g.${d.data.name}`).select("path").attr("fill-opacity", 0.7);
                             d3.select(`g.${d.data.name}`).select("g.parkLabel").select("text").attr("opacity", 0.6);
                            //  d3.select(this).attr("stroke-opacity", 0);
                                });
}

makePie();




///
});
  
  });

}

loadData();


    

}
window.onload = wrapper();