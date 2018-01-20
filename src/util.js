/*
 * Object.assign stand in stolen from Jason Miller @developit
 * from https://github.com/developit/unistore/blob/48047f7f5ba4e227cb9158a2d03a1d426968287b/src/util.js
 */
export function assign(obj, props) {
  for (let i in props) obj[i] = props[i];
  return obj;
}
