class PlayerController {
    constructor(canvasWidth, canvasHeight) {
        this.keys = { w: false, a: false, s: false, d: false };
        this.speed = 4.5;
        this.LERP_FACTOR = 0.12;
        this.lastEmitTime = 0;
        this.EMIT_INTERVAL = 30; // Max network talk speed
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Input Listeners
        window.addEventListener('keydown', (e) => {
            if (this.keys.hasOwnProperty(e.key.toLowerCase())) {
                this.keys[e.key.toLowerCase()] = true;
            }
        });
        window.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.key.toLowerCase())) {
                this.keys[e.key.toLowerCase()] = false;
            }
        });
    }

    // Update the function signature to accept the environment
    updateLocalPlayer(p, myId, localPlayers, socket, currentTime, environment) {
        let rawDx = 0;
        let rawDy = 0;

        if (this.keys.w) rawDy -= 1;
        if (this.keys.s) rawDy += 1;
        if (this.keys.a) rawDx -= 1;
        if (this.keys.d) rawDx += 1;

        p.isMoving = (rawDx !== 0 || rawDy !== 0);

        if (p.isMoving) {
            const magnitude = Math.hypot(rawDx, rawDy);
            const dx = (rawDx / magnitude) * this.speed;
            const dy = (rawDy / magnitude) * this.speed;

            let nextX = p.x + dx;
            let nextY = p.y + dy;

            // --- THE FIX: GRID COLLISION DETECTION ---
            // Define a hitbox radius so the edges of the sprite collide, not just the dead center
            const HITBOX = 15; 

            // Check X axis movement: Check both top and bottom corners of the bounding box
            if (!environment.isSolid(nextX - HITBOX, p.y - HITBOX) && 
                !environment.isSolid(nextX + HITBOX, p.y - HITBOX) &&
                !environment.isSolid(nextX - HITBOX, p.y + HITBOX) && 
                !environment.isSolid(nextX + HITBOX, p.y + HITBOX)) {
                
                p.x = nextX; // Apply X movement if free
            }

            // Check Y axis movement: Check both left and right corners of the bounding box
            if (!environment.isSolid(p.x - HITBOX, nextY - HITBOX) && 
                !environment.isSolid(p.x + HITBOX, nextY - HITBOX) &&
                !environment.isSolid(p.x - HITBOX, nextY + HITBOX) && 
                !environment.isSolid(p.x + HITBOX, nextY + HITBOX)) {
                
                p.y = nextY; // Apply Y movement if free
            }

            // Resolve directional strings accurately
            let dirString = '';
            if (rawDy === -1) dirString += 'up';
            if (rawDy === 1) dirString += 'down';
            if (rawDx === -1) dirString += (dirString ? '-' : '') + 'left';
            if (rawDx === 1) dirString += (dirString ? '-' : '') + 'right';
            
            p.direction = dirString;

            // Throttled Network Packets
            if (currentTime - this.lastEmitTime > this.EMIT_INTERVAL) {
                // FIXED: Include isDisguised and propType in movement emit
                socket.emit('playerMovement', { 
                    x: p.x, y: p.y, direction: p.direction, isMoving: p.isMoving,
                    isDisguised: p.isDisguised, propType: p.propType 
                });
                this.lastEmitTime = currentTime;

                if (p.role === 'seeker') {
                    Object.keys(localPlayers).forEach(id => {
                        if (id !== myId && localPlayers[id].role === 'hider') {
                            if (Math.hypot(p.x - localPlayers[id].x, p.y - localPlayers[id].y) < 30) {
                                socket.emit('playerTag', id);
                            }
                        }
                    });
                }
            }
        } else if (p.wasMovingLastFrame) {
            // FIXED: Include isDisguised and propType when stopping
            socket.emit('playerMovement', { 
                x: p.x, y: p.y, direction: p.direction, isMoving: false,
                isDisguised: p.isDisguised, propType: p.propType
            });
        }
        
        p.wasMovingLastFrame = p.isMoving;
    }

    interpolateOtherPlayers(localPlayers, myId) {
        Object.keys(localPlayers).forEach(id => {
            if (id !== myId) {
                let p = localPlayers[id];
                if (p.targetX === undefined) { p.targetX = p.x; p.targetY = p.y; }
                p.x += (p.targetX - p.x) * this.LERP_FACTOR;
                p.y += (p.targetY - p.y) * this.LERP_FACTOR;
            }
        });
    }
}