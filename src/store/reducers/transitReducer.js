const state = {
  orders: [],
  routes: [],
}

const orderReducer = (state = {}, action) => {
  switch(action.type) {
    case 'NEW_ORDER':
      return state.concat(action.data);
    case 'DELETE_ORDER':
      break;
    case 'UPDATE_ORDER':
      break;
    default:
      return state;
  };
};

const routerReducer = (state = {}, action) => {
  switch(action.type) {
    case 'NEW_ROUTE':
      return state.concat(action.data);
    case 'DELETE_ROUTE':
      break;
    case 'UPDATE_ROUTE':
      break;
    default:
      return state;
  };
};

export default orderReducer;
