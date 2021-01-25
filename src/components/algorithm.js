import React, {useEffect, useState} from 'react';
import {addRoute} from '../store/actions/routeAction'
import {deleteAllOrders} from '../store/actions/orderAction'
import {useSelector, useDispatch} from 'react-redux';

function GenRoutes({orderMap, removeOrders}) {
  const [indexes, setIndexes] = useState([]);
  const [result, setResult] = useState([]);
  const [route, setRoute] = useState('');
  const [stopsArray, setStopsArray] = useState([]);
  const [polylineArray, setPolylineArray] = useState([]);
  const orders = useSelector(state => state.orders);
  const routes = useSelector(state => state.routes);
  const dispatch = useDispatch();

  useEffect(() => {if(orders.length > 0) calcStraightLineDist()}, [orders]);

  useEffect(() => {
    let tempArray = [];
    orders.forEach((each, index) => tempArray.push(index))
    setIndexes(tempArray);
  }, [orders])

  useEffect(() => {
    mapRoutes(routes);
  }, [routes])

  async function optimize() {
    let tempArray = [...indexes];
    let result = getPermutations(tempArray);
    let shortest = getShortest(result);
    let newRoute = await drawRoute(result[shortest.index]);
    let stops = getStops(result[shortest.index])
    setRoute(newRoute);
    setStopsArray(stops);
    setResult(result);
  }

  function createRoute() {
    let routeObj = {};
    routeObj.path = stopsArray;
    routeObj.route = route;
    routeObj.orders = orders;

    dispatch(addRoute(routeObj));
    dispatch(deleteAllOrders())
    removeOrders();
  }

  function getPermutations(array) {
    let ret = [];
  
    for (let i = 0; i < array.length; i = i + 1) {
      let rest = getPermutations(array.slice(0, i).concat(array.slice(i + 1)));
  
      if(!rest.length) {
        ret.push([array[i]])
      } else {
        for(let j = 0; j < rest.length; j = j + 1) {
          ret.push([array[i]].concat(rest[j]))
        }
      }
    }
    return ret
  };
  
  function getShortest(result) {
    const length = indexes.length;
    const distArray = [];

    const distMap = new Map();
    orders.forEach( (each, index) => {
      distMap.set(index, each.strtLnDist);
    })
    
    for(let i = 0; i < result.length; i++) {
      const totalDist = result[i].reduce((accum, curr, index, arr) => {
        let total = 0;
        if(distMap.has(curr)) total += distMap.get(curr);
        if(index + 1 < length) {
          const next = '' + curr + arr[index + 1];
          if(distMap.has(next)) {
            total += distMap.get(next)
          } else {
            const dist = calcStraightLineDist(orders[curr].destination.geoInfo, orders[arr[index + 1]].origin.geoInfo)
            distMap.set(next, dist);
            total += dist;
          }
        }
        return accum + total;
      }, 0)
      distArray.push(totalDist);
    };

    let singleResult = distArray.reduce((accum, curr, index) => {
      if(index == 0) return {dist: curr, index};
      if(accum.dist > curr) return {dist: curr, index};
      return accum;
    }, {});
    
    return singleResult
  }

  function drawRoute(shortestRoute) {
    const latLngSet = [];
    for(let i = 0; i < shortestRoute.length; i++){
      latLngSet.push(new window.google.maps.LatLng(orders[shortestRoute[i]].origin.geoInfo));
      latLngSet.push(new window.google.maps.LatLng(orders[shortestRoute[i]].destination.geoInfo))
    }
    const wayPoints = latLngSet
      .filter((item, i) => (i !== 0 && i !== (latLngSet.length -1)))
      .map( item => { return {location: item, stopover: false}})

    const directionsService = new window.google.maps.DirectionsService();

    let req = {
      origin: latLngSet[0],
      destination: latLngSet[latLngSet.length - 1],
      waypoints: wayPoints,
      optimizeWaypoints: false,
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

  function getStops(route) {
    const stopsArray = [];
    for(let i = 0; i < route.length; i++){
      stopsArray.push(orders[route[i]].origin.full_address);
      stopsArray.push(orders[route[i]].destination.full_address);
    }

    const filteredStops = stopsArray.filter((stop, index) => {
      if(index > 0) {
        if(stop !== stopsArray[index - 1]) return stop;
      } else { 
        return stop 
      };
    })

    return filteredStops;
  }

  function mapRoutes(routes) {
    removeRoutePolylines();
    let polycopy = []
    routes.forEach(route => {
      const decodedPath = new window.google.maps.geometry.encoding.decodePath(route.route);
      let polyline = new window.google.maps.Polyline({
        path: decodedPath,
        strokeColor: route.color,
        strokeOpacity: 1.0,
        strokeWeight: 3,
      });
      polyline.setMap(orderMap);
      polycopy.push(polyline);
    })
    setPolylineArray(polycopy);
  }

  function removeRoutePolylines() {
    polylineArray.forEach(each => {
      each.setMap(null);
    });
  }

  function toggleRoutePolylines() {
    polylineArray.forEach(polyline => {
      (polyline.visible == false) ? polyline.setVisible(true) : polyline.setVisible(false)
    });
  }

  function calcStraightLineDist(start, end) {
    const origin = new window.google.maps.LatLng(start);
    const dest = new window.google.maps.LatLng(end);

    let distance = window.google.maps.geometry.spherical.computeDistanceBetween(origin, dest);
    let kms  = distance/1000;
    
    return kms
  }

  return (
    <>
      <button onClick={() => optimize()}>1. run the algorithm</button>
      <button onClick={() => createRoute()}>2. create route</button>
      <button onClick={() => toggleRoutePolylines()}>hide routes</button>
      <button onClick={() => removeRoutePolylines()}>remove routes</button>
    </>
  );
}

export default GenRoutes;