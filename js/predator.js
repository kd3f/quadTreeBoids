class Predator {
    constructor(x, y) {
        this.position = new Vector(x, y);
        this.velocity = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
        this.radius = 20; // Larger size for the predator
        this.acceleration = new Vector(0, 0);
        this.maxSpeed = 1; // Typically faster than a boid
        this.maxForce = 0.05; // Stronger force to catch boids

        this.startY = y; // Starting Y position for sinusoidal movement
        this.direction = -1; // -1 for left, 1 for right
        this.waveAmplitude = 50; // Sinusoidal movement amplitude
        this.waveFrequency = 0.05; // Sinusoidal movement frequency
    }

    update() {
      // Apply sinusoidal vertical movement based on the X position
      let wave = Math.sin(this.position.x * this.waveFrequency) * this.waveAmplitude;
      this.position.y = this.startY + wave;

      // Update horizontal position
      this.velocity.x = this.maxSpeed * this.direction;
      this.velocity.add(this.acceleration);
      this.velocity.limit(this.maxSpeed);
      this.position.add(this.velocity);
      this.acceleration.multiply(0); // Reset acceleration
    }

    handleEdges(canvasWidth, canvasHeight) {
      if ((this.direction === -1 && this.position.x < 0) || 
          (this.direction === 1 && this.position.x > canvasWidth)) {
        // Change direction and assign a new random Y position
        this.direction *= -1; // Change direction
        this.startY = Math.random() * canvasHeight; // New Y position for sinusoidal movement
        this.position.x = this.direction === 1 ? 0 : canvasWidth; // Reset X position
      }
    }

    applyForce(force) {
        this.acceleration.add(force);
    }

    draw(ctx) {
      // Body
      ctx.fillStyle = 'red'; // A striking color
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
      ctx.fill();

      // Eyes
      ctx.fillStyle = 'white'; // Eyes that stand out
      let angle = Math.atan2(this.velocity.y, this.velocity.x);
      let eyeDistance = this.radius / 2.5; // Distance of eyes from the center
      let eyeRadius = this.radius / 5; // Size of the eyes
      let eye1 = { x: this.position.x + Math.cos(angle - 0.2) * eyeDistance, y: this.position.y + Math.sin(angle - 0.2) * eyeDistance };
      let eye2 = { x: this.position.x + Math.cos(angle + 0.2) * eyeDistance, y: this.position.y + Math.sin(angle + 0.2) * eyeDistance };
      
      // Draw eyes
      ctx.beginPath();
      ctx.arc(eye1.x, eye1.y, eyeRadius, 0, 2 * Math.PI);
      ctx.arc(eye2.x, eye2.y, eyeRadius, 0, 2 * Math.PI);
      ctx.fill();
    }
    // Additional predator-specific behaviors can be implemented here
}
