import { me } from "appbit";
import clock from "clock";
import document from "document";
import * as fs from "fs";
import * as messaging from "messaging";
import { preferences,units } from "user-settings";
import * as util from "../common/utils";
//import * as gpscompass from "../common/gpscompass";
import { today } from "user-activity";
import { HeartRateSensor } from "heart-rate";
import { display } from "display";
import { location } from "geolocation";
import { BodyPresenceSensor } from "body-presence";
import { geolocation } from "geolocation";

const SETTINGS_TYPE = "cbor";
const SETTINGS_FILE = "settings.cbor";

let settings = loadSettings();
applyTheme(settings.background, settings.foreground);

//SENSORS
let mySteps1 = document.getElementById("mySteps1");
let mySteps2 = document.getElementById("mySteps2");
let mySteps3 = document.getElementById("mySteps3");
let mySteps4 = document.getElementById("mySteps4");
let mySteps5 = document.getElementById("mySteps5");
let myCalories1 = document.getElementById("myCalories1");
let myCalories2 = document.getElementById("myCalories2");
let myCalories3 = document.getElementById("myCalories3");
let myCalories4 = document.getElementById("myCalories4");
let myCalories5 = document.getElementById("myCalories5");
let myDistance1 = document.getElementById("myDistance1");
let myDistance2 = document.getElementById("myDistance2");
let myDistance3 = document.getElementById("myDistance3");
let myDistance4 = document.getElementById("myDistance4");
let myDistance5 = document.getElementById("myDistance5");
let metric = document.getElementById("metric");

// TIME
let ampm = document.getElementById("ampm");
let separator = document.getElementById("separator");
let hours1 = document.getElementById("hours1");
let hours2 = document.getElementById("hours2");
let mins1 = document.getElementById("mins1");
let mins2 = document.getElementById("mins2");
let secs1 = document.getElementById("secs1");
let secs2 = document.getElementById("secs2");

// DATE
let day = document.getElementById("day");
let date1 = document.getElementById("date1");
let date2 = document.getElementById("date2");

// MONTH
let month1 = document.getElementById("month1");
let month2 = document.getElementById("month2");

// COMPASS
let coords = [];
let compass = document.getElementById("compass");
let compass1 = document.getElementById("compass1");
let compass2 = document.getElementById("compass2");
let compass3 = document.getElementById("compass3");

// HEART RATE MONITOR
if (HeartRateSensor) {
  const hrm = new HeartRateSensor({ frequency: 1 });
  const body = new BodyPresenceSensor();
  hrm.addEventListener("reading", () => {
      setHeartRate(hrm.heartRate);
  });
    display.addEventListener("change", () => {
    // Automatically stop the sensor when the screen is off to conserve battery
    display.on ? ( hrm.start() ) : ( setHeartRate(50), hrm.stop(), document.getElementById("bpm50").style.display = "none" );
  });
  body.addEventListener("reading", () => {
    body.present ? ( hrm.start() ) : setHeartRate(50), hrm.stop(), document.getElementById("bpm50").style.display = "none";
    //body.present ? console.log("On") : console.log("Off");
  });
  body.start();
  hrm.start();
}

clock.granularity = "seconds";

clock.ontick = evt => {
  let d = evt.date;

  // COMPASS
  if(d.getSeconds() % 10 === 1){
    //console.log('test');
    setCompass(coords);
    //coords.push({latitude:5,longitude:6});
    //console.log(JSON.stringify(coords));
 
  }

  
  // SENSORS 
  getDistance();
  getSteps();
  getCalories();

  // DATE
  setDate(d.getDate());
  
  // MONTH
  setMonth(d.getMonth()+1);

  // DAY NAME
  setDay(d.getDay());

  // HOURS
  let hours = d.getHours();
  let ampm = d.getHours();
  if (preferences.clockDisplay === "12h") {
    ampm = parseInt(ampm / 12) + 1;
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    ampm = 0;
    hours = util.zeroPad(hours);
  }
  setampm(ampm);
  setHours(hours);

  // MINUTES
  let minute = ("0" + d.getMinutes()).slice(-2);
  setMins(minute);

  // SECONDS
  let second = ("0" + d.getSeconds()).slice(-2);
  setSecs(second);
  
  // BLINK SEPARATOR
  setSeparator(d.getSeconds());
}

// Apply theme colors to elements
function applyTheme(background, foreground) {
  let items = document.getElementsByClassName("background");
  items.forEach(function(item) {
    item.style.fill = background;
  });
  let items = document.getElementsByClassName("foreground");
  items.forEach(function(item) {
    item.style.fill = foreground;
  });
  settings.background = background;
  settings.foreground = foreground;
}

function getCalories() {
  if (me.permissions.granted("access_activity")) {
    let calories = today.adjusted.calories || 0;
    calories = util.zero5Pad(calories);
  }else{
    let calories = "00000";
  }
  drawDigit(calories.toString().substring(0,1), myCalories1);
  drawDigit(calories.toString().substring(1,2), myCalories2);
  drawDigit(calories.toString().substring(2,3), myCalories3);
  drawDigit(calories.toString().substring(3,4), myCalories4);
  drawDigit(calories.toString().substring(4,5), myCalories5);
}

