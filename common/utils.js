// Add zero in front of numbers < 10
export function zeroPad(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

// Add zero in 00000
export function zero5Pad(i) {
  if (i < 10) {
    i = "0000" + i;
  }else if(i < 100){
    i = "000" + i;
  }else if(i < 1000){
    i = "00" + i;
  }else if(i < 10000){
    i = "0" + i;
  }else if(i > 99999){
    i = 99999;
  }
  return i;
}