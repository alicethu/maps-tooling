var infoWindow, map, pos, cityCircle;
var markers = [];
var choiceMarkers = [];
var rad = 1000;//standard radius value 
var minPriceLvl = 0;;
var maxPriceLvl = 4

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
        document.getElementById("result-restaurant").style.visibility = 'hidden';
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
        updatePriceLevels();
        doNearbySearch(service, map);
    });

    //change the map to the input location
    const geocoder = new google.maps.Geocoder();
    document.getElementById("submitLocation").addEventListener("click", () => {
        geocodeAddress(geocoder, map);
    });

    // //resize the radius using the var "rad" which is used to draw the circle and create the nearbySearch results
    // //the issue is, when rad = an int, it works. When rad = doc.get, it does not
    // document.getElementById("submitRadius").addEventListener("click", () => {
    //       rad = document.getElementById("resize").value;
    //       cityCircle.setMap(null);//deletes the origial circle to avoid redraws
    //       createCityCircle();
    //     });

}//init map

function getPlaceDetails(map, restaurantChoice){
        const request = {
        placeId: restaurantChoice.place_id,
        fields: ["name", "formatted_address", "formatted_phone_number", "place_id", "geometry", "opening_hours", "website", "icon", "rating"]
    };
    const infowindow = new google.maps.InfoWindow();
    const service = new google.maps.places.PlacesService(map);

    document.getElementById("result-restaurant").style.visibility = 'hidden';
    document.getElementById("address").innerHTML = "";
    document.getElementById("phone").innerHTML = "";
    document.getElementById("website").innerHTML = "";
    document.getElementById("rating").innerHTML = "";

    service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
        const marker = new google.maps.Marker({
            map,
            position: place.geometry.location
        });
        choiceMarkers.push(marker);

        console.log("place " + place.name);
        if (place.name) {
            document.getElementById("result-restaurant").style.visibility = 'visible';
    
            document.getElementById("places").innerHTML = place.name;
            if(place.formatted_phone_number) {
                document.getElementById("address").innerHTML = '<i class="lni lni-restaurant"></i> Address : ' + place.formatted_address;
            } else {
                document.getElementById("address").innerHTML = "";
            }
            if(place.formatted_phone_number) {
                document.getElementById("phone").innerHTML = '<i class="lni lni-phone"></i> Phone : ' + place.formatted_phone_number;
            } else {
                document.getElementById("phone").innerHTML = "";
            }
            if (place.website) {
                if (place.website.length > 80) {
                    document.getElementById("website").innerHTML = 'Website : <a href="' + place.website.substring(0, 80) + '">Click here!</a>';
                } else {
                    document.getElementById("website").innerHTML = 'Website : <a href="' + place.website  + '">Click here!</a>';
                }
            } else {
                document.getElementById("website").innerHTML = "";
            }
            if (place.rating) {
                // <i class="lni lni-star"></i>
                document.getElementById("rating").innerHTML = '<i class="lni lni-star"></i> Rating : ' + place.rating;
            } else {
                document.getElementById("rating").innerHTML = "";
            }
            // if (place.icon) {
            //     document.getElementById("icon").src = place.icon;
            // } else {
            //     document.getElementById("icon").src = "/images/food.png";
            // }
            
        } else {
            console.log("No Restaurant found")
            document.getElementById("places").innerHTML = "Oops you're too picky, please try another search (choose another location, widen the radius, or change your filters)!";
            document.getElementById("address").innerHTML = "";
            document.getElementById("phone").innerHTML = "";
            document.getElementById("website").innerHTML = "";
            document.getElementById("rating").innerHTML = "";
        }

        google.maps.event.addListener(marker, "click", function() {
            infowindow.setContent(
            "<div><strong>" +
                place.name +
                "</strong><br>" +
                place.formatted_address +
                "</div>"
            );
            infowindow.open(map, this);
        });//eventListener

        }
    });
}//getPlaceDetails

// Update the radius as radius slider change and redraw the city circle
function range() {
    var p = document.getElementById('resize');
    var res = document.getElementById('radiusVal');
    rad = p.value;
    res.innerHTML=p.value+ " m";
    cityCircle.setMap(null);//deletes the origial circle to avoid redraws
    createCityCircle();
}

function updatePriceLevels() {
  var prices = ["price1", "price2", "price3", "price4"];
  for (i = 0; i < 4; i++) {
    if (document.getElementById(prices[i]).checked) {
      minPriceLvl = document.getElementById(prices[i]).value;
      break;
    }
  }
  for (i = minPriceLvl; i < 4; i++) {
    if (document.getElementById(prices[i]).checked) {
      maxPriceLvl = document.getElementById(prices[i]).value;
    }
  }
}

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
  removeAllElements();""
}//doGeolocation

/* performs the nearby search which returns the nearest restaurants within the specified radius and 
* calls the createMarker() function
*/

function doNearbySearch(service, map){
  //filters results based on whether the user checked opennow or did not check it.
  service.nearbySearch(
  {
      location: map.getCenter(),
      radius: rad,
      type: "restaurant",
      openNow: document.getElementById("getOpenNow").checked,
      minPriceLevel: minPriceLvl,  
      maxPriceLevel: maxPriceLvl
  },//specific parameters of the search
  (results, status, pagination) => {
      if (status !== "OK") { 
        document.getElementById("result-restaurant").style.visibility = 'visible';
        document.getElementById("places").innerHTML = "Oops you're too picky, choose another location or change your filters!";
        document.getElementById("title").innerHTML = "";
        document.getElementById("icon").innerHTML = "";
        document.getElementById("address").innerHTML = "";
        document.getElementById("phone").innerHTML = "";
        document.getElementById("website").innerHTML = "";
        document.getElementById("rating").innerHTML = "";
    };
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
    console.log("places length "+places.length)
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
        bounds.extend(place.geometry.location);

        //placesArray is redunant with the addition of markers, however it is still being actuvely used and I plan to clear it out 
        //after a UI is establised 
        placesArray.push(place);
    }//for loop

    //code to keep the map from resizing if there are no results
    if (placesArray.length > 0){
        setMapOnAll(map);// adds all the markers to the map via setMap()
        map.fitBounds(bounds);
    }//if there are results

    // Add restaurant choice 
    restaurantChoice = genRandomResult(placesArray); 

    //the place details request code
    getPlaceDetails(map, restaurantChoice);   
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
  for (let i = 0; i < choiceMarkers.length; i++) {
    choiceMarkers[i].setMap(map);
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
  choiceMarkers = [];
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
  const address = document.getElementById("geoaddress").value;
  document.getElementById("result-restaurant").style.visibility = 'hidden';
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
