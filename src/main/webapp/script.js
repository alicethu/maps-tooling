var infoWindow, map, pos, cityCircle;
var markers = [];
var rad = 1000;//standard radius value 

//Function called in the browser request, this is the "main" function 
function initMap() {
    //give the map a basic starting point
    var newyork = {
        lat: 40.7591703,
        lng: -74.0394425
    };
        
    // Create the map.
    map = new google.maps.Map(document.getElementById("map"), {
        center: newyork,
        zoom: 15
    });
        
    //Add button w click listener to enable location services
    document.getElementById("enableGeo").addEventListener("click", () => {
        infoWindow = new google.maps.InfoWindow;
        doGeolocation(infoWindow, map, pos);
    });

    // always draw the circle, this keeps things from breaking later
    //ideally will restructure to remove this necessity
    createCityCircle();

    //Redraw the circle and populate the search results
    const service = new google.maps.places.PlacesService(map);
    document.getElementById("results").addEventListener("click", () => {  
        cityCircle.setMap(null);//deletes the origial circle to avoid redraws
        createCityCircle();
        doNearbySearch(service, map);
    });

    //change the map to the input location
    const geocoder = new google.maps.Geocoder();
    document.getElementById("submitLocation").addEventListener("click", () => {
        geocodeAddress(geocoder, map);
    });

    //resize the radius using the var "rad" which is used to draw the circle and create the nearbySearch results
    //the issue is, when rad = an int, it works. When rad = doc.get, it does not
    document.getElementById("submitRadius").addEventListener("click", () => {
          rad = document.getElementById("resize").value;
          cityCircle.setMap(null);//deletes the origial circle to avoid redraws
          createCityCircle();
        });
}//init map

/*performs the geolocation service when requested; must be enabled by the user
* can also be called again at any time in order to access the data again
*/
function doGeolocation(infoWindow, map, pos){
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            infoWindow.open(map);
            map.setCenter(pos);

          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }//if and else

        removeAllElements();
}//doGeolocation

/* performs the nearby search which returns the nearest restaurants within the specified radius and 
* calls the createMarker() function
*/
function doNearbySearch(service, map){
        service.nearbySearch(
        {
            location: map.getCenter(),
            radius: rad,
            type: "restaurant"
        },//specific parameters of the search
        (results, status, pagination) => {
            if (status !== "OK") return;
            createMarkers(results, map);
            }
        );//nearbySearch

        removeAllElements();
}//doNearbySearch

/*creates the map bounds, the places list, and each marker which is added to the array markers. The markers are individually
* pushed and then placed on the map by the setMapOnAll() function. This method of creation allows for the easy hiding of markers
* if the user wants to check a different location
*/
function createMarkers(places, map) {
            const bounds = new google.maps.LatLngBounds();
            // const placesList = document.getElementById("places");
            const placesArray = [];
            for (let i = 0, place; (place = places[i]); i++) {
                const image = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25),
                    fillOpacity: 0.5
                };
                const marker = new google.maps.Marker({
                    //this when enabled adds the markers to the map. Getting rid of and using the built in setMap() function
                    //retaining for now (so that I don't forget about it as a second way of creating markers), will delete later
                    //if we decide to use the current method
                    //map, 
                    icon: image,
                    title: place.name,
                    position: place.geometry.location
                });
                
                markers.push(marker);

                // //this code deals with the HTML, which might be removed in the UI dev stage
                // const li = document.createElement("li");
                // li.textContent = place.name;
                // placesList.appendChild(li);
                bounds.extend(place.geometry.location);

                //placesArray is redunant with the addition of markers, however it is still being actuvely used and I plan to clear it out 
                //after a UI is establised 
                placesArray.push(place.name);
            }//for loop

            setMapOnAll(map);// adds all the markers to the map via setMap()
            map.fitBounds(bounds);

            // Add restaurant choice 
            restaurantChoice = genRandomResult(placesArray); 
            document.getElementById("places").innerHTML = restaurantChoice;
}//createMarkers

//code to generate a random location, currently stores/returns a place_id which can be used for place details requests
function genRandomResult(placesArray){
        var numResult = Math.floor(Math.random() * (placesArray.length));
        var restaurantChoice = placesArray[numResult];
        console.log("restaurant choice " + restaurantChoice)
        //alert(restaurantChoice);
        return restaurantChoice;
}//genRandomResult

//removes all elements from the <ul>
function removeAllElements(){
        document.getElementById("places").innerHTML = "";
        clearMarkers();
        deleteMarkers();
    }//removeAllElements

//puts all the markers on the map
function setMapOnAll(map) {
        for (let i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
        }
}//setMapOnAll

//sets all markers to null by using the setMapOnAll() function
function clearMarkers() {
        setMapOnAll(null);
}//clearMarkers

//removes markers from the array so that they do not display again when a new location is called
function deleteMarkers() {
        clearMarkers();
        markers = [];
}//deleteMarkers

//draws the visual representation of the radius
function createCityCircle(){
            cityCircle = new google.maps.Circle({
            strokeColor: "#6600ff",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#6666ff",
            fillOpacity: 0.35,
            map: map,
            center: map.getCenter(),
            radius: Number(rad)
            //radius: 1000
          });
}//createCityCircle

//lets the user know that their location services are not functioning
function handleLocationError(browserHasGeolocation, infoWindow, newyork) {
        infoWindow.setPosition(newyork);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
}//handleLocationError

//takes user input (street address, general location, etc) and turns it into coordinates
function geocodeAddress(geocoder, map) {
        const address = document.getElementById("address").value;
        geocoder.geocode(
          {
            address: address
          },
          (results, status) => {
            if (status === "OK") {
              map.setCenter(results[0].geometry.location);
              new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
              });
            } else {
              alert(
                "Geocode was not successful for the following reason: " + status
              );
            }
          }
        );
}//geocodeAddress