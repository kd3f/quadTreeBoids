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
        ctx.fillStyle = 'rgba(31, 159, 171, 1)'; // Fill color of the boid
        ctx.fill();
        ctx.restore();
    }
}