p = this 
//p can now be used to universally refer to the canvas.
//I used this as a quickfix to convert from the API used in the Museum of Math to plain ol' javascript.
function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  p.frameRate(60)
  for(let i = 0; i <= 20; i++){
    stars.push(new Star());
  }
}

var frameRate = 60
var OrbitalRadiusPadding = 50


let width = p.width
let height = p.height
let lineTick = 0;
var LineDistance = 4;
let maxLines = 750; //Determine best value here.
let newLines = true;
let turbo = false;

let orbitals = []
let stars = []
let radii = []

let spaceColor = '#100030'
let sunColor = "#EFEF00"
let sunBorder = "#ffff00"
let sunRadius = 25;
let orbitalSize = 10; //orbital radius

let resizedLastTick = false;

function getRadius(x, y) {
  let centerX = p.width / 2
  let centerY = p.height / 2
  let newX = x - centerX
  let newY = y - centerY
  return Math.sqrt(Math.pow(newX, 2) + Math.pow(newY, 2));
}

class Orbit{
  //Location Variables
  constructor(x,y,radius){
    this.x = p.width / 2 + this.radius * Math.cos(this.angle)
    this.y = p.height / 2 + this.radius * Math.sin(this.angle)
    
    this.orbitalSize = orbitalSize
    this.radius = radius
    this.diameter = radius * 2
    this.angle = Math.atan2((y - p.height / 2), (x - p.width / 2));
    this.speed = p.random([-1, 1, 1, 1]) * 2 * Math.PI / this.diameter * .9//Radial Velocity --Adjust calculation?
    if(turbo){
      this.speed *= 2
    }
    this.decay = false
    this.queueDelete = false
    this.newLines = true;
    this.expand = 0.01
  
    p.colorMode('hsv');
    this.color = hsvToRgb(((getRadius(x, y)) / 350),.5 + (Math.random()/2), 1) //returns a list of r g and b based on the radius.
    this.lineColor = [255,255,255] //r g b
    p.colorMode('rgb');
    this.alpha = 255
  
    this.lines = []
  
  }

  drawPath() {
    p.stroke(255, parseInt(this.alpha)/3)
    p.strokeWeight(2);
    p.noFill();
    if (this.expand < Math.PI) { //runs the pretty opening animation
      p.arc(p.width / 2, p.height / 2, this.diameter, this.diameter, this.angle, this.angle + this.expand)
      p.arc(p.width / 2, p.height / 2, this.diameter, this.diameter, this.angle - this.expand, this.angle)
      this.expand += .1
    } else {
      p.ellipse(p.width / 2, p.height / 2, this.radius * 2) //After, simply show the orbiting path.
    }
  }

  drawPlanet() {
    p.fill(this.color[0], this.color[1], this.color[2], this.alpha)
    p.noStroke()
    p.ellipse(this.x, this.y, this.orbitalSize * 2)
  }

  update() {
    this.x = p.width / 2 + this.radius * Math.cos(this.angle)
    this.y = p.height / 2 + this.radius * Math.sin(this.angle)

    this.drawPath();
    this.drawPlanet();

    this.angle += this.speed;
    if (this.decay) {
      this.alpha -= 2;
      if (this.alpha < 0) {
        this.queueDelete = true;
      }
    }
  }
  updateLines(p) {
    p.stroke(this.lineColor[0], this.lineColor[1], this.lineColor[2], this.alpha) // sets the line color
    for (let l of this.lines) {
      l.render() //// TODO: Make each grouping of lines a graphic that doesn't need to be redrawn every frame.
    }
  }
}

class Line{
  constructor(x1,y1,x2,y2){
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
    this.lineSize = 1
  }
  render(){
    p.strokeWeight(this.lineSize)
    p.line(this.x1 + p.width / 2, this.y1 + p.height / 2, this.x2 + p.width / 2, this.y2 + p.height / 2);
  }
}

class Star{
  constructor(x=Math.floor(Math.random()*p.width),y=Math.floor(Math.random()*p.height)){
    this.x = x;
    this.y = y;
    this.color = "#ffffff";
    this.size = Math.floor(Math.random() * 4);
  }
  render(){
    p.noStroke();
    p.fill(255,255,255,Math.floor(Math.random() * 100 + 155));
    p.ellipse(this.x,this.y, this.size,this.size);
  }
}
function updateOrbitals(){
  for (let o of orbitals) { //draws all orbitals last so they are not being overlapped by anything.
    o.update();
  }
  if(orbitals.length > 0){
    if(orbitals.length >= 8 || orbitals[0].lines.length >= 750){//Erases the oldest orbital.
      orbitals[0].decay = true
    }
    if(orbitals[0].queueDelete == true){ 
      //Waiting until the end to remove orbitals fixes orbitals not being drawn for 1 tick.
      radii.splice(radii.indexOf(orbitals[0].radius), 1)
      orbitals.splice(0, 1)
    }
  }
}

function drawStars(){
  for (star of stars){
    star.render();
  }
}

