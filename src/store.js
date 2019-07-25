export const store = {};
export default store;

let nextId = 0;
export const getNextId = () => nextId++;
