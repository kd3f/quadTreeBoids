class Boid {
    constructor(x, y) {
      this.position = new Vector(x, y);
      this.velocity = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
      this.acceleration = new Vector(0, 0);
      this.maxSpeed = 2; // Max speed of the boid
      this.maxForce = 0.03; // Max steering force applied to the boid
      this.perceptionRadius = 50; // Radius to look for fellow boids
    }

    // Method to update the boid's position based on its velocity
    update() {
      this.position.add(this.velocity);
      this.velocity.add(this.acceleration);
      
      if (this.velocity.magnitude() > this.maxSpeed) {
        this.velocity.normalize();
        this.velocity.multiply(this.maxSpeed);
      }
      
      this.acceleration.multiply(0); // Reset acceleration
    }

    applyForce(force) {
      this.acceleration.add(force);
    }

    // Steer towards a target vector
    steerTowards(target) {        
      let desired = Vector.subtract(target, this.position); // Calculate desired vector
      desired.normalize(); // Normalize to get direction
      desired.multiply(this.maxSpeed); // Scale to maximum speed
    
      let steer = Vector.subtract(desired, this.velocity); // Steering = Desired minus Velocity
      steer.limit(this.maxForce); // Limit the magnitude of the steering force
    
      return steer;
    }

    handleEdges(width, height) {
      if (this.position.x > width) {
        this.position.x = 0;
      } else if (this.position.x < 0) {
        this.position.x = width;
      }
    
      if (this.position.y > height) {
        this.position.y = 0;
      } else if (this.position.y < 0) {
        this.position.y = height;
      }
    }

    getNearbyBoids(quadTree) {
      let range = new Boundary(this.position.x, this.position.y, this.perceptionRadius, this.perceptionRadius);
      let nearbyBoids = quadTree.query(range);
      return nearbyBoids.filter(boid => boid !== this); // Exclude self from the results
    }

    flock(quadTree) {
      let nearbyBoids = this.getNearbyBoids(quadTree);
    
      let alignmentSteer = this.align(nearbyBoids);
      let cohesionSteer = this.cohesion(nearbyBoids);
      let separationSteer = this.separation(nearbyBoids);
    
      // You can adjust these weights based on the desired flocking behavior
      let alignmentWeight = 1;
      let cohesionWeight = 1;
      let separationWeight = 1.5;
    
      alignmentSteer.multiply(alignmentWeight);
      cohesionSteer.multiply(cohesionWeight);
      separationSteer.multiply(separationWeight);
    
      this.applyForce(alignmentSteer);
      this.applyForce(cohesionSteer);
      this.applyForce(separationSteer);
    }


    align(nearbyPoints) {
      let steering = new Vector(0, 0);
      let total = 0;
      for (let point of nearbyPoints) {
        let other = point.userData; // Access the actual boid object
        let distance = Vector.distance(this.position, other.position);
        if (distance > 0 && distance < this.perceptionRadius) {
          steering.add(other.velocity);
          total++;
        }
      }
      if (total > 0) {
        steering.divide(total);
        steering.normalize();
        steering.multiply(this.maxSpeed);
        steering.subtract(this.velocity);
        steering.limit(this.maxForce);
      }
      return steering;
    }
    
    cohesion(nearbyPoints) {
      let steering = new Vector(0, 0);
      let total = 0;
      for (let point of nearbyPoints) {
        let other = point.userData; // Access the actual boid object
        let distance = Vector.distance(this.position, other.position);
        if (distance > 0 && distance < this.perceptionRadius) {
          steering.add(other.position);
          total++;
        }
      }
      if (total > 0) {
        steering.divide(total);
        return this.steerTowards(steering);
      }
      return steering;
    }
    
    separation(nearbyPoints) {
      let steering = new Vector(0, 0);
      let total = 0;
      for (let point of nearbyPoints) {
        let other = point.userData; // Access the actual boid object
        let distance = Vector.distance(this.position, other.position);
        if (distance > 0 && distance < this.perceptionRadius) {
          let diff = Vector.subtract(this.position, other.position);
          diff.divide(distance); // Weigh by inverse of distance
          steering.add(diff);
          total++;
        }
      }
      if (total > 0) {
        steering.divide(total);
        steering.normalize();
        steering.multiply(this.maxSpeed);
        steering.subtract(this.velocity);
        steering.limit(this.maxForce);
      }
      return steering;
    }

    avoidPredator(predator) {
        let desiredSeparation = 100; // Distance at which boids start evading the predator
        let steer = new Vector(0, 0);
        let distance = Vector.distance(this.position, predator.position);
    
        if (distance < desiredSeparation) {
            let diff = Vector.subtract(this.position, predator.position);
            diff.normalize();
            diff.divide(distance); // Weight by distance
            steer.add(diff);
        }
    
        if (steer.magnitude() > 0) {
            steer.normalize();
            steer.multiply(this.maxSpeed);
            steer.subtract(this.velocity);
            steer.limit(this.maxForce);
        }
        return steer;
    }

    draw(ctx) {
        const angle = Math.atan2(this.velocity.y, this.velocity.x);
        const size = 10; // Define the size of the triangle representing the boid

        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(size, 0); // Point of the triangle
        ctx.lineTo(-size, -size / 2);
        ctx.lineTo(-size, size / 2);
        ctx.closePath();
        ctx.fillStyle = 'black'; // Fill color of the boid
        ctx.fill();
        ctx.restore();
    }
}

