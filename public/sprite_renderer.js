class SpriteRenderer {
    constructor() {
        this.seekerSprite = new Image();
        this.seekerSprite.src = 'seeker_spritesheet.png'; 
        this.hiderSprite = new Image();
        this.hiderSprite.src = 'hider_spritesheet.png';   

        // Image Scaling configurations
        this.SPRITE_WIDTH = 133.5; 
        this.SPRITE_HEIGHT = 199.75;
        this.RENDER_SCALE = 0.4; 
        this.DRAW_WIDTH = this.SPRITE_WIDTH * this.RENDER_SCALE;
        this.DRAW_HEIGHT = this.SPRITE_HEIGHT * this.RENDER_SCALE;
        this.TOTAL_WALK_FRAMES = 4; 

        // Map the 4 rows in your image, and add fallbacks for diagonal inputs
        this.DIRECTION_ROWS = {
            'down': 0, 'up': 1, 'left': 2, 'right': 3,
            'down-left': 2, 'down-right': 3, 'up-left': 2, 'up-right': 3
        };
    }

    render(ctx, canvas, localPlayers, animFrameCounter) {
        //ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        Object.keys(localPlayers).forEach(id => {
            let p = localPlayers[id];
            if (p.role === 'spectator') return; // Do not draw dead players

            let currentSheet = (p.role === 'seeker') ? this.seekerSprite : this.hiderSprite;
            let row = this.DIRECTION_ROWS[p.direction || 'down'] || 0;
            let col = p.isMoving ? (Math.floor(animFrameCounter / 8) % this.TOTAL_WALK_FRAMES) : 0;

            let sx = col * this.SPRITE_WIDTH;
            let sy = row * this.SPRITE_HEIGHT;

            ctx.drawImage(
                currentSheet, 
                sx, sy, this.SPRITE_WIDTH, this.SPRITE_HEIGHT,               
                p.x - this.DRAW_WIDTH / 2, p.y - this.DRAW_HEIGHT / 2,       
                this.DRAW_WIDTH, this.DRAW_HEIGHT                            
            );
        });
    }
}