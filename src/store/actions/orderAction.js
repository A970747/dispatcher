import _ from 'lodash';
let idArray = [0];
let colorArr = ['#800000', '#9A6324', '#e6194B', '#ffe119', '#f58231', '#000075', '#aaffc3']

const generateId = () => idArray[idArray.length - 1]++;
const generateColor = (id) => colorArr[id % 7];

export const addOrder = (order) => {
  let deepOrder = _.cloneDeep(order)
  let id = generateId();
  let color = generateColor(id);
  
  return {
    type: 'NEW_ORDER',
    data: {...deepOrder, id, color}
  }
}

export const deleteOrder = (order) => {
  let deepOrder = _.cloneDeep(order)
  
  return {
    type: 'DELETE_ORDER',
    data: {...deepOrder}
  }
}