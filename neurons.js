// neurons.js
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('neuronCanvas');
    const ctx = canvas.getContext('2d');

    let width, height;
    let nodes = [];

    // Position handling for split hemispheres
    let leftOffsetX = 0;
    let rightOffsetX = 0;
    let offsetY = 0;
    let brainScale = 1;

    const config = {
        nodeCount: window.innerWidth < 768 ? 80 : 200, // Hemisphere nodes
        centerNodeCount: 60, // Nodes just for the middle original animation
        connectionDistance: 120,
        bridgeDistance: window.innerWidth * 0.4,
        bioColor: 'rgba(56, 189, 248, 0.8)', // Biological: Light blue
        aiColor: 'rgba(236, 72, 153, 0.8)',  // Artificial: Pink
        learnColor: 'rgba(168, 85, 247, 0.6)', // Connection color
        bioSpeed: 0.25,
        aiSpeed: 0.2,
        centerSpeed: 0.3,
        mouseRadius: 150
    };

    let mouse = { x: undefined, y: undefined };
    window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });
    window.addEventListener('mouseout', () => { mouse.x = undefined; mouse.y = undefined; });

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const isMobile = width < 768;
        brainScale = Math.min((height * 0.8) / 460, (width * 0.4) / 250);

        leftOffsetX = 0;
        rightOffsetX = width - (260 * brainScale);
        offsetY = (height - (460 * brainScale)) / 2;
        config.bridgeDistance = width * 0.5;

        init();
    }

    const leftPath = new Path2D(
        "M 20 40 C 60 20, 140 20, 180 50 C 210 70, 230 110, 240 150 C 260 180, 260 230, 230 260 C 250 290, 240 350, 200 390 C 170 430, 120 450, 70 440 C 40 430, 20 400, 20 370 C 15 340, 25 310, 20 280 C 15 250, 25 220, 20 190 C 15 150, 20 100, 25 70 C 20 50, 20 40, 20 40 Z"
    );
    const rightPath = new Path2D(
        "M 240 40 C 200 20, 120 20, 80 50 C 50 70, 30 110, 20 150 C 0 180, 0 230, 30 260 C 10 290, 20 350, 60 390 C 90 430, 140 450, 190 440 C 220 430, 240 400, 240 370 C 245 340, 235 310, 240 280 C 245 250, 235 220, 240 190 C 245 150, 240 100, 235 70 C 240 50, 240 40, 240 40 Z"
    );
    const leftInnerPath = new Path2D(
        "M 60 70 Q 120 90, 150 70 M 80 120 Q 150 140, 200 110 M 70 170 Q 160 190, 210 160 M 75 230 Q 170 250, 220 220 M 60 290 Q 150 310, 190 280 M 65 350 Q 130 360, 160 330 M 70 400 Q 110 410, 130 390"
    );
    const rightInnerPath = new Path2D(
        "M 200 70 Q 140 90, 110 70 M 180 120 Q 110 140, 60 110 M 190 170 Q 100 190, 50 160 M 185 230 Q 90 250, 40 220 M 200 290 Q 110 310, 70 280 M 195 350 Q 130 360, 100 330 M 190 400 Q 150 410, 130 390"
    );

    function isInsidePath(x, y, type) {
        if (type === 'center') return true;

        let transformX, transformY;
        if (type === 'bio') {
            transformX = (x - leftOffsetX) / brainScale;
            transformY = (y - offsetY) / brainScale;
            return ctx.isPointInPath(leftPath, transformX, transformY);
        } else {
            transformX = (x - rightOffsetX) / brainScale;
            transformY = (y - offsetY) / brainScale;
            return ctx.isPointInPath(rightPath, transformX, transformY);
        }
    }

    class Node {
        constructor(isCenter = false) {
            if (isCenter) {
                // The original simple animation for the center!
                this.role = 'center';
                this.type = Math.random() < 0.5 ? 'bio' : 'ai';

                // Spawn in the wide gap between the brains
                this.x = (width / 2) + (Math.random() - 0.5) * (width * 0.3);
                this.y = Math.random() * height;

                this.vx = (Math.random() - 0.5) * config.centerSpeed * 2;
                this.vy = (Math.random() - 0.5) * config.centerSpeed * 2;
                this.radius = Math.random() * 2 + 1;
            } else {
                // Hemisphere logic
                this.role = 'hemisphere';
                this.type = Math.random() < 0.5 ? 'bio' : 'ai';

                let spawned = false;
                let attempts = 0;
                while (!spawned && attempts < 200) {
                    if (this.type === 'bio') {
                        this.x = leftOffsetX + (Math.random() * 250 * brainScale);
                    } else {
                        this.x = rightOffsetX + (Math.random() * 250 * brainScale);
                    }
                    this.y = offsetY + (Math.random() * 460 * brainScale);

                    if (isInsidePath(this.x, this.y, this.type)) spawned = true;
                    attempts++;
                }

                if (!spawned) {
                    this.x = this.type === 'bio' ? leftOffsetX + 150 * brainScale : rightOffsetX + 100 * brainScale;
                    this.y = offsetY + 250 * brainScale;
                }

                const speedBase = this.type === 'bio' ? config.bioSpeed : config.aiSpeed;
                if (this.type === 'bio') {
                    this.vx = (Math.random() - 0.5) * speedBase * 2;
                    this.vy = (Math.random() - 0.5) * speedBase * 2;
                } else {
                    if (Math.random() > 0.5) {
                        this.vx = (Math.random() > 0.5 ? 1 : -1) * speedBase;
                        this.vy = 0;
                    } else {
                        this.vx = 0;
                        this.vy = (Math.random() > 0.5 ? 1 : -1) * speedBase;
                    }
                }
                this.radius = this.type === 'bio' ? Math.random() * 1.5 + 1 : Math.random() * 1.5 + 1.5;
            }
            this.baseRadius = this.radius;
        }

        update() {
            if (mouse.x && mouse.y) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < config.mouseRadius) {
                    let force = (config.mouseRadius - distance) / config.mouseRadius;
                    this.vx -= (dx / distance) * force * 0.05;
                    this.vy -= (dy / distance) * force * 0.05;
                }
            }

            this.x += this.vx;
            this.y += this.vy;

            if (this.role === 'center') {
                // Simple screen bouncing for the center nodes (original style)
                if (this.x < leftOffsetX + (260 * brainScale)) this.vx *= -1; // Bounce off left brain
                if (this.x > rightOffsetX) this.vx *= -1; // Bounce off right brain
                if (this.y < 0 || this.y > height) this.vy *= -1;

            } else {
                // Hemisphere containment logic
                if (!isInsidePath(this.x, this.y, this.type)) {
                    const centerX = this.type === 'bio' ? leftOffsetX + 150 * brainScale : rightOffsetX + 100 * brainScale;
                    const centerY = offsetY + 250 * brainScale;
                    const dx = centerX - this.x;
                    const dy = centerY - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (this.type === 'ai') {
                        if (this.vx !== 0) {
                            this.vy = (Math.random() > 0.5 ? 1 : -1) * config.aiSpeed;
                            this.vx = 0;
                        } else {
                            this.vx = (Math.random() > 0.5 ? 1 : -1) * config.aiSpeed;
                            this.vy = 0;
                        }
                        this.x += dx * 0.05;
                        this.y += dy * 0.05;
                    } else {
                        this.vx += (dx / dist) * 0.1;
                        this.vy += (dy / dist) * 0.1;
                    }
                } else if (this.type === 'ai' && Math.random() < 0.005) {
                    if (this.vx !== 0) {
                        this.vy = (Math.random() > 0.5 ? 1 : -1) * config.aiSpeed;
                        this.vx = 0;
                    } else {
                        this.vx = (Math.random() > 0.5 ? 1 : -1) * config.aiSpeed;
                        this.vy = 0;
                    }
                }

                if (this.type === 'bio') {
                    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                    if (currentSpeed > 1.0) {
                        this.vx = (this.vx / currentSpeed) * 1.0;
                        this.vy = (this.vy / currentSpeed) * 1.0;
                    }
                    this.radius = this.baseRadius + Math.sin(Date.now() * 0.002 + this.x) * 0.5;
                }
            }
        }

        draw() {
            ctx.beginPath();

            if (this.role === 'center') {
                // Original simple circles for the center
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.type === 'bio' ? config.bioColor : config.aiColor;
                ctx.fill();
            } else {
                // Hemisphere styled nodes
                if (this.type === 'ai') {
                    ctx.rect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
                } else {
                    ctx.arc(this.x, this.y, Math.max(0.1, this.radius), 0, Math.PI * 2);
                }
                ctx.fillStyle = this.type === 'bio' ? config.bioColor : config.aiColor;
                ctx.shadowBlur = this.type === 'ai' ? 10 : 8;
                ctx.shadowColor = ctx.fillStyle;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }

    function init() {
        nodes = [];
        for (let i = 0; i < config.nodeCount; i++) {
            nodes.push(new Node(false));
        }
        for (let i = 0; i < config.centerNodeCount; i++) {
            nodes.push(new Node(true));
        }
    }

    let frameCount = 0;

    function animate() {
        ctx.clearRect(0, 0, width, height);
        frameCount++;

        ctx.save();
        ctx.lineWidth = 3;

        // Draw Brain Outlines and Inner Folds
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
        ctx.setTransform(brainScale, 0, 0, brainScale, leftOffsetX, offsetY);
        ctx.stroke(leftPath);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
        ctx.stroke(leftInnerPath);

        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.1)';
        ctx.setTransform(brainScale, 0, 0, brainScale, rightOffsetX, offsetY);
        ctx.stroke(rightPath);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.05)';
        ctx.stroke(rightInnerPath);
        ctx.restore();

        for (let i = 0; i < nodes.length; i++) {
            nodes[i].update();
            nodes[i].draw();

            for (let j = i + 1; j < nodes.length; j++) {
                let dx = nodes[i].x - nodes[j].x;
                let dy = nodes[i].y - nodes[j].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                // Original simple center interaction
                if (nodes[i].role === 'center' || nodes[j].role === 'center') {
                    if (distance < config.connectionDistance) {
                        ctx.beginPath();
                        let opacity = 1 - (distance / config.connectionDistance);

                        if (nodes[i].type === nodes[j].type) {
                            ctx.strokeStyle = nodes[i].type === 'bio'
                                ? `rgba(56, 189, 248, ${opacity * 0.5})`
                                : `rgba(236, 72, 153, ${opacity * 0.5})`;
                        } else {
                            ctx.strokeStyle = `rgba(168, 85, 247, ${opacity * 0.4})`;
                        }

                        ctx.lineWidth = opacity * 1.5;
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
                // Hemisphere outer connections
                else if (nodes[i].type === nodes[j].type) {
                    if (distance < config.connectionDistance) {
                        ctx.beginPath();
                        let opacity = 1 - (distance / config.connectionDistance);

                        if (nodes[i].type === 'bio') {
                            ctx.strokeStyle = `rgba(56, 189, 248, ${opacity * 0.5})`;
                            ctx.lineWidth = opacity * 1.5;
                            ctx.moveTo(nodes[i].x, nodes[i].y);
                            ctx.quadraticCurveTo(
                                (nodes[i].x + nodes[j].x) / 2 + (Math.sin(frameCount * 0.05 + i) * 15),
                                (nodes[i].y + nodes[j].y) / 2 + (Math.cos(frameCount * 0.05 + j) * 15),
                                nodes[j].x, nodes[j].y
                            );
                            ctx.stroke();
                        } else {
                            ctx.strokeStyle = `rgba(236, 72, 153, ${opacity * 0.6})`;
                            ctx.lineWidth = opacity * 1.5;
                            ctx.moveTo(nodes[i].x, nodes[i].y);
                            ctx.lineTo(nodes[j].x, nodes[i].y);
                            ctx.lineTo(nodes[j].x, nodes[j].y);
                            ctx.stroke();

                            ctx.fillStyle = `rgba(236, 72, 153, ${opacity * 0.8})`;
                            ctx.fillRect(nodes[j].x - 1.5, nodes[i].y - 1.5, 3, 3);
                        }
                    }
                }
                // Connecting hemis to center
                else {
                    const bioNode = nodes[i].type === 'bio' ? nodes[i] : nodes[j];
                    const aiNode = nodes[i].type === 'ai' ? nodes[i] : nodes[j];

                    if (distance < config.bridgeDistance * 0.6) {
                        const maxBioX = leftOffsetX + 250 * brainScale + 50;
                        const minAiX = rightOffsetX - 50;

                        if (bioNode.x > maxBioX - (200 * brainScale) && aiNode.x < minAiX + (200 * brainScale)) {
                            ctx.beginPath();
                            let opacity = 1 - (distance / (config.bridgeDistance * 0.6));
                            let streamPhase = (frameCount * 0.05 + i) % (Math.PI * 2);
                            let pulse = (Math.sin(streamPhase) + 1) / 2;

                            ctx.strokeStyle = `rgba(168, 85, 247, ${opacity * pulse * 0.5})`;
                            ctx.lineWidth = Math.max(0.5, opacity * 2.5);

                            ctx.setLineDash([10, 20]);
                            ctx.lineDashOffset = -frameCount * 1.5;

                            ctx.moveTo(bioNode.x, bioNode.y);
                            ctx.quadraticCurveTo(width / 2, height / 2, aiNode.x, aiNode.y);
                            ctx.stroke();
                            ctx.setLineDash([]);
                        }
                    }
                }
            }
        }
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
});
