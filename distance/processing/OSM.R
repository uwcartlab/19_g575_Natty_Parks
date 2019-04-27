####################
#prepares OSM data for analysis and display
#downloaded from : https://download.geofabrik.de/north-america.html
####################
#load required libraries
library(rgdal)
if (!require(geojsonio)) {
  install.packages("geojsonio")
  library(geojsonio)
}
library(rgeos)
library(sp)
library(maps)
library(ggmap)
library(maptools)
library(raster)

setwd("C:/Users/Sullivan/Desktop/GEO575 Project")

#define variables
#dir
the_dir_ex <- "Data/output"
the_dir_in <- "Data/input"
#projection strings
wgs84 <- "+init=epsg:4326 +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs +towgs84=0,0,0"
aea_proj <- "+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=37.5 +lon_0=-110
+x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m"

###################
#Define file lists
#Files are too big and must be done in sequence to prevent crashing....
As <- c("clip_OSM_AZ", "clip_OSM_AK", "clip_OSM_AR")
Cs <- c("clip_OSM_CO", "clip_OSM_CA", "clip_OSM_OH", "clip_OSM_OR", "clip_OSM_OH","clip_OSM_SD", "clip_OSM_SC")
Fs <- c("clip_OSM_FL", "clip_OSM_HI", "clip_OSM_ID", "clip_OSM_KY")
Ms <- c("clip_OSM_MI", "clip_OSM_MN", "clip_OSM_MT", "clip_OSM_MO", "clip_OSM_ME", "clip_OSM_NC","clip_OSM_ND","clip_OSM_NM","clip_OSM_NV")
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

#load nps boundary
NPSshape <- readOGR("nps_boundary/nps_boundary.shp")
crs(NPSshape)
nps_boundaries <- spTransform(NPSshape, CRS(aea_proj))
nps_boundaries_wgs84 <- spTransform(NPSshape, CRS(wgs84))

#################
#2. Make a buffer 
nps_plus_buffer <- gBuffer(nps_boundaries,width=5000, byid=TRUE)

################
#OSM make for analysis
nps_buffer_wgs84 <- spTransform(nps_plus_buffer, CRS(wgs84))
#Clip
clip_OSM_AZ <- raster::intersect(OSM_AZ, nps_buffer_wgs84)
clip_OSM_AK <- raster::intersect(OSM_AK, nps_buffer_wgs84)
clip_OSM_AR <- raster::intersect(OSM_AR, nps_buffer_wgs84)

#make unit_code list
unit_code <- table(clip_OSM_AK1$UNIT_CODE)

#clip by buffer function
clip_buffer(A_polyline, the_dir){
  dat_clip <- raster::intersect(A_polyline, nps_buffer_wgs84)
  writeOGR(obj=dat_clip, layer = 'A_polyline',  'C:/Users/Sullivan/Desktop/GEO575 Project/nps_boundary/OSM_AR_allroads.shp', driver="ESRI Shapefile", check_exists = FALSE)
  dat_clip_sub <- subset(dat_clip, code!=5154 | code!=5153 | code==5152) 
  writeOGR(obj=clip_OSM_AZ1, layer = 'clip_OSM_AZ1',  'C:/Users/Sullivan/Desktop/GEO575 Project/nps_boundary/OSM_AZ_roads.shp', driver="ESRI Shapefile", check_exists = FALSE)
  writeOGR(clip_OSM_AR_boundary, dsn="Data/output/buffer/Hot_Springs_National_Park.GeoJSON", layer="clip_OSM_AR_boundary", driver="GeoJSON", check_exists = FALSE)
}

#write file in case we want to change the subsetting
writeOGR(obj=clip_OSM_AZ, layer = 'clip_OSM_AZ',  'C:/Users/Sullivan/Desktop/GEO575 Project/nps_boundary/OSM_AZ_allroads.shp', driver="ESRI Shapefile", check_exists = FALSE)
writeOGR(obj=clip_OSM_AK, layer = 'clip_OSM_AK',  'C:/Users/Sullivan/Desktop/GEO575 Project/nps_boundary/OSM_AK_allroads.shp', driver="ESRI Shapefile", check_exists = FALSE)
writeOGR(obj=clip_OSM_AR, layer = 'clip_OSM_AR',  'C:/Users/Sullivan/Desktop/GEO575 Project/nps_boundary/OSM_AR_allroads.shp', driver="ESRI Shapefile", check_exists = FALSE)

