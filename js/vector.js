class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
  }

  subtract(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
  }

  multiply(scalar) {
    this.x *= scalar;
    this.y *= scalar;
  }

  divide(scalar) {
    this.x /= scalar;
    this.y /= scalar;
  }

  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  normalize() {
    const mag = this.magnitude();
    if (mag > 0) {
      this.divide(mag);
    }
  }

  limit(max) {
    let mag = this.magnitude();
    if (mag > max) {
      this.normalize(); // Convert to unit vector
      this.multiply(max); // Scale to max
    }
  }

  static add(v1, v2) {
    return new Vector(v1.x + v2.x, v1.y + v2.y);
  }

  static subtract(v1, v2) {
    return new Vector(v1.x - v2.x, v1.y - v2.y);
  }

  static multiply(vector, scalar) {
    return new Vector(vector.x * scalar, vector.y * scalar);
  }

  static divide(vector, scalar) {
    return new Vector(vector.x / scalar, vector.y / scalar);
  }

  static distance(v1, v2) {
    const dx = v1.x - v2.x;
    const dy = v1.y - v2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
