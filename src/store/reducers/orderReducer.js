const initialState = [];

const orderReducer = (state = initialState, action) => {
  switch(action.type) {
    case 'NEW_ORDER':
      return state.concat(action.data);
    case 'DELETE_ORDER':
      break;
    case 'DELETE_ALL_ORDERS':
      return state = [];
    case 'UPDATE_ORDER':
      break;
    default:
      return state;
  };
};

export default orderReducer;