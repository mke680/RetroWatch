/* 
  lite-activity.js
  A lite way of returning activity data in the correct format based on user preferences.
  Callback should be used to update your UI.
*/
import clock from "clock";
import { today, goals } from "user-activity";
import { units } from "user-settings";

let activityCallback;

export function initialize(granularity, callback) {
  clock.granularity = granularity;
  clock.addEventListener("tick", tickHandler);
  activityCallback = callback;
}

let activityData = {
  activeMinutes: getActiveMinutes(),
  distance: getDistance(),
  steps: getSteps()
}

function tickHandler(evt) {
  activityCallback(activityData);
}

function getActiveMinutes() {
  let val = (today.adjusted.activeMinutes || 0);
}

function getDistance() {
  let val = (today.adjusted.distance || 0) / 1000;
  let u = "km";
  if(units.distance === "us") {
    val *= 0.621371;
    u = "mi";
  }
  return {
    raw: val,
    pretty: `${val.toFixed(2)}${u}`
  }
}

function getSteps() {
  let val = (today.adjusted.steps || 0);
}