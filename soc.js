console.log("Hello World!")

c = document.getElementById("stage");
ctx = c.getContext('2d');

var frameRate = 60;
var OrbitalRadiusPadding = 50;
var MaxStars = 500;
var MaxOrbitals = 7;
var orbitalSize = 5;
let MaxLines = 750; //Determine best value here.

let lineTick = 0;
var LineDistance = 4;
let newLines = true;
let turbo = false;

let orbitals = []
let stars = []
let radii = []

function getRadius(x, y) {
  let centerX = p.width / 2
  let centerY = p.height / 2
  let newX = x - centerX
  let newY = y - centerY
  return Math.sqrt(Math.pow(newX, 2) + Math.pow(newY, 2));
}

// let sunColor = "#EFEF00"
// let sunBorder = "#ffff00"
let sunRadius = 5;
// ctx.beginPath();
// ctx.fillStyle = sunColor;
// ctx.strokeStyle = sunBorder;
// ctx.lineWidth = 2;
// ctx.strokeWeight = 2;
// ctx.strokeRect(75, 140, 150, 110);
// ctx.beginPath();
// ctx.ellipse(100, 100, 50, 50, Math.PI / 4, 0, 2 * Math.PI);
// ctx.stroke();

class spirographCanvas{
  constructor(c,ctx){
    this.c = c;
    this.ctx = ctx;
    this.width = c.width;
    this.height = c.height;
    this.turbo = false;
    this.queueResize = false;
  }
  resize(){
    this.c.width = window.innerWidth;
    this.c.height = window.innerHeight;
    this.width = this.c.width;
    this.height = this.c.height;
  }
  strokeWeight(n){
    this.ctx.lineWidth = n;
  }
  alpha(n = 1){
    if(n < 0){
      n = 0 ;
    }
    this.ctx.globalAlpha = n;
  }
  stroke(r,g,b){
    /* As of now, just works with r g b values. */
    let strokeString;
    if(g == undefined){
      strokeString = `rgb(${r}, ${r}, ${r})`
    }
    else if(b == undefined){
      strokeString = `rgb(${r}, ${r}, ${r})`;
    } else{
      strokeString = `rgb(${r}, ${g}, ${b})`;
    }
    this.ctx.strokeStyle = strokeString;
  }
  fill(r,g,b){
    let fillString;
    if(g == undefined){
      fillString = `rgb(${r}, ${r}, ${r})`
    }
    else if(b == undefined){
      fillString = `rgba(${r}, ${r}, ${r})`;
    }
    else{
      fillString = `rgba(${r}, ${g}, ${b})`;
    }
    this.ctx.fillStyle = fillString;
  }
  noStroke(){
    this.ctx.strokeStyle= 'rgb(0,0,0,0)';
  }
  noFill(){
    this.ctx.fillStyle = `rgba(255, 255, 255,0)`;
  }
  background(r,g,b){
    this.ctx.clearRect(0,0,this.width,this.height);
    this.fill(r,g,b)
    this.ctx.fillRect(0,0,this.width,this.height);
  }
  line(x1,y1,x2,y2){
    this.ctx.beginPath();
    this.ctx.moveTo(x1,y1);
    this.ctx.lineTo(x2,y2);
    this.ctx.stroke()
  }
  ellipse(x,y,r1,r2){
    this.ctx.beginPath()
    if(r2==undefined){
      this.ctx.ellipse(x,y,r1,r1,0,0,2*Math.PI,0);
    } else{
      this.ctx.ellipse(x,y,r1,r2,0,0,2*Math.PI,0);
    }
    this.ctx.fill();
    this.ctx.stroke();
  }
  arc(x,y,r1,r2,a1,a2){
    r2 = r2 ? r2 : r1;
    this.ctx.beginPath()
    this.ctx.arc(x,y,r1,a1,a2);
    this.ctx.stroke()
  }
}

class Sun{
  constructor(socanvas){
    this.color = [239,239,0];
    this.border = [255,255,0];
    this.radius = 25; 
    this.p = socanvas
  }
  draw(){
    p.stroke(this.border[0],this.border[1],this.border[2]);
    p.fill(this.color[0],this.color[1],this.color[2]);
    p.ellipse(p.width/2,p.height/2,this.radius,this.radius)
  }
}

