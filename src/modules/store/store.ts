export default (function () {
  let store = {};
  const set = (state : object) => store = { ...store, ...state };
  const get = (key : string | number = null) => key ? store[key] : store;
  const reset = () => store = {};

  return {
    set, get, reset,
  };
})();
