import _ from 'lodash';

export const addRoute = (order) => {
  let deepOrder = _.cloneDeep(order)
  
  return {
    type: 'NEW_ROUTE',
    data: {...deepOrder}
  }
}