p.sun = function(){
  p.fill(sunColor);
  p.stroke(sunBorder); 
  p.strokeWeight(2);
  p.ellipse(p.width / 2, p.height / 2, sunRadius * 2); // sun  
}

function clearOrbitals(){
  for(let o of orbitals){
    if(o.decay == false){
      o.decay = true;
      o.speed *= 5;
      o.newLines = false;
    }
  }
  if(orbitals.length == 0){
    stars = [];
  }
}
function toggleLines(){
  newLines = newLines == true ? false : true;
}

function speedUp(scale){
  for(let o of orbitals){
    o.speed *= scale
  }
  LineDistance *= 1/scale
}

function slowDown(scale){
  for(let o of orbitals){
    o.speed /= scale
  }
  LineDistance *= scale
}


function draw() { //Layering: space, stars, lines, sun, planets.
  p.background(spaceColor);

  drawStars();

  for (let o of orbitals) { 
    o.updateLines(p) 
  }

  p.sun();

  updateOrbitals();

  if (lineTick >= LineDistance && !resizedLastTick) {
    //if resized, then the program waits a tick to draw the line. This stops it from drawing a line to the pre-resized positions.
    for (let i = 0; i < orbitals.length - 1; i++) {
      let x1 = orbitals[i].x
      let y1 = orbitals[i].y
      let x2 = orbitals[i + 1].x
      let y2 = orbitals[i + 1].y

      if(orbitals[i].lineColor[0] == 255){ //if linecolor hasn't been set.
        orbitals[i].lineColor[0] = (orbitals[i].color[0] + orbitals[i + 1].color[0]) / 2 //combines the color of the two orbitals for the line.
        orbitals[i].lineColor[1] = (orbitals[i].color[1] + orbitals[i + 1].color[1]) / 2 
        orbitals[i].lineColor[2] = (orbitals[i].color[2] + orbitals[i + 1].color[2]) / 2
      }
      if(newLines && orbitals[i].newLines){
        orbitals[i].lines.push(new Line(x1 - p.width / 2, y1 - p.height / 2, x2 - p.width / 2, y2 - p.height / 2))
      }
    }
    lineTick = 0
  } else {
    lineTick++
    if (resizedLastTick){
      resizedLastTick = false
    }
  }
  if(stars.length >= 50 && Math.random() < .02){
    stars.splice(0,1);
  }//1/1000 chance
}

document.onmousedown = function(u) {
  
  let oldradius = Math.round(getRadius(u.clientX, u.clientY) / OrbitalRadiusPadding) * OrbitalRadiusPadding 
  if(!radii.includes(oldradius) && oldradius >= sunRadius + orbitalSize) { //No clicking on the sun!
    orbitals.push(new Orbit(u.clientX, u.clientY, oldradius))
    radii.push(oldradius);
  } else if (oldradius < sunRadius + orbitalSize){
    for(let i = 0; i <= 15; i++){
      stars.push(new Star());
    }
  }
  for(let i = 0; i<=3; i++){
    stars.push(new Star());
  }
  //currently the radius is snapped to every O-R-P px. we want to click where the user clicks, but not if it is within an area.
  //after we do that, then add the ability for it to snap to the distance away from the padding.
  // let radius = Math.round(getRadius(u.clientX, u.clientY))
  // if(radius <= sunRadius + orbitalSize){
  //   return; 
  // }
  // distanceFromClosestOrbital = Infinity //Defaults to true state.
  // distanceSign = 1
  // for(let o of orbitals){
  //   let distance = o.radius - radius;
  //   let sign = 1;
  //   if (distance < 0){
  //     sign = -1;
  //   }
  //   print(`distance: ${o.radius}`)
  //   if(Math.abs(distance) < distanceFromClosestOrbital){
  //     distanceFromClosestOrbital = Math.abs(distance);
  //     distanceSign = sign;
  //   }
  // }
  // if(distanceFromClosestOrbital > OrbitalRadiusPadding){
  //   orbitals.push(new Orbit(u.clientX, u.clientY, radius, p));
  // }
}

document.onkeydown = function(u){
  if(u.key == "Escape"){
    clearOrbitals();
  }
  if(u.key == "Shift"){//double Speed?
    if(turbo == false){
      turbo = true;
      speedUp(3);
    }
  }
  if(u.key == "p"){
    toggleLines();
  }
}
document.onkeyup = function(u){
  if(u.key == "Shift" && turbo){
    turbo = false;
    slowDown(3);
  }
}

function windowResized(){ //built in Processing function
  resizedLastTick = true;
  resizeCanvas(window.innerWidth, window.innerHeight)
}

//HSB to RGB color function taken from https://gist.github.com/mjackson/5311256
//The current color implementation is to pick the planet hue color based on the size of the planet's orbit.
//This provides a wide range of vibrant colors.
//The line color is determined by taking the average of the r g and b values, therefore this converter was neccesary.
function hsvToRgb(h, s, v){
  var r, g, b;
  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);
  switch(i % 6){
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
  }
  return [r * 255, g * 255, b * 255];
}
