// =========================================
// RHYTHM GAME BACKGROUND ENGINE
// =========================================

const canvas = document.getElementById("rhythm-canvas");

if (canvas) {

    const ctx = canvas.getContext("2d");

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const mouse = {
        x: null,
        y: null,
        radius: 200
    };

    window.addEventListener("mousemove", e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener("mouseout", () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // =========================================
    // SHARDS
    // =========================================

    class Shard {

        constructor() {
            this.reset();
            this.y = Math.random() * height;
        }

        reset() {

            this.x = Math.random() * width;

            this.y = height + Math.random() * 100;

            this.size = Math.random() * 18 + 10;

            this.speedX = (Math.random() - 0.5) * 0.5;

            this.speedY = -(Math.random() * 0.6 + 0.4);

            this.angle = Math.random() * Math.PI * 2;

            this.spin = (Math.random() - 0.5) * 0.006;

            this.opacity = Math.random() * 0.35 + 0.15;

            this.points = [];

            const count = Math.floor(Math.random() * 3) + 3;

            for (let i = 0; i < count; i++) {

                const angle = (i / count) * Math.PI * 2;

                const radius =
                    this.size * (0.7 + Math.random() * 0.5);

                this.points.push({
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius
                });
            }
        }

        update() {

            this.x += this.speedX;
            this.y += this.speedY;
            this.angle += this.spin;

            if (mouse.x !== null) {

                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;

                const distance =
                    Math.sqrt(dx * dx + dy * dy);

                if (
                    distance < mouse.radius &&
                    distance > 0
                ) {

                    const force =
                        (mouse.radius - distance)
                        / mouse.radius;

                    this.x +=
                        (dx / distance) * force * 2;

                    this.y +=
                        (dy / distance) * force * 2;
                }
            }

            if (
                this.y < -50 ||
                this.x < -50 ||
                this.x > width + 50
            ) {
                this.reset();
            }
        }

        draw() {

            ctx.save();

            ctx.translate(this.x, this.y);

            ctx.rotate(this.angle);

            const gradient =
                ctx.createLinearGradient(
                    -this.size,
                    -this.size,
                    this.size,
                    this.size
                );

            gradient.addColorStop(
                0,
                `rgba(0,242,254,${this.opacity})`
            );

            gradient.addColorStop(
                0.5,
                `rgba(236,72,153,${this.opacity * 0.7})`
            );

            gradient.addColorStop(
                1,
                `rgba(255,255,255,${this.opacity * 0.4})`
            );

            ctx.fillStyle = gradient;

            ctx.strokeStyle =
                `rgba(255,255,255,${this.opacity})`;

            ctx.lineWidth = 1;

            ctx.beginPath();

            ctx.moveTo(
                this.points[0].x,
                this.points[0].y
            );

            for (let i = 1; i < this.points.length; i++) {

                ctx.lineTo(
                    this.points[i].x,
                    this.points[i].y
                );
            }

            ctx.closePath();

            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }
    }

    // =========================================
    // STARS
    // =========================================

    class StarParticle {

        constructor() {
            this.reset();
            this.y = Math.random() * height;
        }

        reset() {

            this.x = Math.random() * width;

            this.y = height;

            this.size =
                Math.random() * 2 + 1;

            this.speedY =
                -(Math.random() * 0.8 + 0.3);

            this.speedX =
                (Math.random() - 0.5) * 0.3;

            this.alpha =
                Math.random() * 0.5 + 0.3;

            this.color =
                Math.random() > 0.5
                ? "0,242,254"
                : "236,72,153";
        }

        update() {

            this.y += this.speedY;
            this.x += this.speedX;

            if (this.y < -10) {
                this.reset();
            }
        }

        draw() {

            ctx.shadowBlur = 10;

            ctx.shadowColor =
                `rgba(${this.color},0.8)`;

            ctx.fillStyle =
                `rgba(255,255,255,${this.alpha})`;

            ctx.beginPath();

            ctx.arc(
                this.x,
                this.y,
                this.size,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.shadowBlur = 0;
        }
    }

    // =========================================
    // WAVES
    // =========================================

    let waveOffset = 0;

    function drawWaves() {

        waveOffset += 0.0018;

        const waves = [
            {
                amp: 50,
                freq: 0.0014,
                color: "rgba(0,242,254,.12)"
            },
            {
                amp: 35,
                freq: 0.0018,
                color: "rgba(236,72,153,.10)"
            },
            {
                amp: 65,
                freq: 0.001,
                color: "rgba(255,255,255,.08)"
            }
        ];

        waves.forEach(w => {

            ctx.beginPath();

            ctx.strokeStyle = w.color;

            for (let x = 0; x <= width; x += 10) {

                const y =
                    height * 0.65 +
                    (
                        Math.sin(
                            x * w.freq + waveOffset
                        ) +
                        Math.cos(
                            x * w.freq * 0.5
                        )
                    ) * w.amp;

                if (x === 0)
                    ctx.moveTo(x, y);
                else
                    ctx.lineTo(x, y);
            }

            ctx.stroke();
        });
    }

    // =========================================
    // INIT
    // =========================================

    const shards = [];
    const stars = [];

    for (let i = 0; i < 26; i++) {
        shards.push(new Shard());
    }

    for (let i = 0; i < 40; i++) {
        stars.push(new StarParticle());
    }

    // =========================================
    // LOOP
    // =========================================

    function animate() {

        ctx.fillStyle = "#0f0f2d";
        ctx.fillRect(0, 0, width, height);

        stars.forEach(star => {
            star.update();
            star.draw();
        });

        drawWaves();

        shards.forEach(shard => {
            shard.update();
            shard.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();
}