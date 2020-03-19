import { SmolCanvas } from "../smolcanvas.js";

const c = new SmolCanvas();

let angle = 0;
let dist = 0;
let lineY = 0;

c.setup(
  /** @this {SmolCanvas} */ function() {
    this.setTitle("Hello wordl");
    this.size(500);
    this.font("monospace", 15);
    lineY = this.height() / 2;
  }
);

/** @this {SmolCanvas}*/
c.update = function(dt) {
  angle += 90 * dt;
  angle %= 360;
  dist += 15 * dt;
  dist %= 150;
};

/** @this {SmolCanvas} */
c.mousePressed = function(x, y) {
  lineY -= 40;
  if (lineY < 0) lineY = this.height();
};

/** @this {SmolCanvas} */
c.keyPressed = function(key) {
  console.log(key);
};

/** @this {SmolCanvas} */
c.draw = function() {
  this.background(0);
  this.fillRGB(1, 1, 1);
  this.text(10, 10, `FPS: ${Math.round(this.fps)}`);
  this.strokeRGB(1, 1, 1);
  this.line(0, lineY, this.width(), lineY);
  this.translate(this.width() / 2, this.height() / 2);
  this.fillRGB(0.8, 0.2, 0.2);
  this.rect(-25, -25, 50, 50);
  this.rotate(angle);
  this.translate(dist, dist);
  this.fillRGB(1, 1, 1);
  this.circle(-15, -15, 30);
};
