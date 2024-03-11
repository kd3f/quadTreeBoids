class Point {
  constructor(x, y, userData = null) {
    this.x = x;
    this.y = y;
    this.userData = userData; // Can store a reference to the boid object
  }
}