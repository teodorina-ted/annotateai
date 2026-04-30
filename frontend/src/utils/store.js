let _imageData = null;
let _bulkData = null;

export function setPendingImage(data) { _imageData = data; }
export function getPendingImage() { 
  const d = _imageData;
  _imageData = null;
  return d;
}
export function setPendingBulk(data) { _bulkData = data; }
export function getPendingBulk() {
  const d = _bulkData;
  _bulkData = null;
  return d;
}
