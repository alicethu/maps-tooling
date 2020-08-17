<!DOCTYPE html>
<html>
  <head>
    <title>Place Search Pagination</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://polyfill.io/v3/polyfill.min.js?features=default"></script>

    <script>
      var infoWindow, map, pos, cityCircle;
      var markers = [];

      function initMap() {
        // Create the map.
        var newyork = {
          lat: 40.7591703,
          lng: -74.0394425
        };

        map = new google.maps.Map(document.getElementById("map"), {
          center: newyork,
          zoom: 15
        });
        
        //Add button w click listener to enable location services
        document.getElementById("enableGeo").addEventListener("click", () => {
            infoWindow = new google.maps.InfoWindow;
            doGeolocation(infoWindow, map, pos);
        });

        createCityCircle(pos);// always draw the circle, this keeps things from breaking later

        //Redraw the circle and populate the search results
        const service = new google.maps.places.PlacesService(map);
        document.getElementById("results").addEventListener("click", () => {  
            cityCircle.setMap(null);//deletes the origial circle to avoid redraws
            createCityCircle(pos);
            doNearbySearch(service, map);
        });

        //change the map to the input location
        const geocoder = new google.maps.Geocoder();
        document.getElementById("submit").addEventListener("click", () => {
          geocodeAddress(geocoder, map);
        });
      }//init map


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
    }//doGeolocation

    function doNearbySearch(service, map){
        service.nearbySearch(
        {
            location: map.getCenter(),
            radius: 1000,
            type: "restaurant"
        },//specific parameters of the search
        (results, status, pagination) => {
            if (status !== "OK") return;
            createMarkers(results, map);
            }
        );//nearbySearch
    }//doNearbySearch

    function createMarkers(places, map) {
            const bounds = new google.maps.LatLngBounds();
            const placesList = document.getElementById("places");
            const placesArray = [];
            for (let i = 0, place; (place = places[i]); i++) {
            const image = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };
            const marker = new google.maps.Marker({
                //map, //this when enabled adds the markers to the map. Getting rid of and using the built in setMap() function
                icon: image,
                title: place.name,
                position: place.geometry.location
            });
            
            markers.push(marker);

            const li = document.createElement("li");
            li.textContent = place.name;
            placesList.appendChild(li);
            bounds.extend(place.geometry.location);
            placesArray.push(place.place_id);
            }//for loop

            setMapOnAll(map);
            map.fitBounds(bounds);
            //random result code
            var numResult = Math.floor(Math.random() * (placesArray.length));
            var restaurantChoice = placesArray[numResult];
            //alert(restaurantChoice);
        }//createMarkers

        function removeAllElements(){
            document.getElementById("places").innerHTML = "";
        }//removeAllElements

    function setMapOnAll(map) {
        for (let i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
        }
      }//setMapOnAll

    function clearMarkers() {
        setMapOnAll(null);
      }//clearMarkers

    function createCityCircle(pos){
        // Create the places service.
            cityCircle = new google.maps.Circle({
            strokeColor: "#6600ff",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#6666ff",
            fillOpacity: 0.35,
            map: map,
            center: map.getCenter(),
            radius: 1000
          });
    }//createCityCircle

    function handleLocationError(browserHasGeolocation, infoWindow, newyork) {
        infoWindow.setPosition(newyork);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
      }//handleLocationError

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

    </script>
  </head>
  
  <body>
    <div id="floating-panel">
      <input id="address" type="textbox" value="Sydney, NSW" />
      <input id="submit" type="button" value="Geocode" />
    </div>
    <div id="map"></div>

    <script
      src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBnHjJrXSDt16Vgg76YOzIBK1KTid0cfeI&callback=initMap&libraries=places&v=weekly"
      defer
    ></script>

    <div id="right-panel">
      <h2>Results</h2>
      <ul id="places"></ul>
      <button id="results">Generate Results</button>
      <button id="enableGeo">Use My Location</button>
      <input onclick="clearMarkers();" type="button" value="Hide Markers" />
      <input type="button" value="Remove All" onclick="removeAllElements()">
    </div>
  </body>
</html>