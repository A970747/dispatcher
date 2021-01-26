import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { addOrder } from './store/actions/orderAction'
import GenRoutes from './components/GenRoutes';
import { AppBar, Button, Tabs, Tab, TextField } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import TabPanel from './components/material-components/TabPanel'
import app from './app.css';

function App() {
  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.paper,
    },
  }));

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [orderDescription, setOrderDescription] = useState('');
  const [originPlace, setOriginPlace] = useState('');
  const [destPlace, setDestPlace] = useState('');
  const [orderMap, setOrderMap] = useState(null);
  const [originMarker, setOriginMarker] = useState(null);
  const [destMarker, setDestMarker] = useState(null);
  const [polylineArray, setPolylineArray] = useState([]);
  const [tabValue, setTabValue] = React.useState(0);

  const classes = useStyles();
  const mapRef = useRef();
  const originRef = useRef();
  const destRef = useRef();

  const dispatch = useDispatch();
  const orders = useSelector(state => state.orders);



  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  useEffect(() => {
    const getData = async () => {
      const map = await loadMap();
      setOrderMap(map);
    }

    getData();
  }, [])

  useEffect(() => {
    if (orderMap) {
      setAutoComplete()
    };

  }, [orderMap])

  useEffect(() => {
    if (originMarker) originMarker.setMap(null)
  }, [originPlace])

  useEffect(() => {
    if (destMarker) destMarker.setMap(null)
  }, [destPlace])

  useEffect(() => {
    mapOrders();
  }, [orders])

  function loadMap() {
    return new Promise((resolve, reject) => {
      let map = new window.google.maps.Map(mapRef.current, {
        zoom: 3,
        center: { lat: 49.884, lng: -97.147 }
      });

      if (map) {
        resolve(map)
      } else {
        reject('map not set');
      }
    })
  };

  function setAutoComplete() {
    let originAutoRef = new window.google.maps.places.Autocomplete(originRef.current);
    let destAutoRef = new window.google.maps.places.Autocomplete(destRef.current);
    originAutoRef.setFields(['address_component', 'formatted_address', 'geometry']);
    destAutoRef.setFields(['address_component', 'formatted_address', 'geometry']);
    originAutoRef.setComponentRestrictions({ country: ["us", "ca", "mx"], });
    destAutoRef.setComponentRestrictions({ country: ["us", "ca", "mx"], });

    originAutoRef.addListener('place_changed', function () {
      let originPlace = originAutoRef.getPlace();
      if (originPlace) {
        setOriginPlace(originPlace);
        setOrigin(originPlace.formatted_address);
        let latLng = { lat: originPlace.geometry.location.lat(), lng: originPlace.geometry.location.lng() };
        let marker = addMarker(latLng, 'origin');
        setOriginMarker(marker);
        recenterMap(latLng);
      }
    })

    destAutoRef.addListener('place_changed', function () {
      let destPlace = destAutoRef.getPlace();
      if (destPlace) {
        setDestPlace(destPlace);
        setDestination(destPlace.formatted_address);
        let latLng = { lat: destPlace.geometry.location.lat(), lng: destPlace.geometry.location.lng() };
        let marker = addMarker(latLng, 'dest');
        setDestMarker(marker);
        recenterMap(latLng);
      }
    })
  }

  //! this is inneficient, it should check to see whats new and just add whats new
  function mapOrders() {
    removeOrderPolylines();
    let polycopy = []
    orders.forEach(order => {
      const decodedPath = window.google.maps.geometry.encoding.decodePath(order.directions);
      let polyline = new window.google.maps.Polyline({
        path: decodedPath,
        strokeColor: order.color,
        strokeOpacity: 1.0,
        strokeWeight: 3,
      });
      polyline.setMap(orderMap);
      polycopy.push(polyline);
    })
    setPolylineArray(polycopy);
  }

  //! need check to make sure user has selected a "place" so we can get geo info
  async function createOrder(e) {
    e.preventDefault();
    let orderObj = {};

    orderObj.origin = formatLocationReturn(originPlace);
    orderObj.destination = formatLocationReturn(destPlace);
    orderObj.description = orderDescription;
    orderObj.directions = await getOrderDirections(orderObj);
    orderObj.strtLnDist = calcStraightLineDist();

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

  function formatLocationReturn({ formatted_address, address_components, geometry: { location } } = {}) {
    let returnObj = {};
    returnObj.full_address = formatted_address;

    [['locality', 'city'], ['administrative_area_level_1', 'region'], ['country', 'country']].forEach(geoLevel => {
      address_components.forEach(addressLevel => {
        if (addressLevel.types.find(type => geoLevel[0] === type)) {
          returnObj[geoLevel[1]] = addressLevel.short_name;
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

  function getOrderDirections(order) {
    const directionsService = new window.google.maps.DirectionsService();

    let originLatLng = { ...order.origin.geoInfo };
    let destLatLng = { ...order.destination.geoInfo };
    let req = {
      origin: originLatLng,
      destination: destLatLng,
      travelMode: 'DRIVING'
    }

    return new Promise((resolve, reject) => {
      directionsService.route(req, (res, status) => {
        if (status === 'OK') {
          resolve(res.routes[0].overview_polyline)
        } else {
          reject(status);
        }
      })
    })
  }

  const addMarker = (latLngObj, tail) => {
    let marker = new window.google.maps.Marker({
      position: { ...latLngObj },
      label: (tail == 'origin') ? 'O' : 'D',
      map: orderMap
    });

    return marker;
  }

  function recenterMap(latLngs) {
    orderMap.setCenter({ ...latLngs })
    orderMap.setZoom(5);
  }

  function removeOrderPolylines() {
    polylineArray.forEach(each => {
      each.setMap(null);
    });
  }

  function toggleOrderPolylines() {
    polylineArray.forEach(polyline => {
      (polyline.visible == false) ? polyline.setVisible(true) : polyline.setVisible(false)
    });
  }

  function calcStraightLineDist() {
    const origin = originPlace.geometry.location
    const dest = destPlace.geometry.location

    let distance = window.google.maps.geometry.spherical.computeDistanceBetween(origin, dest);
    let kms = distance / 1000;
    return kms;
  }

  const handleTabValues = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <>
      <AppBar position="static">
        <Tabs value={tabValue} onChange={handleTabValues} aria-label="simple tabs example">
          <Tab label="Orders" {...a11yProps(0)}/>
          <Tab label="Routes" {...a11yProps(1)}/>
          <Tab label="Drivers" {...a11yProps(2)}/>
        </Tabs>
      </AppBar>
      <Box>
      <div id="map" ref={mapRef} className="googleMap"></div>
      </Box>
      <TabPanel value={tabValue} index={0}>
        <form onSubmit={(e) => createOrder(e)}>
          <TextField id="googleOrigin" value={origin} inputRef={originRef} placeholder='Enter origin' onChange={(e) => setOrigin(e.target.value)}
            type="text" required />
          <TextField id="orderDescript" value={orderDescription} placeholder='Enter freight description'
            onChange={(e) => setOrderDescription(e.target.value)} type="text" />
          <TextField id="googleDest" value={destination} inputRef={destRef} placeholder='Enter destination'
            onChange={(e) => { setDestination(e.target.value) }} type="text" required />
          <Button color="primary" variant="contained" type="submit">add order</Button>
        </form>
        <Button color="primary" variant="contained" onClick={() => toggleOrderPolylines()}>toggle order paths</Button>
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <GenRoutes orderMap={orderMap} removeOrders={() => removeOrderPolylines()} />
      </TabPanel>
    </>
  );
}

export default App;

//<button onClick={() => toggleOrderPolylines()}>toggle order paths</button>

{/* <form >
<input id="googleOrigin" value={origin} ref={originRef} placeholder='Enter origin'
  onChange={(e) => setOrigin(e.target.value)} type="text" required />
<input id="orderDescript" value={orderDescription} placeholder='Enter freight description' onChange={(e) => setOrderDescription(e.target.value)} type="text" />
<input id="googleDest" value={destination}  ref={destRef} placeholder='Enter destination'
  onChange={(e) => {setDestination(e.target.value)}} type="text" required />
<button type="submit">add order</button>
</form> */}