#subset roads based on attribute fclass (surface attribute was not in this dataset)
clip_OSM_AZ1 <- subset(clip_OSM_AZ, code!=5154 | code!=5153 | code==5152)  
clip_OSM_AK1 <- subset(clip_OSM_AK, code!=5154 | code!=5153 | code==5152)  
clip_OSM_AR1 <- subset(clip_OSM_AK, code!=5154 | code!=5153 | code==5152)  

#split up states with multiple parks by park
clip_OSM_GRCA <- clip_OSM_AZ1[clip_OSM_AZ1$UNIT_CODE == "GRCA",]
clip_OSM_PEFO <- clip_OSM_AZ1[clip_OSM_AZ1$UNIT_CODE == "PEFO",]
clip_OSM_SAGU <- clip_OSM_AZ1[clip_OSM_AZ1$UNIT_CODE == "SAGU",]
 
clip_OSM_DENA <- clip_OSM_AK1[clip_OSM_AK1$UNIT_CODE == "DENA",]
clip_OSM_GLBA <- clip_OSM_AK1[clip_OSM_AK1$UNIT_CODE == "GLBA",]
clip_OSM_GAAR <- clip_OSM_AK1[clip_OSM_AK1$UNIT_CODE == "GAAR",]
clip_OSM_KATM <- clip_OSM_AK1[clip_OSM_AK1$UNIT_CODE == "KATM",]
clip_OSM_KEFJ <- clip_OSM_AK1[clip_OSM_AK1$UNIT_CODE == "KEFJ",]
clip_OSM_KOVA <- clip_OSM_AK1[clip_OSM_AK1$UNIT_CODE == "KOVA",]
clip_OSM_LACL <- clip_OSM_AK1[clip_OSM_AK1$UNIT_CODE == "LACL",]
clip_OSM_WRST <- clip_OSM_AK1[clip_OSM_AK1$UNIT_CODE == "WRST",]
 
#write roads in buffer files
#shape for test
writeOGR(obj=clip_OSM_AZ1, layer = 'clip_OSM_AZ1',  'C:/Users/Sullivan/Desktop/GEO575 Project/nps_boundary/OSM_AZ_roads.shp', driver="ESRI Shapefile", check_exists = FALSE)
writeOGR(obj=clip_OSM_AK1, layer = 'clip_OSM_AK1',  'C:/Users/Sullivan/Desktop/GEO575 Project/nps_boundary/OSM_AK_roads.shp', driver="ESRI Shapefile", check_exists = FALSE)
writeOGR(obj=clip_OSM_AR1, layer = 'clip_OSM_AR1',  'C:/Users/Sullivan/Desktop/GEO575 Project/nps_boundary/OSM_AR_roads.shp', driver="ESRI Shapefile", check_exists = FALSE)

#geojson
writeOGR(clip_OSM_AR_boundary, dsn="Data/output/buffer/Hot_Springs_National_Park.GeoJSON", layer="clip_OSM_AR_boundary", driver="GeoJSON", check_exists = FALSE)
writeOGR(clip_OSM_GRCA, dsn="Data/output/buffer/Grand_Canyon_National_Park.GeoJSON", layer="clip_OSM_GRCA", driver="GeoJSON", check_exists = FALSE)
writeOGR(clip_OSM_PEFO, dsn="Data/output/buffer/Petrified_Forest_National_Park.GeoJSON", layer="clip_OSM_PEFO", driver="GeoJSON", check_exists = FALSE)
writeOGR(clip_OSM_SAGU, dsn="Data/output/buffer/Saguaro_National_Park.GeoJSON", layer="clip_OSM_SAGU", driver="GeoJSON", check_exists = FALSE)

