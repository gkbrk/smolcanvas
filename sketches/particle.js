import { SmolCanvas, Vector, random, randomRange } from "../smolcanvas.js";

const c = new SmolCanvas();

class Particle {
  constructor() {
    this.vel = new Vector(2);
    this.x = 0;
    this.y = 0;
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.radius = 0;
    this.reset();
  }

  reset() {
    this.vel.setX(randomRange(-80, 80));
    this.vel.setY(randomRange(-80, 80));
    this.x = c.mouseX;
    this.y = c.mouseY;
    this.r = randomRange(0.7, 1);
    this.g = randomRange(0.7, 1);
    this.b = randomRange(0.7, 1);
    this.radius = randomRange(20);
  }

  /** @param {number} dt */
  update(dt) {
    this.x += this.vel.x() * dt;
    this.y += this.vel.y() * dt;
    this.radius -= 5 * dt;

    if (this.dead()) this.reset();
  }

  /** @return {boolean} */
  dead() {
    return (
      this.x < 0 ||
      this.x > c.width ||
      this.y < 0 ||
      this.y > c.height ||
      this.radius < 0
    );
  }

  draw() {
    c.fillRGB(this.r, this.g, this.b, 0.6);
    c.circle(this.x - this.radius / 2, this.y - this.radius / 2, this.radius);
  }
}

/** @type {!Array<Particle>} */
const particles = [];

c.setup(
  /** @this {SmolCanvas} */ function() {
    this.fillWindow();
    this.font("monospace", 20);
    for (let i = 0; i < 150; i++) particles.push(new Particle());
  }
);

/** @this {SmolCanvas}*/
c.update = function(dt) {
  particles.forEach(p => p.update(dt));
};

/** @this {SmolCanvas} */
c.draw = function() {
  this.background(0);
  this.fillRGB(1, 1, 1);
  this.text(10, 10, `FPS: ${Math.round(this.fps)}`);
  for (const particle of particles) particle.draw();
};