function getSteps() {
  if (me.permissions.granted("access_activity")) {
    let steps = today.adjusted.steps || 0;
    steps = util.zero5Pad(steps);
  }else{
    let steps = "00000";
  }
  drawDigit(steps.toString().substring(0,1), mySteps1);
  drawDigit(steps.toString().substring(1,2), mySteps2);
  drawDigit(steps.toString().substring(2,3), mySteps3);
  drawDigit(steps.toString().substring(3,4), mySteps4);
  drawDigit(steps.toString().substring(4,5), mySteps5);
}

function getDistance() {
  if (me.permissions.granted("access_activity")) {
    let distance = ( today.adjusted.distance || 0 )  ;
    distance = util.zero5Pad(distance);
  }else{
    let distance = "00000";
  }
  let u = 0;
  if(units.distance === "us") {
    val *= 1.094;
    u = 1;
  }
  setMetric(u);
  drawDigit(distance.toString().substring(0,1), myDistance1);
  drawDigit(distance.toString().substring(1,2), myDistance2);
  drawDigit(distance.toString().substring(2,3), myDistance3);
  drawDigit(distance.toString().substring(3,4), myDistance4);
  drawDigit(distance.toString().substring(4,5), myDistance5);
}

// Blink time separator
function setSeparator(val) {
  separator.style.display = (val % 2 === 0 ? "inline" : "none");
}

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

async function setCompass(coords) {

  let position1 = new Promise((resolve, reject) => {
    setTimeout(() => geolocation.getCurrentPosition(resolve, reject), 1000)
  });
  let position2 = new Promise((resolve, reject) => {
    setTimeout(() => geolocation.getCurrentPosition(resolve, reject), 6000)
  });

  let result1 = await position1; // wait until the promise resolves (*)
  //let result2 = await position2; // wait until the promise resolves (*)
  //console.log(result1.coords.longitude); // "done!"
  //let brng = bearing(result1.coords.latitude,result1.coords.longitude,result2.coords.latitude,result2.coords.longitude); // "done!"
  
  let latitude = result1.coords.latitude;
  let longitude = result1.coords.longitude;
  coords.push({latitude:latitude,longitude:longitude});

  //compass.groupTransform.rotate.angle = brng;
    //brng = util.zero5Pad(brng);
  //drawDigit(brng.toString().substring(2,3), compass1);
  //drawDigit(brng.toString().substring(3,4), compass2);
  //drawDigit(brng.toString().substring(4,5), compass3);

  //resolve coords;
}


function setHours(val) {
  if (val > 9) {
    drawDigit(Math.floor(val / 10), hours1);
  } else {
    if (preferences.clockDisplay === "12h"){
      drawDigit("ampm_h", hours1);
    }else{
      drawDigit("0", hours1);
    }
  }
  drawDigit(Math.floor(val % 10), hours2);
}

function setMins(val) {
  drawDigit(Math.floor(val / 10), mins1);
  drawDigit(Math.floor(val % 10), mins2);
}

function setSecs(val) {
  drawDigit(Math.floor(val / 10), secs1);
  drawDigit(Math.floor(val % 10), secs2);
}

function setDate(val) {
  drawDigit(Math.floor(val / 10), date1);
  drawDigit(Math.floor(val % 10), date2);
}

function setMonth(val) {
  drawDigit(Math.floor(val / 10), month1);
  drawDigit(Math.floor(val % 10), month2);
}

function setHeartRate(val){
  let bpmid = 140;
  val < 50 ? ( document.getElementById("bpmparent").style.display = "none" , val = 50 ):
  document.getElementById("bpmparent").style.display = "inline";
  while(bpmid >= 50 && val >= 50){
    //console.log("calculating HR" + val);
    bpmid > val ? ( document.getElementById("bpm" + bpmid).style.display = "none", bpmid-- ) : (document.getElementById("bpm" + bpmid).style.display = "inline" , bpmid-- );
  }
}

function setDay(val) {
  day.image = getDayImg(val);
}

function setampm(val) {
  ampm.image = getampmImg(val);
}

function setMetric(val) {
  metric.image = getMetricImg(val);
}

function drawDigit(val, place) {
    place.image = `${val}.png`;
}

function getDayImg(index) {
  let days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return `day_${days[index]}.png`;
}

function getampmImg(index) {
  let ampm = ["ampm_h", "ampm_a", "ampm_p"];
  return `${ampm[index]}.png`;
}

function getMetricImg(index) {
  let metric = ["distance_meters", "distance_yards"];
  return `${metric[index]}.png`;
}

// Listen for the onmessage event
messaging.peerSocket.onmessage = evt => {
  applyTheme(evt.data.background, evt.data.foreground);
}

// Register for the unload event
me.onunload = saveSettings;

function loadSettings() {
  try {
    return fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE);
  } catch (ex) {
    // Defaults
    return {
      background: "#000000",
      foreground: "#FFFFFF"
    }
  }
}

function saveSettings() {
  fs.writeFileSync(SETTINGS_FILE, settings, SETTINGS_TYPE);
}