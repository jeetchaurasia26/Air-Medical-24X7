function initMap() {
  // Set your Dubai location coordinates
  var location = { lat: 25.2429, lng: 55.3530 }; // 310, Al Garhoud Community, Dubai

  // Create a map centered at your location
  var map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: location,
    scrollwheel: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [
      {
        "featureType": "administrative.country",
        "elementType": "geometry",
        "stylers": [
          { "visibility": "simplified" },
          { "hue": "#ff0000" }
        ]
      }
    ]
  });

  // Add a marker
  var marker = new google.maps.Marker({
    position: location,
    map: map,
    title: "310, Al Garhoud Community Dubai Autism Center, Near Dubai International Airport Terminal 1 - Dubai - UAE",
    icon: "images/loc.png" // Optional custom pin
  });
}
