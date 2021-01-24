function App() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originLatLng, setOriginLatLng] = useState({});
  const [destLatLng, setDestLatLng] = useState({});
  const [placeInfo, setPlaceInfo] = useState('');

  const googleRef = useRef();
  const mapRef = useRef();
  console.log(googleRef);


  //this tests the way directions uses latlngs etc
/*   console.log('ord', order);
  const directionsService = new window.google.maps.DirectionsService();

  let point1 = { lat: 43.726, lng: -79.401}
  let point2 = { lat: 43.871, lng: -78.961}
  let originPt = new window.google.maps.LatLng(point1.lat, point1.lng);
  let destPt =  new window.google.maps.LatLng(point2.lat, point2.lng);

  console.log('pts', originPt, destPt);
  console.log('obj', order.origin.geoInfo.location.lat, order.origin.geoInfo.location.lng)
  //{lat: order.origin.geoInfo.lat, lng: order.origin.geoInfo.lng}
  //{lat: order.destination.geoInfo.lat, lng: order.destination.geoInfo.lng}
  let point3 = {
    lat: order.origin.geoInfo.location.lat(), 
    lng: order.origin.geoInfo.location.lng()
  };

  let point4 = {
    lat: order.destination.geoInfo.location.lat(), 
    lng: order.destination.geoInfo.location.lng()
  };

  let originPt2 = new window.google.maps.LatLng(point3.lat, point3.lng);
  let destPt2 =  new window.google.maps.LatLng(point4.lat, point4.lng);

  console.log('originpt', originPt, destPt, originPt2, destPt2,);
  let req = {
    origin: point3,
    destination: point4,
    travelMode: 'DRIVING'
  }
  
  directionsService.route(req, (res, status) => {
    console.log(res, 'status', status);
  }) */

  function getDom() {
    let item = document.getElementById('googleID');
    console.log(item, googleRef);
    let info = new window.google.maps.places.Autocomplete(googleRef.current);
    setPlaceInfo(info);
  }

  function printSelected() {
    console.log('im in print selected');
    let place = placeInfo.getPlace();
    console.log(place);
  }

  useEffect(() => {
    //console.log(window.google.maps.places.Autocomplete);
    //window.google.maps.places.Autocomplete()
  },[])

  function handleOrigin(address) {
    setOrigin(address)
  }
  
  function handleOriginSelect(address) {
    geocodeByAddress(address)
    .then(results => {console.log(results); return getLatLng(results[0])})
    .then(latLng => {setOriginLatLng(makeGoogleLatLng(latLng)); console.log('Success Origin', latLng)})
    .catch(error => console.error('Error', error));
    setOrigin(address);
  }

  function handleDestination(address) {
    setDestination(address)
  }
  
  function handleDestinationSelect(address) {
    geocodeByAddress(address)
    .then(results => {console.log(results); return getLatLng(results[0])})
    .then(latLng => {setDestLatLng(makeGoogleLatLng(latLng)); console.log('Success Dest', latLng);})
    .catch(error => console.error('Error', error));
    setDestination(address);
  }

  function makeGoogleLatLng(latLngObj) {
    //console.log('making ll with:', latLngObj.lat, latLngObj.lng)
    let newLL = new window.google.maps.LatLng(latLngObj.lat, latLngObj.lng)
    //console.log('newLL', newLL)
    return newLL
  }

  function makeMap() {
    console.log(mapRef, originLatLng, destLatLng);
    let map = new window.google.maps.Map(mapRef.current, {
      zoom: 7,
      center: { lat: 43.726, lng: -79.401}
    });

    //toronto lat lng  43.726, -79.401
    let point1 = { lat: 43.726, lng: -79.401}
    let point2 = { lat: 43.871, lng: -78.961}
    new window.google.maps.Polyline({
      path: [
        new window.google.maps.LatLng(point1.lat, point1.lng),
        new window.google.maps.LatLng(point2.lat, point2.lng),
      ],
      strokeColor: "#FE7569",
      strokeOpacity: 1.0,
      strokeWeight: 3,
      title: "this is a line",
      map: map
    })

    var pinColor = "FE7569";
    var pinImage = new window.google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
        new window.google.maps.Size(21, 34),
        new window.google.maps.Point(0,0),
        new window.google.maps.Point(10, 34));
    var pinShadow = new window.google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
        new window.google.maps.Size(40, 37),
        new window.google.maps.Point(0, 0),
        new window.google.maps.Point(12, 35));

    new window.google.maps.Marker({
      position: point1,
      animation: window.google.maps.Animation.DROP,
      icon: pinImage,
      shadow: pinShadow,
      map,
      title: "point1",
    })
    new window.google.maps.Marker({
      position: point2,
      animation: window.google.maps.Animation.DROP,
      map,
      title: "point1",
    })

    //poly.setMap(map);

    //const path = poly.getPath();
    //path.push(point1);
/*     new window.google.maps.Marker({
      postition: point1,
      title: "#" + path.getLength(),
      map: map,
    }) */
    //path.push(point2);
/*    new window.google.maps.Marker({
      postition: point2,
      title: "#" + path.getLength(),
      map: map,
    }) */
  }

  function computeDistance() {
    let distance = window.google.maps.geometry.spherical.computeDistanceBetween(originLatLng, destLatLng);
    //console.log('this is distance', distance);
  }

  return (
    <>
    <div id="map" ref={mapRef} className="googleMap"></div>
    <input id="googleID" ref={googleRef} type="text" onSelect={() => printSelected()}/>
    <button onClick={() => computeDistance()}>distace</button>
    <button onClick={() => getDom()} >docu</button>
    <button onClick={() => makeMap()}>map</button>
  </>
  );
}

export default App;

/* 
<iframe
src={`https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_googleKey}
  &q=Space+Needle,Seattle+WA`} allowfullscreen>
</iframe>
*/