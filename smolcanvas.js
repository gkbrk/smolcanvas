/** Create a new SmolCanvas object
 * @constructor
 * @param {HTMLCanvasElement=} canvas
 */
function SmolCanvas(canvas) {
  /** @private {HTMLCanvasElement} */
  this.canvas = canvas || document.createElement("canvas");
  if (canvas === undefined) document.body.appendChild(this.canvas);

  /** @private {CanvasRenderingContext2D} */
  this.ctx = this.canvas.getContext("2d", { alpha: false });

  // Mouse position

  /** @prop {number} */
  this.mouseX = 0;
  /** @prop {number} */
  this.mouseY = 0;

  // Fill and stroke enable
  /** @private {boolean} */
  this.fillActive = false;

  /** @private {boolean} */
  this.strokeActive = false;

  // Delta time and FPS

  /** @prop {number} */
  this.fps = 0;
  /** @private {number} */
  this.last_time = 0;

  this.canvas.addEventListener("pointermove", event => {
    this.mouseX = event.x;
    this.mouseY = event.y;
  });

  this.canvas.addEventListener("touchmove", event => {
    const mappedEvent = touchEventToMouse(this.canvas, event);
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

/** @return {number} */
SmolCanvas.prototype.width = function() {
  return this.canvas.width;
};

/** @return {number} */
SmolCanvas.prototype.height = function() {
  return this.canvas.height;
};

/**
 * Sets the size of the canvas
 * @param {number} width Width
 * @param {number=} height Height
 */
SmolCanvas.prototype.size = function(width, height) {
  this.canvas.width = width;
  this.canvas.height = height || width;
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
  if (this.update) this.update(dt);
  this.transformPush();
  if (this.draw) this.draw();
  this.transformPop();
  this.requestAnimationFrame(this.animationFrame);
};

/**
 * Fill the background of the canvas
 * @param {number} c1
 * @param {number=} c2
 * @param {number=} c3
 * @param {number=} c4
 */
SmolCanvas.prototype.background = function(c1, c2, c3, c4) {
  if (c1 !== undefined && c2 === undefined) {
    this.fillRGB(c1, c1, c1);
    this.ctx.fillRect(0, 0, this.width(), this.height());
  }
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

class Vector {
  /**
   * @param {...number} values
   */
  constructor(...values) {
    /** @private @prop {Array<number>} */
    this.values = [];
  }

  /**
   * Subtract another vector from this one
   * @param {Vector} other
   * @return {Vector} New vector
   */
  sub(other) {
    if (this.values.length !== other.values.length) throw new Error();
    let vals = [];
    for (let i = 0; i < this.values.length; i++) {
      vals.push(this.values[i] - other.values[i]);
    }
    return new Vector(...vals);
  }

  /**
   * @return {number}
   */
  mag() {
    let sum = 0;
    for (const value of this.values) sum += value * value;
    return Math.sqrt(sum);
  }

  get x() {
    return this.values[0];
  }

  set x(val) {
    this.values[0] = val;
  }

  get y() {
    return this.values[1];
  }

  set y(val) {
    this.values[1] = val;
  }

  get z() {
    return this.values[2];
  }

  set z(val) {
    this.values[2] = val;
  }
}

/**
 * Return a random number
 * @param {number=} n1
 * @param {number=} n2
 * @return {number}
 */
function random(n1, n2) {
  if (n1 === undefined && n2 === undefined) return randomRange(0, 1);
  if (n1 !== undefined && n2 === undefined) return randomRange(0, n1);
  if (n1 !== undefined && n2 !== undefined) return randomRange(n1, n2);
  throw new Error();
}

/**
 * Get a random float in range
 * @private
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
function randomRange(min, max) {
  return map(Math.random(), 0, 1, min, max);
}

/**
 * Shuffles array in place.
 * @param {Array} a An array containing the items.
 * @return {Array}
 */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

// TOUCH HANDLING

/**
 * Turns a touch event into mouse coordinates
 * @param {HTMLCanvasElement} canvas
 * @param {TouchEvent} event
 * @return {dict}
 */
function touchEventToMouse(canvas, event) {
  const clientRect = canvas.getBoundingClientRect();
  const touch = event.touches[0];
  return {
    x: touch.clientX - clientRect.left,
    y: touch.clientY - clientRect.top
  };
}

export { SmolCanvas, Vector, random, map, shuffle, RGBA };
