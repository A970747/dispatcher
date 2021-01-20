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

  const googleRef = useRef();
  const mapRef = useRef();
  console.log(googleRef);


function getDom() {
  let item = document.getElementById('googleID');
  console.log(item, googleRef);
  new window.google.maps.places.Autocomplete(googleRef.current);
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
    <input id="googleID" ref={googleRef} type="text"/>
    <button onClick={() => computeDistance()}>distace</button>
    <button onClick={() => getDom()}>docu</button>
    <button onClick={() => makeMap()}>map</button>
    {/* <PlacesAutocomplete
      value={origin}
      onChange={handleOrigin}
      onSelect={handleOriginSelect}
    >
    {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
      <div>
        <input
          {...getInputProps({
            placeholder: 'Search Places ...',
            className: 'location-search-input',
          })}
        />
        <div className="autocomplete-dropdown-container">
          {loading && <div>Loading...</div>}
          {suggestions.map(suggestion => {
            const className = suggestion.active
              ? 'suggestion-item--active'
              : 'suggestion-item';
            // inline style for demonstration purpose
            const style = suggestion.active
              ? { backgroundColor: '#fafafa', cursor: 'pointer' }
              : { backgroundColor: '#ffffff', cursor: 'pointer' };
            return (
              <div
                {...getSuggestionItemProps(suggestion, {
                  className,
                  style,
                })}
              >
                <span>{suggestion.description}</span>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </PlacesAutocomplete>
  
    <PlacesAutocomplete
    value={destination}
    onChange={handleDestination}
    onSelect={handleDestinationSelect}
  >
  {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
    <div>

      <input
        {...getInputProps({
          placeholder: 'Search Places ...',
          className: 'location-search-input',
        })}
      />
      <div className="autocomplete-dropdown-container">
        {loading && <div>Loading...</div>}
        {suggestions.map(suggestion => {
          const className = suggestion.active
            ? 'suggestion-item--active'
            : 'suggestion-item';
          // inline style for demonstration purpose
          const style = suggestion.active
            ? { backgroundColor: '#fafafa', cursor: 'pointer' }
            : { backgroundColor: '#ffffff', cursor: 'pointer' };
          return (
            <div
              {...getSuggestionItemProps(suggestion, {
                className,
                style,
              })}
            >
              <span>{suggestion.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  )}
  </PlacesAutocomplete> */}
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