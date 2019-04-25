#1. Import OSM
#2. Project spatial layers
#3. Buffer park boundaries
#4. Mask street layers to buffer
#5. Convert parks to 30m raster
#6. Calculate distance to road within buffer
#7. import flickr json
#8. add distance attribute to json
#9. export geojson and json

#PROBLEMS
#1. How to work with that CA file? .pbx? https://download.geofabrik.de/north-america.html plus download virgin islands
#2. why don't I have the same number of park boundaries (59 versus 61)? 
#3. need a loop for loading json
#4. need a loop for making rasters
#5. split loop into three to keep R from crashing or adjust RAM allocation

#load packages
library(openxlsx)
library(dplyr)
library(sp)
library(sf)
library(rgdal)
library (maptools)
library(ggmap)
library(rgeos)
library(raster)
library(rjson)
library(jsonlite)
library(geojsonio)
library(rmapshaper)
library(RJSONIO)


setwd("C:/Users/Sullivan/Desktop/GEO575 Project")

###################
#features and lists
#projection strings
aea_proj <- "+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=37.5 +lon_0=-110
+x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m"
wgs84 <- "+init=epsg:4326 +proj=longlat +ellps=WGS84
+datum=WGS84 +no_defs +towgs84=0,0,0"

#lists of parks and states
nps_names<-read.xlsx("nps_names.xlsx", sheet=1, startRow=1, colNames=FALSE)
nps_names_a <- read.xlsx("nps_names.xlsx", sheet=3, startRow=1, colNames=FALSE)
nps_states<-read.xlsx("nps_names.xlsx", sheet=2, startRow=1, colNames=FALSE)
#nps_names_abv<-read.xlsx("nps_names.xlsx", sheet=3, startRow=1, colNames=FALSE)

###################  
#1. load OSM roads
OSM_AK <- readOGR("Open Street Map/alaska-latest-free.shp/gis_osm_roads_free_1.shp")
OSM_AZ <- readOGR("Open Street Map/arizona-latest-free.shp/gis_osm_roads_free_1.shp")
OSM_AR <- readOGR("Open Street Map/arkansas-latest-free.shp/gis_osm_roads_free_1.shp")
#CALIFORNIA???? virgin islands?
#OSM_CO <- readOGR("Open Street Map/colorado-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_FL <- readOGR("Open Street Map/florida-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_HI <- readOGR("Open Street Map/hawaii-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_ID <- readOGR("Open Street Map/idaho-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_KY <- readOGR("Open Street Map/kentucky-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_MI <- readOGR("Open Street Map/michigan-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_MN <- readOGR("Open Street Map/minnesota-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_MT <- readOGR("Open Street Map/montana-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_MO <- readOGR("Open Street Map/missouri-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_ME <- readOGR("Open Street Map/maine-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_NC <- readOGR("Open Street Map/north-carolina-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_ND <- readOGR("Open Street Map/north-dakota-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_NM <- readOGR("Open Street Map/new mexico-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_NV <- readOGR("Open Street Map/nevada-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_OH <- readOGR("Open Street Map/ohio-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_OR <- readOGR("Open Street Map/oregon-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_SD <- readOGR("Open Street Map/south dakota-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_SC <- readOGR("Open Street Map/south-carolina-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_TN <- readOGR("Open Street Map/tennessee-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_TX <- readOGR("Open Street Map/texas-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_UT <- readOGR("Open Street Map/utah-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_VA <- readOGR("Open Street Map/virginia-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_VI <- readOGR("Open Street Map/virgin islands-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_WA <- readOGR("Open Street Map/washington-latest-free.shp/gis_osm_roads_free_1.shp")
#OSM_WY <- readOGR("Open Street Map/wyoming-latest-free.shp/gis_osm_roads_free_1.shp")

#project
OSM_AZ_aea <- spTransform(OSM_AZ, crs(aea_proj))
OSM_AK_aea <- spTransform(OSM_AK, crs(aea_proj))
OSM_AR_aea <- spTransform(OSM_AR, crs(aea_proj))
#OSM_UT_aea <- spTransform(OSM_UT, crs(aea_proj))
#OSM_CO_aea <- spTransform(OSM_CO, crs(aea_proj))
#OSM_NM_aea <- spTransform(OSM_NM, crs(aea_proj))
rm(OSM_AZ, OSM_AK, OSM_AR)

