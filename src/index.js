import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {Provider} from 'react-redux';
import {createStore, comebineReducers} from 'redux';
import orderReducer from  './store/reducers/transitReducer'
import routeReducer from  './store/reducers/transitReducer'

const transitReducer = combinedReducers({
  orders: orderReducer,
  routes: routeReducer,
})

const store = createStore(transitReducer);

ReactDOM.render(
  <Provider store={store} >
    <App />
  </Provider>,
  document.getElementById('root')
);
