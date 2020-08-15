<!DOCTYPE html>
<html>
  <head>
    <title>Place Search Pagination</title>

    <script src="https://polyfill.io/v3/polyfill.min.js?features=default"></script>

    <style type="text/css">
      /* Always set the map height explicitly to define the size of the div
       * element that contains the map. */
      #map {
        height: 100%;
      }
      /* Optional: Makes the sample page fill the window. */
      html,
      body {
        height: 100%;
        margin: 0;
        padding: 0;
      }
      #right-panel {
        font-family: "Roboto", "sans-serif";
        line-height: 30px;
        padding-left: 10px;
      }
      #right-panel select,
      #right-panel input {
        font-size: 15px;
      }
      #right-panel select {
        width: 100%;
      }
      #right-panel i {
        font-size: 12px;
      }
      #right-panel {
        font-family: Arial, Helvetica, sans-serif;
        position: absolute;
        right: 5px;
        top: 60%;
        margin-top: -195px;
        height: 330px;
        width: 200px;
        padding: 5px;
        z-index: 5;
        border: 1px solid #999;
        background: #fff;
      }
      h2 {
        font-size: 22px;
        margin: 0 0 5px 0;
      }
      ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
        height: 271px;
        width: 200px;
        overflow-y: scroll;
      }
      li {
        background-color: #f1f1f1;
        padding: 10px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
      li:nth-child(odd) {
        background-color: #fcfcfc;
      }
      #more {
        width: 100%;
        margin: 5px 0 0 0;
      }
    </style>

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
        const service = new google.maps.places.PlacesService(map);
        service.nearbySearch(
          {
            location: map.getCenter(),
            radius: 1000,
            type: "restaurant"
          },
          (results, status, pagination) => {
            if (status !== "OK") return;
            createMarkers(results, map);
            moreButton.disabled = !pagination.hasNextPage;
            if (pagination.hasNextPage) {
              getNextPage = pagination.nextPage;
            }
          }
        );
          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }//if and else

        
      }//init map
    
    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
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
        var numResult = Math.floor(Math.random() * 20);
        var restaurantChoice = placesArray[numResult];
        alert(restaurantChoice);
      }
    </script>
  </head>
  <body>
    <div id="map"></div>
    
    <script
      src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBnHjJrXSDt16Vgg76YOzIBK1KTid0cfeI&callback=initMap&libraries=places&v=weekly"
      defer
    ></script>
    
    <div id="right-panel">
      <h2>Results</h2>
      <ul id="places"></ul>
    </div>
  </body>
</html>