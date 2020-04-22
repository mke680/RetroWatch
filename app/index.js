import { me } from "appbit";
import clock from "clock";
import document from "document";
import * as fs from "fs";
import * as messaging from "messaging";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { today, goals } from "user-activity";
import { units } from "user-settings";

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
let myMinutes1 = document.getElementById("myMinutes1");
let myMinutes2 = document.getElementById("myMinutes2");
let myMinutes3 = document.getElementById("myMinutes3");
let myMinutes4 = document.getElementById("myMinutes4");
let myMinutes5 = document.getElementById("myMinutes5");
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

clock.granularity = "seconds";

clock.ontick = evt => {
  let d = evt.date;

  // SENSORS 
  //getActiveMinutes();
  getDistance();
  getSteps();
  
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

function getSteps() {
  if (me.permissions.granted("access_activity")) {
    let steps = today.adjusted.steps || 0;
    steps = util.zero5Pad(steps);
    //console.log(`${steps} Steps`);
  }else{
    let steps = "00000";
    //console.log(`${steps} Steps`);
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