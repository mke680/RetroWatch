# RetroWatch

Retro Clock Face for the FitBit Ionic. Inspired by vintage Casio Digital Watches.

Features:
- 7 Segment Display https://github.com/Fitbit/sdk-lcd-clock
- Digital Clock, Digital Date and Day Display. 
  -  Supports 24H and 12H. No support for American Date. *Always dd-MM ddd*
  -  AM PM Display for 12 Hour Time.
- Heart Rate Graph Supports 50 - 140 BPM
- Steps *Easiest to achieve a rough 5 digit count per day, if you do more than 99,999 steps... sit down*
- Distance (supports yards and meters) 
- Calories

WIP:
- Compass Feature *No Magnetometer. Uses point to point GPS coordinates to work out general bearings* (WIP)
  - Works Intermittently on watch. Possibly something to do with how often the GPS actually refreshes.
  - Storing Coordinates rather than comparing them may improve this. Taking average bearing of last known coordinates

![Alt text](/RetroClock-screenshot.png?raw=true "Render")

![Alt text](/RetroClock_RL_WatchFace.png?raw=true "Actual Watch Face")
