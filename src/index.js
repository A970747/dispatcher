import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';
import orderReducer from  './store/reducers/orderReducer';
import routeReducer from  './store/reducers/routeReducer';
import { addOrder } from './store/actions/orderAction';
import { addRoute } from './store/actions/routeAction';

const transitReducer = combineReducers({
  orders: orderReducer,
  routes: routeReducer,
});

const store = createStore(transitReducer);

ReactDOM.render(
  <Provider store={store} >
    <App />
  </Provider>,
  document.getElementById('root')
);

let order = {
  origin: 'Toronto, ON',
  destination: 'Montreal, QC',
}