
import { Enemy, EnemyType } from '../../../types';
import { COLORS } from '../../../constants';
import { drawVolumetricThruster, drawEntity25D, drawShadow } from '../primitives';
import { UIRequest } from '../types';
import { localToScreen } from '../camera/projectToScreen';

const renderHunter = (ctx: CanvasRenderingContext2D, hull: string, accent: string, now: number) => {
    // Top Layer Only (Base is handled by system)
    
    // Thruster (Behind)
    drawVolumetricThruster(ctx, -10, 0, 6, 18, accent, now);
    
    // Main Body
    const grad = ctx.createLinearGradient(-10, 0, 10, 0);
    grad.addColorStop(0, '#111');
    grad.addColorStop(0.5, hull);
    grad.addColorStop(1, '#222');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(14, 0);    
    ctx.lineTo(-8, 10);   
    ctx.lineTo(-4, 0);    
    ctx.lineTo(-8, -10);  
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Eye
    ctx.fillStyle = accent;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(2, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(3, -1, 1, 0, Math.PI * 2);
    ctx.fill();
};

const renderInterceptor = (ctx: CanvasRenderingContext2D, hull: string, accent: string, now: number) => {
    // Twin Engines
    drawVolumetricThruster(ctx, -8, -5, 4, 30, accent, now, 100);
    drawVolumetricThruster(ctx, -8, 5, 4, 30, accent, now, 200);
    
    const grad = ctx.createLinearGradient(-10, 0, 20, 0);
    grad.addColorStop(0, '#000');
    grad.addColorStop(0.4, hull);
    grad.addColorStop(1, '#eee');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(-10, 6);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-10, -6);
    ctx.closePath();
    ctx.fill();
    
    // Wings
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(-12, 14);
    ctx.lineTo(-6, 4);
    ctx.lineTo(-6, -4);
    ctx.lineTo(-12, -14);
    ctx.closePath();
    ctx.fill();
    
    // Lights
    ctx.fillStyle = accent;
    ctx.fillRect(-10, -5, 4, 2);
    ctx.fillRect(-10, 3, 4, 2);
};

const renderShooter = (ctx: CanvasRenderingContext2D, hull: string, accent: string, now: number, e: Enemy) => {
    drawVolumetricThruster(ctx, -12, 0, 10, 12, accent, now);
    ctx.fillStyle = hull;
    ctx.beginPath();
    ctx.moveTo(8, -8);
    ctx.lineTo(8, 8);
    ctx.lineTo(-8, 12);
    ctx.lineTo(-14, 0);
    ctx.lineTo(-8, -12);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#222';
    ctx.fillRect(-6, -6, 12, 12);
    
    // Cannon
    ctx.save();
    const recoil = (e.attackTimer && e.attackTimer > 2000) ? Math.sin(now * 0.5) * 2 : 0;
    ctx.fillStyle = '#111';
    ctx.fillRect(0 - recoil, -3, 16, 6);
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI*2);
    ctx.fill();
    
    if (e.attackTimer && e.attackTimer > 2000) {
        const charge = (e.attackTimer - 2000) / 1000;
        const flicker = Math.random() * 0.5 + 0.5;
        ctx.fillStyle = accent;
        ctx.shadowColor = accent;
        ctx.shadowBlur = 10 * charge * flicker;
        ctx.beginPath();
        ctx.arc(16 - recoil, 0, 2 + (charge * 2), 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = charge * 0.5;
        ctx.fillRect(-4, -4, 8, 8);
    }
    ctx.restore();
    
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1;
    ctx.strokeRect(-5, -5, 10, 10);
};

