import React, {useState} from 'react'
import PlacesAutocomplete, {geocodeByAddress,getLatLng,} from 'react-places-autocomplete';

//directionsapi
//maps/embed/v1/directions

function App() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originLatLng, setOriginLatLng] = useState({});
  const [destLatLng, setDestLatLng] = useState({});


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
    console.log('making ll with:', latLngObj.lat, latLngObj.lng)
    let newLL = new window.google.maps.LatLng(latLngObj.lat, latLngObj.lng)
    console.log('newLL', newLL)
    return newLL
  }
  
  function computeDistance() {
    let distance = window.google.maps.geometry.spherical.computeDistanceBetween(originLatLng, destLatLng);
    console.log('this is distance', distance);
  }

  return (
    <>
    <button onClick={() => computeDistance()}>click me</button>
    <PlacesAutocomplete
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
  </PlacesAutocomplete>
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