class Orbit{
  //Location Variables
  constructor(x,y,radius,orbitalSize = 7){
    this.x = p.width / 2 + this.radius * Math.cos(this.angle)
    this.y = p.height / 2 + this.radius * Math.sin(this.angle)
    this.orbitalSize = orbitalSize
    this.radius = radius
    this.angle = Math.atan2((y - p.height / 2), (x - p.width / 2));
    this.speed = 2 * Math.PI / this.radius * .45//Radial Velocity --Adjust calculation?
    this.turbo = false;
    this.decay = false;
    this.fadeSpeed = .01;
    this.queueDelete = false
    this.newLines = true;
    this.expand = 0.1;
    this.color = [255,255,255];
    this.lineColor = [255,255,255];
    this.alpha = 1;
    this.color = hsvToRgb(((getRadius(x, y)) / 350),.5 + (Math.random()/2), 1) //returns a list of r g and b based on the radius.
    this.lineColor = [255,255,255] //r g b
    this.lines = []
  
  }

  drawPath() {
    p.stroke(255);
    p.strokeWeight(1);
    p.noFill();
    if (this.expand < Math.PI) { //runs the pretty opening animation
      p.arc(p.width / 2, p.height / 2, this.radius, this.radius, this.angle - this.expand, this.angle + this.expand)
      this.expand += .1
    } else {
      p.ellipse(p.width / 2, p.height / 2, this.radius) //After, simply show the orbiting path.
    }
  }

  drawPlanet() {
    p.noStroke()
    p.fill(this.color[0], this.color[1], this.color[2])
    p.ellipse(this.x, this.y, this.orbitalSize * 2)
  }

  update() {
    this.x = p.width / 2 + this.radius * Math.cos(this.angle)
    this.y = p.height / 2 + this.radius * Math.sin(this.angle)
    p.alpha(this.alpha);
    this.drawPath();
    this.drawPlanet();

    if(this.turbo){
      this.angle += this.speed * 2;
    } else{
      this.angle += this.speed;
    }
    if (this.decay) {
      this.alpha -= this.fadeSpeed;
      if (this.alpha < 0) {
        this.queueDelete = true;
      }
    }
    p.alpha();
  }
  updateLines(p) {
    p.stroke(this.lineColor[0], this.lineColor[1], this.lineColor[2]) // sets the line color
    for (let l of this.lines) {
      p.alpha(this.alpha)
      l.render() //// TODO: Make each grouping of lines a graphic that doesn't need to be redrawn every frame.
      p.alpha(1);
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
    this.color = [255,255,255];
    this.size = Math.floor(Math.random() * 4);
  }
  render(){
    p.noStroke();
    p.alpha(Math.random() / 4 + .75);
    p.fill(255,255,255);
    p.ellipse(this.x,this.y, this.size/2, this.size/2);
    p.alpha(1);
  }
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
}

function updateOrbitals(){
  for (let o of orbitals) { //draws all orbitals last so they are not being overlapped by anything.
    o.update();
  }
  if(orbitals.length > 0){
    if(orbitals.length >= MaxOrbitals || orbitals[0].lines.length >= MaxLines){//Erases the oldest orbital.
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


document.onkeydown = function(u){
  if(u.key == "Escape"){
    clearOrbitals();
  }
  if(u.key == "Shift"){//double Speed?
    for(o of orbitals){
      o.turbo = true;
    }
  }
  if(u.key == "p"){
    toggleLines();
  }
}
document.onkeyup = function(u){
  if(u.key == "Shift"){
    for(o of orbitals){
      o.turbo = false;
    }
  }
}

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

p = new spirographCanvas(c,ctx);
p.ctx.translate(.5,.5);
window.addEventListener('resize',() => p.queueResize = true,false);
s = new Sun(p);
p.resize();
x = new Orbit(p.width/2,p.height/2, 100);
console.log(x)
setInterval(() => {
  r
  if (p.queueResize){
    p.queueResize = false
    p.resize();
  }
  p.background(16,0,48);
  drawStars();
  for (let o of orbitals) { 
    o.updateLines(p) 
  }
  s.draw();
  updateOrbitals();

  if (lineTick >= LineDistance && !p.queueResize) {
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
  }
  if(stars.length >= 50 && Math.random() < (-100000/stars.length)/MaxStars + 1){
    stars.splice(0,1);
  }//1/1000 chance
}, 16);