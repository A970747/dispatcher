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
  const [orderDescription, setOrderDescription] = useState('');
  const [originPlace, setOriginPlace] = useState('');
  const [destPlace, setDestPlace] = useState('');
  const [path, setPath] = useState('');
  const [orderMap, setOrderMap] = useState(null);
  const [originMarker, setOriginMarker] = useState(null);
  const [destMarker, setDestMarker] = useState(null);

  const [originLatLng, setOriginLatLng] = useState({});
  const [destLatLng, setDestLatLng] = useState({});

  const mapRef = useRef();
  const originRef = useRef();
  const destRef = useRef();

  const dispatch = useDispatch();
  const orders = useSelector(state => state.orders);

  function getDom() {
    //! just a ref on how to create the auto complete object
    let item = document.getElementById('googleID');
    console.log(item, originRef);
    let info = new window.google.maps.places.Autocomplete(originRef.current);
  }

  useEffect(() => {
    let newOrderMap = new window.google.maps.Map(mapRef.current, {
      zoom: 3,
      center: { lat: 49.884, lng: -97.147 }
    });
    setOrderMap(newOrderMap);

    let originAutoRef = new window.google.maps.places.Autocomplete(originRef.current);
    let destAutoRef = new window.google.maps.places.Autocomplete(destRef.current);
    originAutoRef.setFields(['address_component', 'formatted_address', 'geometry']);
    destAutoRef.setFields(['address_component', 'formatted_address', 'geometry']);
    originAutoRef.setComponentRestrictions({country: ["us", "ca", "mx"],});
    destAutoRef.setComponentRestrictions({country: ["us", "ca", "mx"],});

    originAutoRef.addListener('place_changed', function() {
      let originPlace = originAutoRef.getPlace();
      if(originPlace) {
        setOriginPlace(originPlace);
        setOrigin(originPlace.formatted_address);
        let latLng = { lat: originPlace.geometry.location.lat(), lng: originPlace.geometry.location.lng()};
        let marker = addMarker(latLng, newOrderMap, 'origin');
        setOriginMarker(marker);
        recenterMap(latLng, newOrderMap);
      }
    })

    destAutoRef.addListener('place_changed', function() {
      let destPlace = destAutoRef.getPlace();
      if(destPlace) {
        setDestPlace(destPlace);
        setDestination(destPlace.formatted_address);
        let latLng = { lat: destPlace.geometry.location.lat(), lng: destPlace.geometry.location.lng()};
        let marker = addMarker(latLng, newOrderMap, 'dest');
        setDestMarker(marker);
        recenterMap(latLng, newOrderMap);
      }
    })
  }, [])

  useEffect(() => {
    if (originMarker) originMarker.setMap(null)
  }, [originPlace])

  useEffect(() => {
    if (destMarker) destMarker.setMap(null)
  }, [destPlace])

  useEffect(() => console.log(orders), [orders])

  async function createOrder(e) {
    e.preventDefault();
    let orderObj = {};

    orderObj.origin = formatLocationReturn(originPlace);
    orderObj.destination = formatLocationReturn(destPlace);
    orderObj.description = orderDescription;
    orderObj.directions = await getOrderDirections(orderObj);

    originMarker.setMap(null);
    destMarker.setMap(null);
    setOrderDescription('');
    setOrigin('');
    setDestination('');
    setOriginPlace('')
    setDestPlace('');
    recenterMap(orderObj.origin.geoInfo);
    dispatch(addOrder(orderObj));
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
    //! not sure if I need location, keeping it for now but so far latlng literals work
    //  location: {...location},
    }

    return returnObj;
  }

  async function getOrderDirections(order) {
    const directionsService = new window.google.maps.DirectionsService();

    let originLatLng = {...order.origin.geoInfo};
    let destLatLng = {...order.destination.geoInfo};
    let req = {
      origin: originLatLng,
      destination: destLatLng,
      travelMode: 'DRIVING'
    }
    
    return new Promise((resolve, reject) => {
      directionsService.route(req, (res, status) => {
        if(status==='OK') {
          resolve(res.routes[0].overview_polyline)
        } else {
          reject(status);
        }
      })
    })

  }

  const addMarker = (latLngObj, map = orderMap, tail) => {
    if(map) {
      let marker = new window.google.maps.Marker({
        position: {...latLngObj},
        label: (tail == 'origin') ? 'O' : 'D',
        map
      });

      return marker;
    }
  }

  function recenterMap(latLngs, map = orderMap) {
    map.setCenter({...latLngs})
    map.setZoom(5);
  }

  //stuff to loop over to make map after we get encode path.
  function makeMap() {
    //path is saved in the object
    let decodedPath = new window.google.maps.geometry.encoding.decodePath(path);
    console.log('path', decodedPath);

    new window.google.maps.Polyline({
      path: decodedPath,
      strokeColor: "#FE7569",
      strokeOpacity: 1.0,
      strokeWeight: 3,
      title: "this is a line",
      map: orderMap,
    })
  }

  //probably don't need this unless we get to latlng only user input
  //function computeDistance() {
    //let distance = window.google.maps.geometry.spherical.computeDistanceBetween(originLatLng, destLatLng);
  //}

  return (
    <>
    <div id="map" ref={mapRef} className="googleMap"></div>
    <form onSubmit={(e) => createOrder(e)}>
      <input id="googleOrigin" value={origin} ref={originRef} placeholder='Enter origin'
        onChange={(e) => setOrigin(e.target.value)} type="text" required />
      <input  id="orderDescript" value={orderDescription} placeholder='Enter freight description' onChange={(e) => setOrderDescription(e.target.value)} type="text" />
      <input id="googleDest" value={destination}  ref={destRef} placeholder='Enter destination'
        onChange={(e) => {setDestination(e.target.value)}} type="text" required />
      <button type="submit">add order</button>
    </form>

    <button onClick={() => makeMap()}>map</button>
  </>
  );
}

export default App;

//<button onClick={() => computeDistance()}>distace</button>
//<button onClick={() => getDom()} >docu</button>