#1. Import bounding box
#2. Make corners
#3. Make custom projects
#4. Convert park roads to 10m raster
#5. Calculate distance to road within buffer
#6. import flickr data csv with id, coords
#7. add distance attribute
#8. export geotiff and csv

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

###################
#CHANGE THE DIRECTORIES
geojson_input_dir <- "Data/Distance/geojson_adj"
flickr_input_dir <- "Data/Distance/csv"
nps_dir <- "Data/Distance/nps_boundary"
output_dir <- "Data/Distance/output/euclidean_distance"

#standard projs
wgs84 <- "+proj=longlat +datum=WGS84 +ellps=WGS84 +towgs84=0,0,0" 

aea_proj <-"+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=37.5 +lon_0=-110
+x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m"

#CHANGE DIRECTORIES
#geojsons are here:
#GitHub/19_g575_Natty_Parks/distance/data/geojson/roads/buffer/refined
#nps buffered boundaries are here:
#GitHub/19_g575_Natty_Parks/distance/data/geojson/buffered_boundary
#(its a shapefile)
#flickr coordinate csvs are here:
#GitHub/19_g575_Natty_Parks/distance/data/csv/flickr_input
#make an output folder (or save it right in github)
#prep to data
geojson_filename = paste(trimws(geojson_input_dir),"/Haleakala_National_Park.GeoJSON",sep="")
print(geojson_filename)
csv_filename = paste(trimws(flickr_input_dir),"/Haleakala_National_Park.csv",sep="")
print(csv_filename)
buffer_filename = paste(trimws(nps_dir),"/nps_plus_buffer.shp",sep="")
print(buffer_filename)
csv_filename_out = paste(trimws(output_dir),"/Haleakala_National_Park.csv",sep="")
geojson_filename_out = paste(trimws(output_dir),"/Haleakala_National_Park.GeoJSON",sep="")
print(geojson_filename_out)
bb <- readOGR(dsn=buffer_filename)
bb2 <- spTransform(bb, CRS(wgs84))  
clip_bb <- subset(bb2, UNIT_CODE=="HALE")
#"ACAD", "ARCH", "BADL", "BIBE", 
# "BRCA", "CANY", "CARE", "CAVE", 
#"CHIS", "CRLA", "CUVA", "DENA",
#"DEVA", "EVER", "GLAC", "GLBA",
#"GRCA", "GRSM", "GRTE", "HALE",
#"HAVO", "JOTR", "KICA", "LAVO",
#"MEVE", "MORA", "OLYM", "HALE", 
#"PINN", "REDW", "ROMO", "SAGU",
#"SEQU", "SHEN", "VIIS", "YELL",

#bounding box for proj
boundb <-bbox(clip_bb)
#bounding box for extents
e <- list()
for (i in 1:length(clip_bb)) {
  e[[i]] <- extent(clip_bb[i,])
}

#centering
lat_1 <- round(boundb[2,1] + (((1/3)*(boundb[2,2] -boundb[2,1]))),1)
lat_2 <- round(boundb[2,1] + (((2/3)*(boundb[2,2] -boundb[2,1]))),1)
lat_0 <- round(boundb[2,1] + ((boundb[2,2]-boundb[2,1])/2),1)
lon_0 <- round(boundb[1,1] + ((boundb[1,2]-boundb[1,1])/2),1)

aea_proj_HALE <- paste("+proj=aea +lat_1=",trimws(lat_1)," +lat_2=",trimws(lat_2)," +lat_0=",trimws(lat_0),
                       " +lon_0=",trimws(lon_0),"+x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m", sep="")

print(aea_proj_HALE)

#make a raster for a single park extent using these extents

r <- raster()
bb <- extent(e[[1]])
extent(r) <- bb
res(r) <- 20
r <- setExtent(r, bb)
#setValues(r,1)
r[] <- NA 
#crs(r) <- aea_proj_BRCA

r2 <- projectRaster(r, crs=aea_proj_HALE, res=15)


####################
#6. Calculate distance to road within buffer
#proj roads
HALE <- readOGR(geojson_filename)
HALE_roads <- spTransform(HALE, CRS(aea_proj_HALE))
#make road raster
roads.r <- rasterize(HALE_roads, r2, field=1)


#make distance raster
roaddist.r <- distance(roads.r)
roaddist.r
#crs(roaddist.r) <- aea_proj_BADL
#plots
roaddist_r_mask <- mask(roaddist.r, clip_bb)
# 1. Open jpeg file
#jpeg("PEFOonlands_NP_hist.jpg", width = 350, height = "350")
# 2. Create the plot
#hist(roaddist.r, xlab="Meters", main="Canyonlands NP - Distance from Road")
# 3. Close the file
#dev.off()

# 1. Open jpeg file
#jpeg("Canyonlands_NP_rplot.jpg", width = 350, height = "350")
# 2. Create the plot
#plot(roaddist_r_mask, xlab="Meters", main="Canyonlands NP - Distance from Road")
# 3. Close the file
#dev.off()

#map
#plot(r)
#lines(nps_plus_buffer[55,])
#lines(clip2_OSM_AZ, add=TRUE)

##plot(roaddist.r)
#lines(clip2_OSM_AZ)

##############
#7.load flickr csv from json 
#coordinates
#id
HALE_csv<-read.csv(csv_filename, head=TRUE, sep=",",stringsAsFactors=FALSE)

##############
#8. extract value to point
#make spdf
HALE_spdf <- SpatialPointsDataFrame(HALE_csv[,2:3],
                                    HALE_csv,    #the R object to convert
                                    proj4string = CRS("+proj=longlat +datum=WGS84 +ellps=WGS84 +towgs84=0,0,0"))   # assign a CRS 
HALE_flickr <- spTransform(HALE_spdf, CRS(aea_proj_HALE))

#value to point                          
distance <- raster::extract(roaddist.r, HALE_flickr)
HALE_distance <- unlist(distance)
HALE$distance2 <-as.data.frame(HALE$distance)
#HALE_distance2 <- as.data.frame(HALE_distance)
HALE_distance3$distance <-HALE_distance2$HALE_distance
HALE_distance4 <- cbind(HALE_csv,HALE_distance3)
#myvars <- c("id", "long", "lat", "distance")
#HALE_distance2 <- HALE_distance2[myvars]
##############
#9. write files
#write csv
write.csv(HALE_distance4, file = csv_filename_out,row.names=FALSE)

#shapefiles of roads for testing
#writeOGR(obj=OSM_AZ_roads, layer = 'OSM_AZ_roads',  'C:/Users/Sullivan/Desktop/GEO575 Project/nps_boundary/OSM_AZ_roads.shp', driver="ESRI Shapefile", check_exists = FALSE)
#writeOGR(obj=Petrified_Forest_NP_df_coord, layer = 'Petrified_Forest_NP_df_coord',  'C:/Users/Sullivan/Desktop/GEO575 Project/nps_boundary/Petrified_Forest_NP_df_coord.shp', driver="ESRI Shapefile", check_exists = FALSE)

#write raster for testing
writeRaster(roaddist.r, geojson_filename_out, "GTiff", overwrite=TRUE)