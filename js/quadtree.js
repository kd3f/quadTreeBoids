class QuadTree {
  constructor(boundary, capacity) {
    this.boundary = boundary; // The spatial boundary this quad covers
    this.capacity = capacity; // Max number of boids before subdividing
    this.boids = []; // Boids within this quad
    this.divided = false;
    this.northwest = null;
    this.northeast = null;
    this.southwest = null;
    this.southeast = null;
  }

  subdivide() {
    const x = this.boundary.x;
    const y = this.boundary.y;
    const w = this.boundary.width / 2;
    const h = this.boundary.height / 2;

    let nw = new Boundary(x, y, w, h);
    this.northwest = new QuadTree(nw, this.capacity);

    let ne = new Boundary(x + w, y, w, h);
    this.northeast = new QuadTree(ne, this.capacity);

    let sw = new Boundary(x, y + h, w, h);
    this.southwest = new QuadTree(sw, this.capacity);

    let se = new Boundary(x + w, y + h, w, h);
    this.southeast = new QuadTree(se, this.capacity);

    this.divided = true;
  }

  // Insert a boid into the QuadTree
  insert(point) {
    if (!this.boundary.contains(point)) {
      return false;
    }
  
    if (this.boids.length < this.capacity && !this.divided) {
      this.boids.push(point);
      return true;
    }
  
    if (!this.divided) {
      this.subdivide();
    }
  
    if (this.northwest.insert(point)) return true;
    if (this.northeast.insert(point)) return true;
    if (this.southwest.insert(point)) return true;
    if (this.southeast.insert(point)) return true;
  
    return false;
  }

  // Query the QuadTree for boids within a certain area
  // In dense boid populations optimization, such as limiting the depth of subdivision or merging quads that become sparse, might become necessary.
  query(range, found = []) {
    // Check if the current quad's boundary intersects with the query range
    if (!this.boundary.intersects(range)) {
      return found; // If not, return the current list of found boids
    }

    // Check each boid in the current quad to see if it's within the query range
    for (const boid of this.boids) {
      if (range.contains(boid)) {
        found.push(boid);
      }
    }

    // If the current node is subdivided, recursively query the child nodes
    if (this.divided) {
      this.northwest.query(range, found);
      this.northeast.query(range, found);
      this.southwest.query(range, found);
      this.southeast.query(range, found);
    }

    return found;
  }

  clear() {
      this.boids = []; // Clear all boids from this quad
      this.divided = false; // Mark as not subdivided
      // Reset all child quadrants to null
      this.northwest = null;
      this.northeast = null;
      this.southwest = null;
      this.southeast = null;
    }


}

class Boundary {
  constructor(x, y, width, height) {
    this.x = x; // Center x
    this.y = y; // Center y
    this.width = width; // Width of the boundary
    this.height = height; // Height of the boundary
  }

  contains(point) {
    return (point.x >= this.x - this.width &&
            point.x <= this.x + this.width &&
            point.y >= this.y - this.height &&
            point.y <= this.y + this.height);
  }

  intersects(range) {
      return !(range.x - range.width > this.x + this.width ||
               range.x + range.width < this.x - this.width ||
               range.y - range.height > this.y + this.height ||
               range.y + range.height < this.y - this.height);
  }

}