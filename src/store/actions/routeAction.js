import _ from 'lodash';
let idArray = [0];
let colorArr = ['#800000', '#9A6324', '#e6194B', '#ffe119', '#f58231', '#000075', '#aaffc3']

const generateId = () => idArray[idArray.length - 1]++;
const generateColor = (id) => colorArr[id % 7];

export const addRoute = (route) => {
  let deepRoute = _.cloneDeep(route)
  let id = generateId();
  let color = generateColor(id);
  id = `route_${id}`
  
  return {
    type: 'NEW_ROUTE',
    data: {...deepRoute, id, color}
  }
}