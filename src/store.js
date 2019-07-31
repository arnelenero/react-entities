export const store = {};
export default store;

let uid = 0;
export const reserveNextEntityId = () => ++uid;
export const getLastEntityId = () => uid;
