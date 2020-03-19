import { SmolCanvas, Vector, random } from "../smolcanvas.js";

const c = new SmolCanvas();

class Particle {
  constructor() {
    this.vel = new Vector();
    this.x = 0;
    this.y = 0;
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.radius = 0;
    this.reset();
  }

  reset() {
    this.vel.x = random(-80, 80);
    this.vel.y = random(-80, 80);
    this.x = c.mouseX;
    this.y = c.mouseY;
    this.r = random(0.7, 1);
    this.g = random(0.7, 1);
    this.b = random(0.7, 1);
    this.radius = random(20);
  }

  update(dt) {
    this.x += this.vel.x * dt;
    this.y += this.vel.y * dt;
    this.radius -= 5 * dt;

    if (this.dead) this.reset();
  }

  /** @prop {boolean} */
  get dead() {
    return (
      this.x < 0 ||
      this.x > c.width() ||
      this.y < 0 ||
      this.y > c.height() ||
      this.radius < 0
    );
  }

  draw() {
    c.fillRGB(this.r, this.g, this.b, 0.6);
    c.circle(this.x - this.radius / 2, this.y - this.radius / 2, this.radius);
  }
}

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
  for (const particle of particles) particle.update(dt);
};

/** @this {SmolCanvas} */
c.draw = function() {
  this.background(0);
  this.fillRGB(1, 1, 1);
  this.strokeRGB(1, 1, 1);
  this.text(10, 10, `FPS: ${Math.round(this.fps)}`);
  this.strokeWeight(0.5);
  for (const particle of particles) particle.draw();
};
