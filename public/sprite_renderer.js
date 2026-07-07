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

        this.DIRECTION_ROWS = {
            'down': 0, 'up': 1, 'left': 2, 'right': 3,
            'down-left': 2, 'down-right': 3, 'up-left': 2, 'up-right': 3
        };
    }

    // FIXED: Signature updated to accept propManager and myId
    render(ctx, canvas, localPlayers, animFrameCounter, propManager, myId) {
        Object.keys(localPlayers).forEach(id => {
            let p = localPlayers[id];
            if (p.role === 'spectator') return; 

            // --- THE FIX: HAND OFF RENDERING IF DISGUISED ---
            if (p.role === 'hider' && p.isDisguised && propManager) {
                propManager.render(ctx, p);
            } else {
                // Draw standard animated characters
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
            }
            
            // Local highlight ring marker (Green if disguised)
            if(id === myId) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 22, 0, Math.PI * 2);
                ctx.strokeStyle = p.isDisguised ? 'rgba(0, 255, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });
    }
}