const renderDasher = (ctx: CanvasRenderingContext2D, hull: string, accent: string, now: number, e: Enemy) => {
    const isDashing = e.dashState === 'DASH';
    const boost = isDashing ? 2.5 : 1;
    drawVolumetricThruster(ctx, -5, 0, 8 * boost, 15 * boost, accent, now);
    
    ctx.fillStyle = hull;
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(4, 6);
    ctx.lineTo(-4, 10);
    ctx.lineTo(0, 4);
    ctx.lineTo(-8, 0);
    ctx.lineTo(0, -4);
    ctx.lineTo(-4, -10);
    ctx.lineTo(4, -6);
    ctx.closePath();
    ctx.fill();
    
    if (e.dashState === 'CHARGE' || isDashing) {
        ctx.shadowColor = accent;
        ctx.shadowBlur = isDashing ? 20 : 10;
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2;
        if (Math.random() > 0.1) {
            ctx.beginPath();
            ctx.moveTo(4, 6); 
            ctx.lineTo(18, 10);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(4, -6); 
            ctx.lineTo(18, -10);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
    }
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(2, 2);
    ctx.lineTo(2, -2);
    ctx.fill();
};

export const renderEnemy = (
    ctx: CanvasRenderingContext2D, 
    e: Enemy, 
    gridSize: number, 
    halfGrid: number, 
    snakeHead: any, 
    now: number, 
    reduceFlashing: boolean,
    tilt: number = 0 // Camera Tilt passed from renderer
): UIRequest | void => {
    let color = COLORS.enemyHunter;
    let accentColor = '#ef4444';
    let hullColor = '#1a0505';
    let scale = 1.0;
    let height = 20; // Default height

    switch (e.type) {
        case EnemyType.INTERCEPTOR:
            color = COLORS.enemyInterceptor;
            accentColor = '#d946ef';
            hullColor = '#1a051a';
            scale = 0.9;
            height = 30; // Flyers are higher visually
            break;
        case EnemyType.SHOOTER:
            color = COLORS.enemyShooter;
            accentColor = '#22c55e';
            hullColor = '#051a05';
            scale = 1.2;
            height = 25;
            break;
        case EnemyType.DASHER:
            color = COLORS.enemyDasher;
            accentColor = '#f97316';
            hullColor = '#1a1005';
            height = 15; // Low profile
            break;
        case EnemyType.HUNTER:
        default:
            height = 20;
            break;
    }

    if (e.flash && e.flash > 0 && !reduceFlashing) {
        hullColor = '#ffffff';
        color = '#ffffff';
        accentColor = '#ffffff';
    }

    let angle = 0;
    if (snakeHead) {
        const dx = snakeHead.x - e.x;
        const dy = snakeHead.y - e.y;
        angle = Math.atan2(dy, dx);
    } else if (e.vx || e.vy) {
        angle = Math.atan2(e.vy, e.vx);
    }

    const hoverY = Math.sin(now / 250 + e.x) * 4;

    // Use 2.5D Draw System and get Anchors
    const anchors = drawEntity25D(
        ctx,
        0, // Local X (Relative to entity center)
        hoverY, // Local Y (Base bobbing)
        height,
        tilt,
        angle,
        {
            shadow: () => {
                const shadowScale = 1.0 - (hoverY / 40); 
                // Rotate shadow manually to match enemy orientation on the ground
                // We must rotate AROUND the base (0,0), so we translate to shadow offset first?
                // The drawEntity25D implementation does NOT rotate shadows. 
                // So we do it here.
                ctx.save();
                // Move to ground position relative to entity center
                ctx.translate(0, -hoverY);
                ctx.rotate(angle);
                // Increased base radius multiplier from 0.6 to 0.9 for visibility
                // Note: We use (0,0) because we already translated to the shadow spot
                drawShadow(ctx, 0, 0, gridSize * 0.9 * scale * shadowScale, 8);
                ctx.restore();
            },
            body: (offset) => {
                // Draw connecting wall if tilt > 0
                if (tilt > 0.1) {
                    ctx.fillStyle = '#0a0a0a'; // Dark underside
                    ctx.strokeStyle = accentColor;
                    ctx.globalAlpha = 0.3;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    // Draw a simple connector line or box
                    ctx.moveTo(0, 0); 
                    ctx.lineTo(0, offset); // Offset is -z*tilt (negative), so this draws 'up'
                    ctx.stroke();
                    ctx.globalAlpha = 1.0;
                }
            },
            top: (offset) => {
                // Isolated state for scale
                ctx.save();
                ctx.scale(scale, scale);
                // Delegate to specific renderers (Top Face)
                switch (e.type) {
                    case EnemyType.INTERCEPTOR:
                        renderInterceptor(ctx, hullColor, accentColor, now);
                        break;
                    case EnemyType.SHOOTER:
                        renderShooter(ctx, hullColor, accentColor, now, e);
                        break;
                    case EnemyType.DASHER:
                        renderDasher(ctx, hullColor, accentColor, now, e);
                        break;
                    case EnemyType.HUNTER:
                    default:
                        renderHunter(ctx, hullColor, accentColor, now);
                        break;
                }

                if (e.stunTimer && e.stunTimer > 0) {
                    ctx.save();
                    ctx.globalCompositeOperation = 'screen';
                    ctx.strokeStyle = '#00ffff';
                    ctx.lineWidth = 2;
                    ctx.shadowColor = '#00ffff';
                    ctx.shadowBlur = 10;
                    ctx.rotate(now * 0.01);
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    const r = gridSize * 0.9;
                    ctx.arc(0, 0, r, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }
                ctx.restore();
            }
        }
    );

    // Return UI Request for Health Bar
    if (e.hp < e.maxHp) {
        // Convert the Local Top Anchor to Absolute Screen Coordinates
        // The health bar should float distinctly above the top of the entity
        // Increased offset from -10 to -20 to avoid clipping 
        const screenPos = localToScreen(ctx, anchors.top.x, anchors.top.y - 20);
        
        return {
            type: 'HEALTH_BAR',
            x: screenPos.x,
            y: screenPos.y,
            value: e.hp,
            max: e.maxHp,
            color: '#00ff00',
            width: gridSize * 1.5,
            height: 4
        };
    }
};
