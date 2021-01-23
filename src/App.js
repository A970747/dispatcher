import React, {useState, useEffect, useRef} from 'react'
import { useSelector, useDispatch} from 'react-redux';
import { addOrder } from './store/actions/orderAction'
import _ from 'lodash';
import app from './app.css'

//directionsapi
//maps/embed/v1/directions

function App() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [orderDescript, setOrderDescript] = useState('');
  const [originPlace, setOriginPlace] = useState(null);
  const [destPlace, setDestPlace] = useState(null);
  const [originAutoRef, setOriginAutoRef] = useState('');
  const [destAutoRef, setDestAutoRef] = useState('');

  const [originLatLng, setOriginLatLng] = useState({});
  const [destLatLng, setDestLatLng] = useState({});

  const mapRef = useRef();
  const originRef = useRef();
  const destRef = useRef();

  const dispatch = useDispatch();
  const orders = useSelector(state => state);

  function getDom() {
    //! just a ref on how to create the auto complete object
    let item = document.getElementById('googleID');
    console.log(item, originRef);
    let info = new window.google.maps.places.Autocomplete(originRef.current);
  }

  useEffect(() => {
    let originAutoRef = new window.google.maps.places.Autocomplete(originRef.current);
    let destAutoRef = new window.google.maps.places.Autocomplete(destRef.current);
    originAutoRef.setFields(['address_component', 'formatted_address', 'geometry']);
    destAutoRef.setFields(['address_component', 'formatted_address', 'geometry']);
    setOriginAutoRef(originAutoRef);
    setDestAutoRef(destAutoRef);
    new window.google.maps.event.addListener(originAutoRef, 'place_changed', () => {
      let originPlace = originAutoRef.getPlace();
      if(originPlace) {
        setOriginPlace(originPlace);
        setOrigin(originPlace.formatted_address);
      }
    })
    new window.google.maps.event.addListener(destAutoRef, 'place_changed', () => {
      let destPlace = destAutoRef.getPlace();
      if(destPlace) {
        setDestPlace(destPlace);
        setDestination(destPlace.formatted_address);
      }
    })
  },[])

/*   useEffect(() => {
    console.log(origin);
  }, [origin])

  useEffect(() => {
    console.log(destination);
  }, [destination]) */

  /*  useEffect(() => {
    console.log(originPlace);
  }, [originPlace])

  useEffect(() => {
    console.log(destPlace);
  }, [destPlace]) */

  function createOrder(e) {
    e.preventDefault();
    let orderObj = {};
    orderObj.origin = formatLocationReturn(originPlace);
    orderObj.destination = formatLocationReturn(destPlace);

    getDirections(orderObj);
  }

  function formatLocationReturn({formatted_address, address_components, geometry: {location}} = {}) {
    let returnObj = {};
    returnObj.full_address = formatted_address;

    [['locality','city'], ['administrative_area_level_1', 'region'],['country', 'country']].forEach(geoLevel => {

      address_components.forEach( addressLevel => {
        if (addressLevel.types.find(type => geoLevel[0] === type)) {
          returnObj[geoLevel[1]] =  addressLevel.short_name;
        }
      })
    })


    returnObj.geoInfo = {
      lat: location.lat(),
      lng: location.lng(),
    //  location: {...location},
    }

    console.log('return obj', returnObj);
    return returnObj;
  }

  function getDirections(order) {
    const directionsService = new window.google.maps.DirectionsService();

    let originLatLng = {...order.origin.geoInfo};
    let destLatLng = {...order.destination.geoInfo};

    let req = {
      origin: originLatLng,
      destination: destLatLng,
      travelMode: 'DRIVING'
    }
    
    directionsService.route(req, (res, status) => {
      console.log(res, 'status', status);
    })
  }

  //stuff to loop over to make map after we get encode path.
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

  //probably don't need this unless we get to latlng only user input
  //function computeDistance() {
    //let distance = window.google.maps.geometry.spherical.computeDistanceBetween(originLatLng, destLatLng);
    //console.log('this is distance', distance);
  //}
  
  function makeGoogleLatLng(latLngObj) {
    //console.log('making ll with:', latLngObj.lat, latLngObj.lng)
    let newLL = new window.google.maps.LatLng(latLngObj.lat, latLngObj.lng)
    //console.log('newLL', newLL)
    return newLL
  }

  return (
    <>
    <div id="map" ref={mapRef} className="googleMap"></div>
    <form onSubmit={(e) => createOrder(e)}>
      <input value={origin} id="googleOrigin" ref={originRef}
        onChange={(e) => setOrigin(e.target.value)} type="text"/>
      <input  id="orderDescript" onChange={(e) => setOrderDescript(e.target.value)} type="text"/>
      <input value={destination} id="googleDest" ref={destRef}
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