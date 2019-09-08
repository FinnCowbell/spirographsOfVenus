p = this 
//p can now be used to universally refer to the canvas.
//I used this as a quickfix to convert from the API used in the Museum of Math to plain ol' javascript.
function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  p.frameRate(60)
}
const LineDistance = 4
const OrbitalRadiusPadding = 50

let width = p.width
let height = p.height
let lineTick = 0;
let maxLineTick = 4;
let maxLines = 750; //Determine best value here.

let orbitals = []
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

function Orbit(x, y, radius, p) {
  //Location Variables
  this.x = p.width / 2 + this.radius * Math.cos(this.angle)
  this.y = p.height / 2 + this.radius * Math.sin(this.angle)
  
  this.orbitalSize = orbitalSize
  this.radius = radius
  this.diameter = radius * 2
  this.angle = Math.atan2((y - p.height / 2), (x - p.width / 2));
  this.speed = p.random([-1, 1, 1, 1]) * 2 * Math.PI / this.diameter //Radial Velocity --Adjust calculation?

  this.decay = false
  this.queueDelete = false
  this.expand = 0.01

  p.colorMode('hsv');
  this.color = hsvToRgb(((getRadius(x, y)) / 350), 1, 1) //returns a list of r g and b based on the radius.
  this.lineColor = [255,255,255] //r g b
  p.colorMode('rgb');
  this.alpha = 255

  this.lines = []
  this.newLines = true;

  this.drawPath = function(){
    p.stroke(255, parseInt(this.alpha)/3)
    p.strokeWeight(2)
    p.noFill()
    if (this.expand < Math.PI) { //runs the pretty opening animation
      p.arc(p.width / 2, p.height / 2, this.diameter, this.diameter, this.angle, this.angle + this.expand)
      p.arc(p.width / 2, p.height / 2, this.diameter, this.diameter, this.angle - this.expand, this.angle)
      this.expand += .1
    } else {
      p.ellipse(p.width / 2, p.height / 2, this.radius * 2) //After, simply show the orbiting path.
    }
  }

  this.drawPlanet = function(){
    p.fill(this.color[0], this.color[1], this.color[2], this.alpha)
    p.noStroke()
    p.ellipse(this.x, this.y, this.orbitalSize * 2)
  }

  this.update = function() {
    this.x = p.width / 2 + this.radius * Math.cos(this.angle)
    this.y = p.height / 2 + this.radius * Math.sin(this.angle)

    this.drawPath();
    this.drawPlanet();

    this.angle += this.speed;
    if (this.decay) {
      this.alpha -= 2
      if (this.alpha < 0) {
        this.queueDelete = true
      }
    }
  }
  this.updateLines = function(p) {
    p.stroke(this.lineColor[0], this.lineColor[1], this.lineColor[2], this.alpha) // sets the line color
    for (let l of this.lines) {
      l.render() //// TODO: Make each grouping of lines a graphic that doesn't need to be redrawn every frame.
    }
  }
}

function Line(x1, y1, x2, y2, p) {
  this.lineSize = 1
  this.render = function() {
    p.strokeWeight(this.lineSize)
    p.line(x1 + p.width / 2, y1 + p.height / 2, x2 + p.width / 2, y2 + p.height / 2);
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
      radii.splice(radii.indexOf(orbitals[0].radius), 1)
      orbitals.splice(0, 1)
    }
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
    o.decay = true;
    o.speed *= 5;
    o.newLines = false;
  }
}
function toggleLines(){
  for(let o of orbitals){
    o.newLines = o.newLines == true ? false : true;
  }
}

document.onmousedown = function(u) {
  let oldradius = Math.round(getRadius(u.clientX, u.clientY) / OrbitalRadiusPadding) * OrbitalRadiusPadding 
  if(!radii.includes(oldradius) && oldradius >= 25) { //No clicking on the sun!
    orbitals.push(new Orbit(u.clientX, u.clientY, oldradius, p))
    radii.push(oldradius);
  }
  //currently the radius is snapped to every O-R-P px. we want to click where the user clicks, but not if it is within an area.
  //after we do that, then add the ability for it to snap to the distance away from the padding.
  // let radius = Math.round(getRadius(u.clientX, u.clientY))
  // if(radius <= sunRadius + orbitalSize){
  //   return; 
  // }
  // distanceFromClosestOrbital = Infinity //Defaults to true state.
  // for(let o in orbitals){
  //   distance = Math.abs(o.radius - radius);
  //   if(distance < distanceFromClosestOrbital){
  //     distanceFromClosestOrbital = distance;
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
  }
  if(u.key == "p"){
    toggleLines();
  }
}



function draw() { //Layering: space, lines, sun, planets.
  p.background(spaceColor);
  for (let o of orbitals) { 
    o.updateLines(p) 
  }
  p.sun();
  // lines are on the furthest back layer.


  updateOrbitals()


  if (lineTick >= maxLineTick && !resizedLastTick) {
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
      if(orbitals[i].newLines == true){
        orbitals[i].lines.push(new Line(x1 - p.width / 2, y1 - p.height / 2, x2 - p.width / 2, y2 - p.height / 2, p))
      }
    }
    lineTick = 0
  } else {
    lineTick++
    if (resizedLastTick){
      resizedLastTick = false
    }
  }
}

function windowResized(){
    resizedLastTick = true;
    resizeCanvas(window.innerWidth, window.innerHeight)
}

//HSB to RGB color function taken from a github user
//This is one possible way to set the color of the planets.
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