writeOGR(clip_OSM_DENA, dsn="Data/output/buffer/Denali_National_Park.GeoJSON", layer="clip_OSM_DENA", driver="GeoJSON", check_exists = FALSE)
writeOGR(clip_OSM_GLBA, dsn="Data/output/buffer/Glacier_Bay_National_Park.GeoJSON", layer="clip_OSM_GLBA", driver="GeoJSON", check_exists = FALSE)
writeOGR(clip_OSM_GAAR, dsn="Data/output/buffer/Gates_of_the_Artic_National_Park.GeoJSON", layer="clip_OSM_GAAR", driver="GeoJSON", check_exists = FALSE)
writeOGR(clip_OSM_KATM, dsn="Data/output/buffer/Katmai_National_Park.GeoJSON", layer="clip_OSM_KATM", driver="GeoJSON", check_exists = FALSE)
writeOGR(clip_OSM_KEFJ, dsn="Data/output/buffer/Kenai_Fjords_National_Park.GeoJSON", layer="clip_OSM_KEFJ", driver="GeoJSON", check_exists = FALSE)
writeOGR(clip_OSM_KOVA, dsn="Data/output/buffer/Kobuk_Valley_National_Park.GeoJSON", layer="clip_OSM_KOVA", driver="GeoJSON", check_exists = FALSE)
writeOGR(clip_OSM_LACL, dsn="Data/output/buffer/Lake_Clark_National_Park.GeoJSON", layer="clip_OSM_LACL", driver="GeoJSON", check_exists = FALSE)
writeOGR(clip_OSM_WRST, dsn="Data/output/buffer/Wrangell-St._Elias_National_Park_National_Park.GeoJSON", layer="clip_OSM_WRST", driver="GeoJSON", check_exists = FALSE)

