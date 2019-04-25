let app = express();
var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('/maps/map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });
}

app.listen(7000, () => {
    console.log('Server is running on port 3000')
});
