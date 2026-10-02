/** DOM and shared helpers */

export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function qsAll(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

export function getParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}
