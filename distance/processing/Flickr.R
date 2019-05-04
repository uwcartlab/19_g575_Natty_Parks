library(jsonlite)
#library(rjson)
library(geosphere)
library(tidyr)
library(lubridate)
library(dplyr)
library(rgdal)

###################################
getwd()
#prep
the_dir <- "input"
dir_ex <-"input/output"
dir_ex2 <-"input/output/distance"
geojson_input <- "input/geojson_input/buffer - Copy/"

check_create_dir <- function(the_dir) {
  if (!dir.exists(the_dir)) {
    dir.create(the_dir, recursive = TRUE) }
}

###################################
#json flickr data
filenames <- list.files(path = "input", pattern = "json", full.names = TRUE) 
#geojson OSM data
geojsonfileNames <- list.files(path = "input", pattern = ".GeoJSON", full.names = TRUE)

###################################
#calculating the distance to geolocated photos
flickr_array <- function(filename, the_dir) {
  print(filename)
  print("\n")
    #requires jsonlite, geosphere, tidyr
    #STEP 1. GET THE ARRAY
    #Load flickr location data and grab array from json #jsonlite
    dat <- jsonlite::fromJSON(readLines(filename), flatten = TRUE)
    dat_data <- dat[['features']]
    dat_data$id <- dat_data$properties.id
    # turns list to dataframe
    #dat_unlist <-unlist(dat_df$properties.coordinates)
    dat_df <- as.data.frame(dat_data)
    #dataframe into coordinate list
    dat_df_coord <- separate(dat_df, geometry.coordinates, c("long", "lat"), sep =". ", remove=TRUE)
    dat_df_coord$long <- as.numeric(gsub("c\\(", "", dat_df_coord$long))
    dat_df_coord$lat <- as.numeric(gsub("\\)", "", dat_df_coord$lat))
    myvars <- c("id", "long", "lat")
    dat_coord <- dat_df_coord[myvars]
    #write csv
    output_file = paste(filename,".csv")
    write.csv(dat_coord, file = paste0(dir_ex, "/", basename(output_file)),
              na = "NA", row.names=FALSE)
}

lapply(filenames, flickr_array, the_dir = the_dir)

#################################################
output_filenames <- list.files(path = dir_ex, pattern = ".csv", full.names = TRUE) 

flickr_sph_distance <- function(output_file,dir_ex2) {
  #STEP 2. CALCULATE DISTANCE
  #https://rspatial.org/sphere/2-distance.html#spherical-distance
  #requires rgdal
  #read data
  geojson <- readOGR(filename, dsn="geojson_input", layer="OGRGeoJSON")
  #get the csv
  dat_coord <- read.csv(path = dir_ex, file= readLines(filename))
  #readOGR(clip_OSM_DENA, dsn="Data/output/buffer/Denali_National_Park.GeoJSON", layer="clip_OSM_DENA", driver="GeoJSON", check_exists = FALSE)
  myvars <- c("long", "lat")
  dat_coord2 <- dat_coord[myvars]
  # spherical distance
  dat_coord3$distance <- d = dist2Line(dat_coord2, geojson)
 
  #write csv
  output_file = paste(filename,".csv")
  write.csv(dat_coord, file = paste0(dir_ex2, "/", basename(output_file)),
            na = "NA", row.names=FALSE)
}

lapply(output_filenames, flickr_sph_distance,dir_ex2=dir_ex2)








