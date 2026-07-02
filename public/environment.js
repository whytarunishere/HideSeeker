class EnvironmentRenderer {
    constructor() {
        this.backgroundImage = new Image();
        this.isLoaded = false; // Prevents rendering before data arrives
        
        // Default empty values
        this.TILE_SIZE = 0; 
        this.ROWS = 0;
        this.COLS = 0;
        this.collisionMap = [];
    }

    // Pass the path of the JSON file you want to load
    async loadMap(mapJsonPath) {
        try {
            const response = await fetch(mapJsonPath);
            const mapData = await response.json();

            // Populate the class properties with the JSON data
            this.TILE_SIZE = mapData.tileSize;
            this.ROWS = mapData.rows;
            this.COLS = mapData.cols;
            this.collisionMap = mapData.collisionMap;

            // Load the corresponding image
            this.backgroundImage.src = mapData.imageSrc;
            
            // Wait for the image to physically load into browser memory
            this.backgroundImage.onload = () => {
                this.isLoaded = true;
                console.log(`Successfully loaded map: ${mapData.name}`);
            };
        } catch (error) {
            console.error("Failed to load map data:", error);
        }
    }

    isSolid(pixelX, pixelY) {
        if (!this.isLoaded) return true; // Freeze movement if map hasn't loaded

        let col = Math.floor(pixelX / this.TILE_SIZE);
        let row = Math.floor(pixelY / this.TILE_SIZE);

        if (row < 0 || row >= this.ROWS || col < 0 || col >= this.COLS) {
            return true; 
        }

        return this.collisionMap[row][col] === 1;
    }

    render(ctx, canvasWidth, canvasHeight) {
        // REMOVED: ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        // Clearing is now handled by the master game loop in index.html

        // Only draw if the data and image are fully loaded
        if (this.isLoaded) {
            // Draw the visual map
            // Note: Use the full map dimensions here, not the canvas viewport dimensions
            ctx.drawImage(this.backgroundImage, 0, 0, this.COLS * this.TILE_SIZE, this.ROWS * this.TILE_SIZE);

            // Keep debug gridlines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; 
            ctx.lineWidth = 1;

            for (let row = 0; row < this.ROWS; row++) {
                for (let col = 0; col < this.COLS; col++) {
                    let destX = col * this.TILE_SIZE;
                    let destY = row * this.TILE_SIZE;
                    
                    ctx.strokeRect(destX, destY, this.TILE_SIZE, this.TILE_SIZE);

                    if (this.collisionMap[row][col] === 1) {
                        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                        ctx.fillRect(destX, destY, this.TILE_SIZE, this.TILE_SIZE);
                    }
                }
            }
        }
    }
}