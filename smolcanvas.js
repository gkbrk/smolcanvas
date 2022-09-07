/**
 * @constructor
 * @param{HTMLCanvasElement=} canvas
 */
function SmolCanvas(canvas) {
  /** @private {HTMLCanvasElement} */
  this.canvas =
    canvas ||
    /** @type {!HTMLCanvasElement} */ (document.createElement("canvas"));
  if (canvas === undefined) document.body.appendChild(this.canvas);
  /** @private {CanvasRenderingContext2D} */
  this.ctx = /** @type {!CanvasRenderingContext2D} */ (this.canvas.getContext(
    "2d",
    { alpha: false }
  ));

  /** @type {number} */
  this.mouseX = 0;
  /** @type {number} */
  this.mouseY = 0;

  /** @type {number} */
  this.width = this.canvas.width;
  /** @type {number} */
  this.height = this.canvas.height;

  // Fill and stroke enable

  /** @private {boolean} */
  this.fillActive = false;

  /** @private {boolean} */
  this.strokeActive = false;

  // Delta time and FPS

  /** @type {number} */
  this.fps = 0;

  /** @private {number} */
  this.last_time = 0;

  this.canvas.addEventListener("pointermove", event => {
    this.mouseX = event.x;
    this.mouseY = event.y;
  });

  this.canvas.addEventListener("touchmove", event => {
    const mappedEvent = touchEventToMouse(
      this.canvas,
      /** @type {!TouchEvent} */ (event)
    );
    this.mouseX = mappedEvent.x;
    this.mouseY = mappedEvent.y;
  });

  this.canvas.addEventListener("pointerdown", _ => {
    if (this.mousePressed) this.mousePressed.call(this);
  });

  this.canvas.tabIndex = 1;
  this.canvas.addEventListener("keyup", e => {
    if (this.keyPressed) this.keyPressed.call(this, e.key);
  });

  this.requestAnimationFrame(this.animationFrame);
}

/**
 * Requests animation frame from the browser
 * @private
 * @param {function(number)} cb Callback
 */
SmolCanvas.prototype.requestAnimationFrame = function(cb) {
  window.requestAnimationFrame(cb.bind(this));
};

/**
 * Sets the document title
 * @param {string} title New title
 */
SmolCanvas.prototype.setTitle = function(title) {
  document.title = title;
};

/**
 * Setup callback
 * @param {function()} cb Callback
 */
SmolCanvas.prototype.setup = function(cb) {
  cb.call(this);
};

// Size

/**
 * Sets the size of the canvas
 * @param {number} width Width
 * @param {number=} height Height
 */
SmolCanvas.prototype.size = function(width, height) {
  this.width = this.canvas.width = width;
  this.height = this.canvas.height = height || width;
};

SmolCanvas.prototype.fillWindow = function() {
  document.body.style.margin = "0";
  this.size(document.body.clientWidth, document.body.clientHeight);
};

/**
 * @private
 * @param {number} timestamp
 */
SmolCanvas.prototype.animationFrame = function(timestamp) {
  let dt = 0;
  if (this.last_time !== 0) {
    dt = timestamp - this.last_time;
    dt /= 1000;
    const fps = 1 / dt;
    const smoothing = 0.9;
    this.fps = this.fps * smoothing + fps * (1.0 - smoothing);
  }
  this.last_time = timestamp;
  if (this.update) this.update.call(this, dt);
  this.transformPush();
  if (this.draw) this.draw.call(this);
  this.transformPop();
  this.requestAnimationFrame(this.animationFrame);
};

/**
 * Fill the background of the canvas
 * @param {number} value
 */
SmolCanvas.prototype.background = function(value) {
  this.backgroundRGB(value, value, value);
};

/**
 * Fill the canvas with an RGB color
 * @param {number} r
 * @param {number} g
 * @param {number} b
 */
SmolCanvas.prototype.backgroundRGB = function(r, g, b) {
  this.fillRGB(r, g, b);
  this.ctx.fillRect(0, 0, this.width, this.height);
};

/**
 * Sets the font used for drawing text
 * @param {string} name Font name
 * @param {number} size Font size in pixels
 */
SmolCanvas.prototype.font = function(name, size) {
  this.ctx.font = `${size}px ${name}`;
  this.ctx.textBaseline = "hanging";
};

/**
 * Draw text with the current font
 * @param {number} x
 * @param {number} y
 * @param {string} text
 */
SmolCanvas.prototype.text = function(x, y, text) {
  this.ctx.fillText(text, x, y);
};

/**
 * Set the fill color in RGB color space
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @param {number} a
 */
SmolCanvas.prototype.fillRGB = function(r, g, b, a = 1) {
  this.ctx.fillStyle = RGBA(r, g, b, a);
  this.fillActive = true;
};

/**
 * Set the fill colour to the given value.
 * @param {number} value
 * @param {number} alpha
 */
SmolCanvas.prototype.fill = function(value, alpha = 1) {
  this.ctx.fillStyle = RGBA(value, value, value, alpha);
  this.fillActive = true;
};

SmolCanvas.prototype.noFill = function() {
  this.fillActive = false;
};

/**
 * Set the stroke color in RGB color space
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @param {number} a
 */
SmolCanvas.prototype.strokeRGB = function(r, g, b, a = 1) {
  this.ctx.strokeStyle = RGBA(r, g, b, a);
  this.strokeActive = true;
};

SmolCanvas.prototype.noStroke = function() {
  this.strokeActive = false;
};

