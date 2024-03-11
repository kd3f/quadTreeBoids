document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('simulationCanvas');
    const ctx = canvas.getContext('2d');

    // Set canvas to full window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    /*fps*/
    let fps = 0;
    let framesThisSecond = 0;
    let lastFrameTimeMs = 0;
    let lastSecond = Date.now();

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
    for (let i = 0; i < 1500; i++) { // Adjust number of boids as needed
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
        FPSdebug();

        requestAnimationFrame(updateSimulation); // Loop the simulation
    }

    function FPSdebug() {
        const now = Date.now();
        const delta = now - this.lastFrameTimeMs;
        lastFrameTimeMs = now;
        if (now - lastSecond >= 1000) {
            fps = framesThisSecond;
            framesThisSecond = 0;
            lastSecond += 1000;
        }
        framesThisSecond++;
        displayFPS(fps);
    }

    function displayFPS(fps) {
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(`FPS: ${fps}`, 20, 30);
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