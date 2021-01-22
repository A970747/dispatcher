const initialState = [];

const routeReducer = (state = initialState, action) => {
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

export default routeReducer;