#subset function 
subset_OSM(A_polyline, the_dir){
  #living street (5123), motorway (5111), motorway_link(5131), primary (5113), residential (5122), secondary (5114), secondary link (5134), tertiary (5141), service (5115)
    dat <- subset(A_polyline, code!=5154 | code!=5153 | code==5152) 
    writeOGR(obj=dat, layer = 'dat',  file=(the_dir_ex,"/", "A_polyline", driver="ESRI Shapefile", check_exists = FALSE)
    rm(polyline)
}    

lapply(As,
       FUN = subset_OSM,
       the_dir = the_dir_ex)

################
#OSM Write for web
clip_boundary(A_polyline, the_dir){
  clip2_OSM_AZ <- raster::intersect(filename, nps_boundaries)
  writeOGR(obj=filename, layer = 'filename',  'C:/Users/Sullivan/Desktop/GEO575 Project/nps_boundary/OSM_AR_allroads.shp', driver="ESRI Shapefile", check_exists = FALSE)
}

#Clip
clip_OSM_AZ_boundary <- raster::intersect(clip_OSM_AZ1, nps_boundaries_wgs84)
clip_OSM_AK_boundary <- raster::intersect(clip_OSM_AK1, nps_boundaries_wgs84)
clip_OSM_AR_boundary <- raster::intersect(clip_OSM_AR1, nps_boundaries_wgs84)

#split up states with multiple parks by park
clip2_OSM_GRCA <- clip_OSM_AZ_boundary[clip_OSM_AZ_boundary$UNIT_CODE.1 == "GRCA",]
clip2_OSM_PEFO <- clip_OSM_AZ_boundary[clip_OSM_AZ_boundary$UNIT_CODE.1 == "PEFO",]
clip2_OSM_SAGU <- clip_OSM_AZ_boundary[clip_OSM_AZ_boundary$UNIT_CODE.1 == "SAGU",]

clip2_OSM_DENA <- clip_OSM_AK_boundary[clip_OSM_AK_boundary$UNIT_CODE.1 == "DENA",]
clip2_OSM_GLBA <- clip_OSM_AK_boundary[clip_OSM_AK_boundary$UNIT_CODE.1 == "GLBA",]
clip2_OSM_GAAR <- clip_OSM_AK_boundary[clip_OSM_AK_boundary$UNIT_CODE.1 == "GAAR",]
clip2_OSM_KATM <- clip_OSM_AK_boundary[clip_OSM_AK_boundary$UNIT_CODE.1 == "KATM",]
clip2_OSM_KEFJ <- clip_OSM_AK_boundary[clip_OSM_AK_boundary$UNIT_CODE.1 == "KEFJ",]
clip2_OSM_KOVA <- clip_OSM_AK_boundary[clip_OSM_AK_boundary$UNIT_CODE.1 == "KOVA",]
clip2_OSM_LACL <- clip_OSM_AK_boundary[clip_OSM_AK_boundary$UNIT_CODE.1 == "LACL",]
clip2_OSM_WRST <- clip_OSM_AK_boundary[clip_OSM_AK_boundary$UNIT_CODE.1 == "WRST",]

#write shape
writeOGR(obj=clip_OSM_AZ_boundary, layer = 'clip_OSM_AZ_boundary',  'C:/Users/Sullivan/Desktop/GEO575 Project/nps_boundary/OSM_AZ_boundary.shp', driver="ESRI Shapefile", check_exists = FALSE)
writeOGR(obj=clip_OSM_AK_boundary, layer = 'clip_OSM_AK_boundary',  'C:/Users/Sullivan/Desktop/GEO575 Project/nps_boundary/OSM_AK_boundary.shp', driver="ESRI Shapefile", check_exists = FALSE)
writeOGR(obj=clip_OSM_AR_boundary, layer = 'clip_OSM_AR_boundary',  'C:/Users/Sullivan/Desktop/GEO575 Project/nps_boundary/OSM_AR_boundary.shp', driver="ESRI Shapefile", check_exists = FALSE)

#write geojson
writeOGR(clip_OSM_AR_boundary, dsn="Data/output/boundaries/Hot_Springs_National_Park.GeoJSON", layer="clip_OSM_AR_boundary", driver="GeoJSON", check_exists = FALSE)

writeOGR(clip2_OSM_GRCA, dsn="Data/output/boundary/Petrified_Forest_National_Park.GeoJSON", layer="clip2_OSM_GRCA", driver="GeoJSON", check_exists = FALSE)
writeOGR(clip2_OSM_PEFO, dsn="Data/output/boundary/Grand_Canyon_National_Park.GeoJSON.GeoJSON", layer="clip2_OSM_PEFO", driver="GeoJSON", check_exists = FALSE)
writeOGR(clip2_OSM_SAGU, dsn="Data/output/boundary/Saguaro_National_Park.GeoJSON", layer="clip2_OSM_SAGU", driver="GeoJSON", check_exists = FALSE)

writeOGR(clip2_OSM_DENA, dsn="Data/output/boundary/Denali_National_Park.GeoJSON", layer="clip2_OSM_DENA", driver="GeoJSON", check_exists = FALSE)
writeOGR(clip2_OSM_GLBA, dsn="Data/output/boundary/Glacier_Bay_National_Park.GeoJSON", layer="clip2_OSM_GLBA", driver="GeoJSON", check_exists = FALSE)
writeOGR(clip2_OSM_GAAR, dsn="Data/output/boundary/Gates_of_the_Artic_National_Park.GeoJSON", layer="clip2_OSM_GAAR", driver="GeoJSON", check_exists = FALSE)
writeOGR(clip2_OSM_KATM, dsn="Data/output/boundary/Katmai_National_Park.GeoJSON", layer="clip2_OSM_KATM", driver="GeoJSON", check_exists = FALSE)
writeOGR(clip2_OSM_KEFJ, dsn="Data/output/boundary/Kenai_Fjords_National_Park.GeoJSON", layer="clip2_OSM_KEFJ", driver="GeoJSON", check_exists = FALSE)
writeOGR(clip2_OSM_KOVA, dsn="Data/output/boundary/Kobuk_Valley_National_Park.GeoJSON", layer="clip2_OSM_KOVA", driver="GeoJSON", check_exists = FALSE)
writeOGR(clip2_OSM_LACL, dsn="Data/output/boundary/Lake_Clark_National_Park.GeoJSON", layer="clip2_OSM_LACL", driver="GeoJSON", check_exists = FALSE)
writeOGR(clip2_OSM_WRST, dsn="Data/output/boundary/Wrangell-St._Elias_National_Park_National_Park.GeoJSON", layer="clip2_OSM_WRST", driver="GeoJSON", check_exists = FALSE)

