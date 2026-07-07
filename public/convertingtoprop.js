class ConvertingToProp {
    constructor(srcImageName, frameWidth = 64, frameHeight = 64, totalAvailableProps = 4, renderScale = 2) {
        // Load the shared environment object texture
        this.propImage = new Image();
        this.propImage.src = srcImageName;

        // Size configurations for the base image
        this.sourceWidth = frameWidth;
        this.sourceHeight = frameHeight;
        
        // totalAvailableProps is kept in the constructor so your index.html doesn't break, 
        // but we no longer use it for cropping.

        // Scaling configurations for drawing on the canvas
        this.renderScale = renderScale;
        this.drawWidth = this.sourceWidth * this.renderScale;
        this.drawHeight = this.sourceHeight * this.renderScale;
    }

    /**
     * Toggles a player's disguise state
     * @param {Object} playerObject - The targeted player profile from localPlayers
     * @returns {boolean} True if state mutated, otherwise false
     */
    executeToggle(playerObject) {
        if (!playerObject || playerObject.role !== 'hider') return false;

        // Invert the disguise state flag
        playerObject.isDisguised = !playerObject.isDisguised;

        // We no longer randomize a prop type since there's only one image
        playerObject.propType = playerObject.isDisguised ? 1 : 0;

        return true; // Return true to signal that a network socket update package is required
    }

    /**
     * Renders the designated environmental prop centered onto the canvas coordinates
     * @param {CanvasRenderingContext2D} ctx - The HTML5 canvas rendering layer
     * @param {Object} playerObject - The current player data schema to draw
     */
    render(ctx, playerObject) {
        // Draw the ENTIRE image (no source crop parameters)
        ctx.drawImage(
            this.propImage,
            playerObject.x - this.drawWidth / 2, playerObject.y - this.drawHeight / 2, // Centered canvas location
            this.drawWidth, this.drawHeight                                            // Display width and height dimensions
        );
    }
}

// Export for vanilla browser usage
window.ConvertingToProp = ConvertingToProp;