#load nps boundary
#missing 2 parks - n=59?
NPSshape <- readOGR("nps_boundary/nps_boundary_61.shp")
st_crs(NPSshape)
nps_boundaries <- spTransform(NPSshape, CRS(aea_proj))

#################
#2. Make a buffer 
#QUESTION1: (using 5000m, what should I use?)
nps_plus_buffer <- gBuffer(nps_boundaries,width=5000, byid=TRUE)
nps_plus_buffer_wgs84 <- spTransform(nps_plus_buffer, CRS(wgs84))
writeOGR(obj=nps_plus_buffer, layer = 'nps_plus_buffer',  'C:/Users/Sullivan/Desktop/GEO575 Project/nps_boundary/nps_plus_buffer.shp', driver="ESRI Shapefile", check_exists = FALSE)

#################
#3. Mask the OSM polylines
#QUESTION2: what road classes should I include here? including the list below, but there are 27 options
#clip_OSM_AZ <- gIntersection(nps_plus_buffer, OSM_AZ_aea, byid = TRUE, drop_lower_td = TRUE) #clip polyglines with nps buffer
clip2_OSM_AZ <- raster::intersect(OSM_AZ_aea, nps_plus_buffer)
clip_OSM_AK <- raster::intersect(OSM_AK_aea, nps_plus_buffer)
clip_OSM_AR <- raster::intersect(OSM_AR_aea, nps_plus_buffer)

#test
writeOGR(obj=clip2_OSM_AZ, layer = 'clip2_OSM_AZ',  'C:/Users/Sullivan/Desktop/GEO575 Project/nps_boundary/clip2_OSM_AZ.shp', driver="ESRI Shapefile", check_exists = FALSE)

#living street (5123), motorway (5111), motorway_link(5131), primary (5113), residential (5122), secondary (5114), secondary link (5134)
OSM_AZ_roads <- subset(clip2_OSM_AZ, code==5123 | code==5111| code==5113 | code==5131 |  code==5122 | code==5114 | code==5134)
OSM_AK_roads <- subset(clip_OSM_AK, code==5123 | code==5111| code==5113 | code==5131 |  code==5122 | code==5114 | code==5134)
OSM_AR_roads <- subset(clip_OSM_AR, code==5123 | code==5111| code==5113 | code==5131 |  code==5122 | code==5114 | code==5134)

#map
plot(clip2_OSM_AZ)
plot(clip_OSM_AK)
rm(OSM_AZ_aea, OSM_AK_aea)

###################
#4.Convert Park to raster
#what are the extents of these buffered park polygons?
#projected
e <- list()
for (i in 1:length(nps_plus_buffer)) {
  e[[i]] <- extent(nps_plus_buffer[i,])
}
#geo
e_geo <- list()
for (i in 1:length(nps_plus_buffer_wgs84)) {
  e_geo[[i]] <- extent(nps_plus_buffer_wgs84[i,])
}

#make a raster for a single park extent in AZ using these extents
r <- raster()
bb <- extent(e[[55]])
extent(r) <- bb
res(r) <- 30
r <- setExtent(r, bb)
#setValues(r,1)
r[] <- NA 
crs(r) <- aea_proj

#make a 2nd park in AZ
r2 <- raster()
bb <- extent(e[[59]])
extent(r2) <- bb
res(r2) <- 30
r2 <- setExtent(r2, bb)
#setValues(r,1)
r2[] <- NA 
crs(r2) <- aea_proj

#make a 3rd
r3 <- raster()
bb <- extent(e[[54]])
extent(r3) <- bb
res(r3) <- 30
r3 <- setExtent(r3, bb)
#setValues(r,1)
r3[] <- NA 
crs(r3) <- aea_proj

plot(clip2_OSM_AZ)
####################
#6. Calculate distance to road within buffer
#make road raster
roads.r <- rasterize(OSM_AZ_roads, r, field=1)
roads.r2 <- rasterize(OSM_AZ_roads, r2, field=1)
roads.r3 <- rasterize(OSM_AZ_roads, r3, field=1)

#make distance raster
roaddist.r <- distance(roads.r)
roaddist.r2 <- distance(roads.r2)
roaddist.r3 <- distance(roads.r3)

#make distance raster, option 2
#dd = gDistance(clip2_OSM_AZ, as(r,"SpatialPoints"), byid=TRUE)
#r[] = apply(dd,1,min)
roaddist.r.wgs84 <- projectRaster(roaddist.r, crs=wgs84)
roaddist.r2.wgs84 <- projectRaster(roaddist.r2, crs=wgs84)
roaddist.r3.wgs84 <- projectRaster(roaddist.r3, crs=wgs84)

