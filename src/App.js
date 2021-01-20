import React, {useState, useEffect, useRef} from 'react'
import PlacesAutocomplete, {geocodeByAddress,getLatLng,} from 'react-places-autocomplete';
import app from './app.css'

//directionsapi
//maps/embed/v1/directions

function App() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originLatLng, setOriginLatLng] = useState({});
  const [destLatLng, setDestLatLng] = useState({});
  const [originAutoRef, setOriginAutoVal] = useState('');
  const [destAutoRef, setDestAutoVal] = useState('');
  const [orderDescript, setOrderDescript] = useState('');

  const mapRef = useRef();
  const originRef = useRef();
  const destRef = useRef();

  function getDom() {
    //! just a ref on how to create the auto complete object
    let item = document.getElementById('googleID');
    console.log(item, originRef);
    let info = new window.google.maps.places.Autocomplete(originRef.current);
  }

  useEffect(() => {
    let originAutoRef = new window.google.maps.places.Autocomplete(originRef.current);
    let destAutoRef = new window.google.maps.places.Autocomplete(destRef.current);
    originAutoRef.setFields(['address_component', 'geometry']);
    destAutoRef.setFields(['address_component', 'geometry']);
    new window.google.maps.event.addListener(originAutoRef, 'place_changed', () => {
      let place = originAutoRef.getPlace();
      console.log(place);
    })
    new window.google.maps.event.addListener(destAutoRef, 'place_changed', () => {
      let place = destAutoRef.getPlace();
      console.log(place);
    })
    setOriginAutoVal(originAutoRef);
    setDestAutoVal(destAutoRef);
  },[])

  function createOrder() {
    console.log('WHY?')
    console.log('THIS SHOULD WORK', originRef, destRef);
    console.log('this input values', origin, destination);
    console.log('creating order');
    let originAuto = originAutoRef.getPlace();
    let destinationAuto = destAutoRef.getPlace();
    console.log('here is order info: \n', originAuto, orderDescript, destinationAuto);



    let newLL = new window.google.maps.LatLng()
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

    //these are decimal degrees
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
  }

  function computeDistance() {
    let distance = window.google.maps.geometry.spherical.computeDistanceBetween(originLatLng, destLatLng);
    //console.log('this is distance', distance);
  }

  function handleChange({target}) {
    if(target.id === 'googleOrigin') {
      console.log('in origin field');
      let place = originAutoRef.getPlace() ?? null;
      console.log(place.address_components[0].long_name ?? null);
      if(place) {
        console.log('PLACE EXISTS');
      }
    }

    if(target.id === 'googleDest') {
      console.log('in dest field');
      let place = destAutoRef.getPlace();
      console.log(place.address_components[0].long_name ?? null);
      if(place) {
        console.log('PLACE EXISTS');
      }
    }
  }
//setOrigin(e.target.value)
  return (
    <>
    <div id="map" ref={mapRef} className="googleMap"></div>
    <form onSubmit={() => createOrder()}>
      <input value={origin} id="googleOrigin" ref={originRef} onSelect={(e) => console.log(e.target.value)}
        onChange={(e) => setOrigin(e.target.value)} type="text"/>
      <input  id="orderDescript" onChange={(e) => setOrderDescript(e.target.value)} type="text"/>
      <input value={destination} id="googleDest" ref={destRef} onSelect={(e) => console.log(e.target.value)}
      onChange={(e) => setDestination(e.target.value)} type="text"/>
      <button type="submit">submit</button>
    </form>
{/*     <button onClick={() => computeDistance()}>distace</button>
    <button onClick={() => getDom()} >docu</button>
    <button onClick={() => makeMap()}>map</button> */}
  </>
  );
}

export default App;