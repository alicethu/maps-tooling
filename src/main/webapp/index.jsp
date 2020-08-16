<!DOCTYPE html>
<html>
  <head>
    <title>Place Search Pagination</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://polyfill.io/v3/polyfill.min.js?features=default"></script>

    <script>
      var infoWindow, map, pos;

      function initMap() {
        // Create the map.
        var newyork = {
          lat: 40.7591703,
          lng: -74.0394425
        };

        map = new google.maps.Map(document.getElementById("map"), {
          center: newyork,
          zoom: 17
        });

        infoWindow = new google.maps.InfoWindow;
        // Try HTML5 geolocation.
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

        //Draw the circle and populate the search results
            const service = new google.maps.places.PlacesService(map);
            document.getElementById("results").addEventListener("click", () => {  
            createCityCircle(pos);
            doNearbySearch(service, map);
             });

        //change the map to the input location
        const geocoder = new google.maps.Geocoder();
        document.getElementById("submit").addEventListener("click", () => {
          geocodeAddress(geocoder, map);
        });
      }//init map

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

    function createCityCircle(pos){
        // Create the places service.
        const cityCircle = new google.maps.Circle({
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
          new google.maps.Marker({
            map,
            icon: image,
            title: place.name,
            position: place.geometry.location
          });
          const li = document.createElement("li");
          li.textContent = place.name;
          placesList.appendChild(li);
          bounds.extend(place.geometry.location);
          placesArray.push(place.place_id);
        }
        map.fitBounds(bounds);
        var numResult = Math.floor(Math.random() * (placesArray.length));
        var restaurantChoice = placesArray[numResult];
        alert(restaurantChoice);
      }//createMarkers

      function geocodeAddress(geocoder, resultsMap) {
        const address = document.getElementById("address").value;
        geocoder.geocode(
          {
            address: address
          },
          (results, status) => {
            if (status === "OK") {
              resultsMap.setCenter(results[0].geometry.location);
              new google.maps.Marker({
                map: resultsMap,
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
    </div>
  </body>
</html>

