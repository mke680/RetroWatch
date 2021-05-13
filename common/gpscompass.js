import { geolocation } from "geolocation";
import document from "document";

// COMPASS
let compass = document.getElementById("compass");

// Converts from degrees to radians.
function toRadians(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
function toDegrees(radians) {
  return radians * 180 / Math.PI;
}


function bearing(startLat, startLng, destLat, destLng){
  startLat = toRadians(startLat);
  startLng = toRadians(startLng);
  destLat = toRadians(destLat);
  destLng = toRadians(destLng);
  let y = Math.sin(destLng - startLng) * Math.cos(destLat);
  let x = Math.cos(startLat) * Math.sin(destLat) - Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  let brng = Math.atan2(y, x);
  brng = toDegrees(brng);
  return (brng + 360) % 360;
}

export async function setCompass(brng) {

  let position1 = new Promise((resolve, reject) => {
    setTimeout(() => geolocation.getCurrentPosition(resolve, reject), 1000)
  });
  let position2 = new Promise((resolve, reject) => {
    setTimeout(() => geolocation.getCurrentPosition(resolve, reject), 6000)
  });

  let result1 = await position1; // wait until the promise resolves (*)
  let result2 = await position2; // wait until the promise resolves (*)
  console.log(result1.coords.longitude); // "done!"
  compass.groupTransform.rotate.angle =   bearing(result1.coords.latitude,result1.coords.longitude,result2.coords.latitude,result2.coords.longitude); // "done!"
}