class Point {
  constructor(x, y, userData = null) {
    this.x = x;
    this.y = y;
    this.userData = userData; // Can store a reference to the boid object
  }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('simulationCanvas');
    const ctx = canvas.getContext('2d');

    // Set canvas to full window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.addEventListener('mousedown', (event) => {
        if (event.button === 0) { // Left click
          addRepulsion(event.clientX, event.clientY);
        } else if (event.button === 2) { // Right click
          addBoid(event.clientX, event.clientY);
        }
    });

    // Prevent the context menu from appearing on right click
    canvas.addEventListener('contextmenu', event => event.preventDefault());

    // Initialize QuadTree
    const boundary = new Boundary(canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2);
    let quadTree = new QuadTree(boundary, 4); // Adjust capacity as needed

    // Instantiate the predator
    let predator = new Predator(canvas.width / 2, canvas.height / 2); // Example starting position

    // Create boids
    let boids = [];
    for (let i = 0; i < 500; i++) { // Adjust number of boids as needed
      let x = Math.random() * canvas.width;
      let y = Math.random() * canvas.height;
      boids.push(new Boid(x, y));
    }

    function updateSimulation() {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    
      quadTree.clear(); // Clear and rebuild the QuadTree
      boids.forEach(boid => {
        quadTree.insert(new Point(boid.position.x, boid.position.y, boid));
      });
    
      // Update and draw each boid
      boids.forEach(boid => {
        // react to predator
        let evadeForce = boid.avoidPredator(predator);
        boid.applyForce(evadeForce);
        
        boid.flock(quadTree);
        boid.update();
        boid.handleEdges(canvas.width, canvas.height);
        boid.draw(ctx); // Assuming a draw method is implemented in the Boid class
      });

        // Update and draw the predator
        predator.update(); 
        predator.handleEdges(canvas.width, canvas.height);
        predator.draw(ctx);
    
      requestAnimationFrame(updateSimulation); // Loop the simulation
    }

    function addRepulsion(x, y) {
      const repulsionRadius = 100; // Define the radius of repulsion
      const repulsionForce = new Vector(0, 0); // Initialize repulsion force vector
    
      boids.forEach(boid => {
        const distance = Vector.distance(new Vector(x, y), boid.position);
        if (distance < repulsionRadius) {
          // Calculate repulsion direction and magnitude
          let direction = Vector.subtract(boid.position, new Vector(x, y));
          direction.normalize();
          direction.multiply(boid.maxSpeed * 2); // Repulsion strength, adjust as needed
    
          boid.applyForce(direction);
        }
      });
    }
    
    function addBoid(x, y) {
      const newBoid = new Boid(x, y);
      boids.push(newBoid); // Add the new boid to the simulation
    }

    updateSimulation();
});