#map
plot(r)
lines(nps_plus_buffer[55,])
lines(clip2_OSM_AZ, add=TRUE)

plot(roaddist.r)
lines(clip2_OSM_AZ)

##############
#7.load flickr json
#coordinates
#id
#should figure out how to keep the variable names, instead of messy "properties."
Petrified_Forest_NP <- fromJSON("Petrified_Forest_National_Park.json", flatten=TRUE)
Petrified_Forest_NP_data<-Petrified_Forest_NP[['features']]
#make it a data frame and extract the coordinates
Petrified_Forest_NP_coord <- unlist(Petrified_Forest_NP_data$properties.coordinates)
Petrified_Forest_NP_df <-as.data.frame(Petrified_Forest_NP_data)
Petrified_Forest_NP_df_coord <- separate(Petrified_Forest_NP_df, geometry.coordinates, c("long", "lat"), sep =". ", remove=TRUE)
Petrified_Forest_NP_df_coord$long <- as.numeric(gsub("c\\(", "", Petrified_Forest_NP_df_coord$long))
Petrified_Forest_NP_df_coord$lat <- as.numeric(gsub("\\)", "", Petrified_Forest_NP_df_coord$lat))

##############
#8. extract value to point
#make spdf
Petrified_Forest_NP_df_spdf<- select(Petrified_Forest_NP_df_coord, properties.id, long, lat)
coordinates(Petrified_Forest_NP_df_spdf) <- ~long +lat

#rename this for loop
#AZ1
distance <- raster::extract(roaddist.r.wgs84, Petrified_Forest_NP_df_spdf)
AZ1_d <- cbind(Petrified_Forest_NP_df_coord,distance)

#AZ1_d
#Min. 1st Qu.  Median    Mean 3rd Qu.    Max. 
#0.00   27.20   68.61  192.57  175.72 9178.14 
#AZ2
#AZ2 <-extract(roaddist.r2, pointCoordinates_59)

##############
#9. write files
#write csv
write.csv(AZ1_d, file = "Petrified_Forest_National_Park.csv",row.names=FALSE)

#shapefiles of roads for testing
writeOGR(obj=OSM_AZ_roads, layer = 'OSM_AZ_roads',  'C:/Users/Sullivan/Desktop/GEO575 Project/nps_boundary/OSM_AZ_roads.shp', driver="ESRI Shapefile", check_exists = FALSE)
writeOGR(obj=Petrified_Forest_NP_df_coord, layer = 'Petrified_Forest_NP_df_coord',  'C:/Users/Sullivan/Desktop/GEO575 Project/nps_boundary/Petrified_Forest_NP_df_coord.shp', driver="ESRI Shapefile", check_exists = FALSE)

#write raster for testing
writeRaster(roaddist.r.wgs84, "DistFromRoad_PetrifiedForest.tiff", "GTiff", overwrite=TRUE)
writeRaster(roaddist.r2, "DistFromRoad_GrandCanyon.tiff", "GTiff")

#make it a json again
AZ_55 <- jsonlite::toJSON(list(type = names(AZ1_d), values = AZ1_d), digits=3, pretty = TRUE)

AZ_55_d <- cat(AZ_55)
jsonlite::write_json(list(type = names(AZ1_d), values = AZ1_d), "Petrified_Forest_National_Park.json",digits=3, pretty = TRUE, auto_unbox = FALSE)

#geojsons of roads
OSM_AZ_roads_json <- geojson_json(OSM_AZ_roads)
#QUESTION: should I simplify these?
#OSM_AZ_roads_json_s <- ms_simplify(OSM_AZ_roads_json)
Petrified_Forest_OSM_json <- ms_simplify(OSM_AZ_roads_json)
#bbox arguement only allows numeric vector
Petrified_Forest_OSM_json <- ms_clip(OSM_AZ_roads_json_s, bbox = c()
geojson_write(Petrified_Forest_OSM_json, file = "Petrified_Forest_OSM_json.geojson")
geojson_write(Grand_Canyon_OSM_json, file = "Petrified_Forest_OSM_json.geojson")
geojson_write(Sagauro_OSM_json, file = "Petrified_Forest_OSM_json.geojson")


