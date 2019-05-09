##Spatial data pre-processing
#1. Clean up park use data for storytelling
#2.Basic descriptive stats
#3.Export cleaned data 
########################

#load packages
library(openxlsx)
library(sf)
library(sp)
library(rgdal)
library (maptools)
library(ggmap)

setwd("~/Desktop/UWM/GEO 575/Final Project")

#open datasets
#excel
#park area and usage (source:https//irma.nps.gov/Stats)
park_area<-read.xlsx("Data/NPS-Acreage-12-31-2018.xlsx", sheet=1, startRow=1, colNames=TRUE)
#number of visitors
park_visitation <-read.xlsx("Data/NPS_recreationuse.xlsx", sheet=1, startRow=1, colNames=TRUE)
#we could also get number of cars and number of overnight campers of different types (RV, tent-frontcountry, tent-backcountry)

#shapefile
NPSshape <- readOGR("Data/nps_boundary.shp")
#420

#make name key
#minor hand editing required for visitation spreadsheet (deleting "& PRES" for a couple visition numbers) pre-loading to get 1 to 1 match
nps<-subset(park_area, Park.Type=="NP", select=c(Area.Name))

#subset obs and variable
nps_area<-subset(park_area, Park.Type=="NP", select=c(Area.Name, State, Region, NPS.Fee.Acres))

#clean up text to match key
park_visitation$Area.Name <- toupper(park_visitation$Park.Name)

#subset by name field
nps_visitation <- merge(nps, park_visitation, by="Area.Name", all.x=TRUE)

#join
nps_characteristics <- merge(nps_area, park_visitation, by="Area.Name", all.x=TRUE)

########################
#descriptive stats
nrow(nps)
#60 NPs
#Area
#MIN - 85 - Gateway NP
#MEDIAN -177300 
#MEAN  - 841408
#MAX - 7956689  - Gates of the Artic NP
summary(npsArea$NPS.Fee.Acres)
#Visitors (2018)
summary(npsVisitation$y2018)
#MIN - 9591 - Gates of the Artic NP
#MEDIAN -656397
#MEAN  - 1425319
#MAX - 11421200  - Great Smoky Mountains NP

###spatial data processing
st_crs(NPSshape)
nrow()
nps_boundary <- merge(nps, NPSshape, by="Area.Name", all.x=TRUE)
nps_boundary<-subset(NPSshape, NPSshape$UNIT_TYPE=="National Park")
#n=61? why doesn't this match??

##########################
#export data
#csv
write.csv(nps_characteristics,file = "Data/nps_characteristics.csv",row.names=FALSE)

#spatial data
#ESRI
writeOGR(obj=nps_boundary, layer = 'nps_boundary',  'Data/', driver="ESRI Shapefile", check_exists = FALSE)

#GEOJSON
writeOGR(NPSshape, "nps_boundaries_geojson", layer="NPSshape", driver="GeoJSON")
writeOGR(obj=nps_boundary, dsn = "Data/", layer = "nps_boundary",  driver="GeoJSON")
writeOGR(obj=NPSshape, dsn="Data/", layer="NPSshape", driver="GeoJSON", check_exists = FALSE)

#polygons
ggplot() + 
  geom_sf(data = NPSshape, size = 3, color = "black", fill = "cyan1") + 
  ggtitle("National Park Boundaries") + 
  coord_sf()



