import { SmolCanvas, random, map, shuffle } from "../smolcanvas.js";

const c = new SmolCanvas();

const values = [];

c.setup(
  /** @this {SmolCanvas} */ function() {
    this.fillWindow();
    this.font("monospace", 20);
    for (let i = 0; i < 700; i++) values.push(i);
    shuffle(values);
  }
);

c.mousePressed = function() {
  shuffle(values);
};

/** @this {SmolCanvas}*/
c.update = function(dt) {
  for (let i = 0; i < values.length / 4; i++) {
    const index1 = Math.floor(random(values.length));
    const index2 = Math.floor(random(index1));
    if (values[index1] > values[index2]) {
      const temp = values[index2];
      values[index2] = values[index1];
      values[index1] = temp;
    }
  }
};

/** @this {SmolCanvas} */
c.draw = function() {
  this.background(0);
  this.fillRGB(1, 1, 1);
  this.strokeRGB(1, 1, 1);
  const each = this.width() / values.length;
  for (let i = 0; i < values.length; i++) {
    this.rect(
      each * i,
      0,
      each + 1,
      map(values[i], 0, values.length, 0, this.height())
    );
  }
  this.fill(0, 0.5);
  this.rect(10, 10, 100, 20);
  this.fillRGB(1, 1, 1);
  this.text(10, 10, `FPS: ${Math.round(this.fps)}`);
};
