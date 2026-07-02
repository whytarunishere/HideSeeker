class Camera {
    constructor(viewportWidth, viewportHeight, mapWidth, mapHeight) {
        this.x = 0;
        this.y = 0;
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        
        // The total dimensions of your level (e.g., 1000x1000)
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
    }

    // Call this if you load a larger/smaller level dynamically via JSON
    setMapDimensions(width, height) {
        this.mapWidth = width;
        this.mapHeight = height;
    }

    update(target) {
        if (!target) return;

        // 1. Center the camera on the target entity
        this.x = target.x - (this.viewportWidth / 2);
        this.y = target.y - (this.viewportHeight / 2);

        // 2. Clamp the camera to the boundaries of the map
        // Math.max(0, ...) prevents panning too far left or up
        // Math.min(..., mapSize - viewportSize) prevents panning too far right or down
        this.x = Math.max(0, Math.min(this.x, this.mapWidth - this.viewportWidth));
        this.y = Math.max(0, Math.min(this.y, this.mapHeight - this.viewportHeight));
    }

    // A helper method to apply the transformation to the canvas
    apply(ctx) {
        ctx.save();
        // Shift the entire canvas context in the opposite direction of the camera
        ctx.translate(-this.x, -this.y); 
    }

    // A helper method to remove the transformation after rendering
    clear(ctx) {
        ctx.restore();
    }
}