/**
 * Set the stroke weight
 * @param {number} weight
 */
SmolCanvas.prototype.strokeWeight = function(weight) {
  this.ctx.lineWidth = weight;
};

/**
 * Draws a line
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 */
SmolCanvas.prototype.line = function(x1, y1, x2, y2) {
  this.ctx.beginPath();
  this.ctx.lineTo(x1, y1);
  this.ctx.lineTo(x2, y2);
  this.ctx.stroke();
};

/**
 * Fill a rectangle
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
SmolCanvas.prototype.rect = function(x, y, width, height) {
  this.ctx.fillRect(x, y, width, height);
};

/**
 * Draw a circle
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 */
SmolCanvas.prototype.circle = function(x, y, radius) {
  this.ctx.beginPath();
  this.ctx.arc(x, y, radius, 0, Math.PI * 2, true);
  if (this.strokeActive) this.ctx.stroke();
  if (this.fillActive) this.ctx.fill();
};

SmolCanvas.prototype.transformPush = function() {
  this.ctx.save();
};

SmolCanvas.prototype.transformPop = function() {
  this.ctx.restore();
};

/**
 * Translation transform
 * @param {number} x Translate in X
 * @param {number} y Translate in Y
 */
SmolCanvas.prototype.translate = function(x, y) {
  this.ctx.translate(x, y);
};

/**
 * Rotate transform
 * @param {number} angle Angle in degrees
 */
SmolCanvas.prototype.rotate = function(angle) {
  this.ctx.rotate((angle * Math.PI) / 180);
};

/**
 * Scale transform
 * @param {number} x X Scale
 * @param {number=} y Y scale
 */
SmolCanvas.prototype.scale = function(x, y) {
  this.ctx.scale(x, y || x);
};

/**
 * Map a value between two ranges
 * @param {number} value The value
 * @param {number} f1 From range minimum
 * @param {number} t1 From range maximum
 * @param {number} f2 To range minimum
 * @param {number} t2 To range maximum
 * @return {number} The mapped value
 */
function map(value, f1, t1, f2, t2) {
  return f2 + ((t2 - f2) * (value - f1)) / (t1 - f1);
}

/**
 * RGBA color to string
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @param {number} a
 * @return {string} Color string
 */
function RGBA(r, g, b, a = 1) {
  r = map(r, 0, 1, 0, 255);
  g = map(g, 0, 1, 0, 255);
  b = map(b, 0, 1, 0, 255);
  return `rgba(${r},${g},${b},${a})`;
}

/**
 * N-dimension vector
 * @constructor
 * @param {number|!Array<number>} values
 */
function Vector(values) {
  /** @type {!Array<number>} */
  this.numbers = [];

  for (let i = 0; i < values; i++) this.numbers.push(0);
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number=} z
 * @return {Vector}
 */
Vector.create = function(x, y, z) {
  const n = z === undefined ? 2 : 3;
  const vec = new Vector(n);
  vec.setX(x);
  vec.setY(y);
  if (z !== undefined) vec.setZ(z);
  return vec;
};

/**
 * Subtract another vector from this one
 * @param {Vector} other
 * @return {Vector} New vector
 */
Vector.prototype.sub = function(other) {
  let vals = [];
  for (let i = 0; i < this.numbers.length; i++) {
    vals.push(this.numbers[i] - other.numbers[i]);
  }
  return new Vector(vals);
};

/**
 * @return {number}
 */
Vector.prototype.mag = function() {
  let sum = 0;
  for (const value of this.numbers) sum += value * value;
  return Math.sqrt(sum);
};

/**
 * @return {number}
 */
Vector.prototype.x = function() {
  return this.numbers[0];
};

/**
 * @param {number} val
 * @return {number}
 */
Vector.prototype.setX = function(val) {
  return (this.numbers[0] = val);
};

/**
 * @return {number}
 */
Vector.prototype.y = function() {
  return this.numbers[1];
};

/**
 * @param {number} val
 * @return {number}
 */
Vector.prototype.setY = function(val) {
  return (this.numbers[1] = val);
};

/**
 * @return {number}
 */
Vector.prototype.z = function() {
  return this.numbers[2];
};

/**
 * @param {number} val
 * @return {number}
 */
Vector.prototype.setZ = function(val) {
  return (this.numbers[2] = val);
};

/**
 * Return a random number
 * @param {number=} n1
 * @param {number=} n2
 * @return {number}
 */
function random(n1, n2) {
  if (typeof n1 === "undefined") return randomRange(0, 1);
  if (typeof n2 === "undefined") return randomRange(0, n1);
  return randomRange(n1, n2);
}

/**
 * Get a random float in range
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
function randomRange(min = 0, max = 1) {
  return map(Math.random(), 0, 1, min, max);
}

/**
 * Shuffles array in place.
 * @param {Array} a An array containing the items.
 * @return {Array}
 */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(randomRange(0, i + 1));
    let x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

// TOUCH HANDLING

/**
 * Turns a touch event into mouse coordinates
 * @private
 * @param {HTMLCanvasElement} canvas
 * @param {TouchEvent} event
 * @return {{x:number, y:number}}
 */
function touchEventToMouse(canvas, event) {
  const clientRect = canvas.getBoundingClientRect();
  const touch = event.touches[0];
  return {
    x: touch.clientX - clientRect.left,
    y: touch.clientY - clientRect.top
  };
}

export { SmolCanvas, Vector, random, randomRange, map, shuffle, RGBA };
