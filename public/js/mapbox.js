/* eslint-disable */

window.addEventListener("load", () => {
  mapboxgl.accessToken =
    "pk.eyJ1IjoidGlra2lyaWtraSIsImEiOiJjazJraXZvaWcxaDV1M2hudG9pdDMwZDkyIn0.e0Ad9j8kg2QHvwvoRta52g";
  var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/tikkirikki/ck2kj57900bk61cobq8t1nry8",
    scrollZoom: false
    //center: [-118, 34],
    //zoom: 8
  });

  const locations = JSON.parse(
    document.querySelector("#map").dataset.locations
  );

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    const el = document.createElement("div");
    el.className = "marker";

    new mapboxgl.Marker({
      element: el,
      anchor: "bottom"
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 200,
      left: 100,
      right: 100
    }
  });

  console.log(locations);
});
