const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const startGameBtn = document.getElementById("startGameBtn");

// Efectos de sonido
const bgMusic = document.getElementById("bgMusic");
const hitSound = document.getElementById("hitSound");

const TOTAL_OBJECTS = 25;
const TOP_MARGIN = 12;

const MOVEMENT_TYPES = ["up", "down", "diagonal", "circular"];

let objects = [];
let eliminations = 0;

let mouseX = 0;
let mouseY = 0;
let hoveredObjectIndex = -1;

let gameStarted = false;

const backgroundImage = new Image();
backgroundImage.src = "assets/img/fondo.jpg";

const spriteImage = new Image();
spriteImage.src = "assets/img/pelota.png";

function getRandomMovementType() {
    const index = Math.floor(Math.random() * MOVEMENT_TYPES.length);
    return MOVEMENT_TYPES[index];
}

function getSpeedLevel() {
    if (eliminations > 15) {
        return {
            minY: 4.2,
            maxY: 6.2,
            label: "Alta",
            bg: "rgba(239, 68, 68, 0.92)",
            border: "#b91c1c",
            text: "#ffffff"
        };
    }

    if (eliminations > 10) {
        return {
            minY: 2.8,
            maxY: 4.2,
            label: "Media",
            bg: "rgba(245, 158, 11, 0.92)",
            border: "#b45309",
            text: "#ffffff"
        };
    }

    return {
        minY: 1.2,
        maxY: 2.8,
        label: "Inicial",
        bg: "rgba(59, 130, 246, 0.92)",
        border: "#1d4ed8",
        text: "#ffffff"
    };
}

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomMovementType() {
    const index = Math.floor(Math.random() * MOVEMENT_TYPES.length);
    return MOVEMENT_TYPES[index];
}

class FallingObject {
    constructor(x, y, size, sprite, speedY, speedX = 0, movementType = "down") {
        this.posX = x;
        this.posY = y;

        this.size = size;

        this.width = size;
        this.height = size;
        this.hitRadius = size * 0.5;

        this.sprite = sprite;

        this.dx = speedX;
        this.dy = speedY;

        this.flashFrames = 0;
        this.hitboxPadding = 18;
        this.isHovered = false;

        this.movementType = movementType;

        // Cooldown para evitar colisiones repetidas inmediatas
        this.collisionCooldown = 0;

        // Parámetros para movimiento circular
        this.angle = randomBetween(0, Math.PI * 2);
        this.angularSpeed = randomBetween(0.03, 0.06);
        this.orbitRadius = randomBetween(20, 45);

        this.centerX = x;
        this.centerY = y;
        this.centerDx = randomBetween(-1.2, 1.2);
        this.centerDy = randomBetween(-1.2, 1.2);
    }

    draw(context) {
        const drawX = this.posX - this.width / 2;
        const drawY = this.posY - this.height / 2;

        if (this.flashFrames > 0) {
            context.save();
            context.shadowColor = "rgba(0, 102, 255, 0.75)";
            context.shadowBlur = 18;
            context.drawImage(this.sprite, drawX, drawY, this.width, this.height);
            context.restore();
        } else if (this.isHovered) {
            context.save();
            context.shadowColor = "rgba(255, 255, 255, 0.9)";
            context.shadowBlur = 14;
            context.drawImage(this.sprite, drawX, drawY, this.width, this.height);
            context.restore();
        } else {
            context.drawImage(this.sprite, drawX, drawY, this.width, this.height);
        }
    }

    move() {
        if (this.movementType === "circular") {
            this.moveCircular();
        } else {
            this.moveLinear();
        }
    }

    moveLinear() {
        this.posX += this.dx;
        this.posY += this.dy;
    }

    moveCircular() {
        this.centerX += this.centerDx;
        this.centerY += this.centerDy;

        this.angle += this.angularSpeed;

        this.posX = this.centerX + Math.cos(this.angle) * this.orbitRadius;
        this.posY = this.centerY + Math.sin(this.angle) * this.orbitRadius;
    }

    isOutOfBounds(canvasWidth, canvasHeight) {
        const margin = this.hitRadius + 60;

        return (
            this.posX < -margin ||
            this.posX > canvasWidth + margin ||
            this.posY < -margin ||
            this.posY > canvasHeight + margin
        );
    }

    getDistance(otherObject) {
        const dx = otherObject.posX - this.posX;
        const dy = otherObject.posY - this.posY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    isCollidingWith(otherObject) {
        return this.getDistance(otherObject) <= (this.hitRadius + otherObject.hitRadius);
    }

    containsPoint(x, y) {
        const dx = x - this.posX;
        const dy = y - this.posY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= (this.hitRadius + this.hitboxPadding);
    }

    flashBlue() {
        this.flashFrames = 6;
    }

    restoreFlash() {
        if (this.flashFrames > 0) {
            this.flashFrames--;
        }
    }

    updateCollisionCooldown() {
        if (this.collisionCooldown > 0) {
            this.collisionCooldown--;
        }
    }

    bounceWith(otherObject) {
        const dx = otherObject.posX - this.posX;
        const dy = otherObject.posY - this.posY;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) {
            distance = 0.01;
        }

        const unitX = dx / distance;
        const unitY = dy / distance;

        const overlap = (this.hitRadius + otherObject.hitRadius) - distance;

        if (overlap > 0) {
            this.posX -= unitX * (overlap / 2);
            this.posY -= unitY * (overlap / 2);

            otherObject.posX += unitX * (overlap / 2);
            otherObject.posY += unitY * (overlap / 2);
        }

        const speedThis = Math.sqrt(this.dx * this.dx + this.dy * this.dy) || 1.5;
        const speedOther = Math.sqrt(otherObject.dx * otherObject.dx + otherObject.dy * otherObject.dy) || 1.5;

        const reboundThis = Math.max(speedOther, 1.5);
        const reboundOther = Math.max(speedThis, 1.5);

        this.dx = -unitX * reboundThis;
        this.dy = -unitY * reboundThis;

        otherObject.dx = unitX * reboundOther;
        otherObject.dy = unitY * reboundOther;

        // Después del choque, ambos quedan lineales
        this.movementType = "linear";
        otherObject.movementType = "linear";

        // Reiniciar referencias circulares para evitar bloqueos
        this.centerX = this.posX;
        this.centerY = this.posY;

        otherObject.centerX = otherObject.posX;
        otherObject.centerY = otherObject.posY;

        // Enfriamiento para no volver a colisionar de inmediato
        this.collisionCooldown = 6;
        otherObject.collisionCooldown = 6;
    }

    keepInside(canvasWidth, canvasHeight) {
        if (this.posX - this.hitRadius < 0) {
            this.posX = this.hitRadius;
        }

        if (this.posX + this.hitRadius > canvasWidth) {
            this.posX = canvasWidth - this.hitRadius;
        }

        if (this.posY - this.hitRadius < 0) {
            this.posY = this.hitRadius;
        }

        if (this.posY + this.hitRadius > canvasHeight) {
            this.posY = canvasHeight - this.hitRadius;
        }

        this.centerX = this.posX;
        this.centerY = this.posY;
    }

    applySpeedLevel() {
        const speedLevel = getSpeedLevel();

        if (this.movementType === "up") {
            this.dy = -randomBetween(speedLevel.minY, speedLevel.maxY);
            this.dx = randomBetween(-0.8, 0.8);
        } else if (this.movementType === "down") {
            this.dy = randomBetween(speedLevel.minY, speedLevel.maxY);
            this.dx = randomBetween(-0.8, 0.8);
        } else if (this.movementType === "diagonal") {
            this.dx = randomBetween(-2.2, 2.2);
            this.dy = randomBetween(-2.2, 2.2);

            if (Math.abs(this.dx) < 0.8) {
                this.dx = this.dx < 0 ? -0.8 : 0.8;
            }

            if (Math.abs(this.dy) < 0.8) {
                this.dy = this.dy < 0 ? -0.8 : 0.8;
            }
        } else if (this.movementType === "circular") {
            this.angularSpeed = randomBetween(0.03, 0.06);
            this.orbitRadius = randomBetween(20, 45);
            this.centerDx = randomBetween(-1.5, 1.5);
            this.centerDy = randomBetween(-1.5, 1.5);
        } else if (this.movementType === "linear") {
            const speed = randomBetween(speedLevel.minY, speedLevel.maxY);
            const angle = randomBetween(0, Math.PI * 2);

            this.dx = Math.cos(angle) * speed;
            this.dy = Math.sin(angle) * speed;
        }
    }

    respawnFromRandomSide(existingObjects, canvasWidth, canvasHeight) {
        const newMovementType = getRandomMovementType();
        const newPosition = findSpawnPosition(
            this.hitRadius,
            existingObjects,
            canvasWidth,
            canvasHeight
        );

        const velocity = getVelocityByMovement(newMovementType);

        this.posX = newPosition.x;
        this.posY = newPosition.y;

        this.dx = velocity.dx;
        this.dy = velocity.dy;

        this.movementType = newMovementType;

        this.flashFrames = 0;
        this.isHovered = false;
        this.collisionCooldown = 0;

        this.angle = randomBetween(0, Math.PI * 2);
        this.angularSpeed = randomBetween(0.03, 0.06);
        this.orbitRadius = randomBetween(20, 45);

        this.centerX = this.posX;
        this.centerY = this.posY;
        this.centerDx = randomBetween(-1.2, 1.2);
        this.centerDy = randomBetween(-1.2, 1.2);
    }

    update(context, canvasWidth, canvasHeight, allObjects) {
        this.move();

        if (this.isOutOfBounds(canvasWidth, canvasHeight)) {
            this.respawnFromRandomSide(allObjects, canvasWidth, canvasHeight);
        }

        this.updateCollisionCooldown();
        this.restoreFlash();
        this.draw(context);
    }
}

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    objects.forEach(object => {
        object.keepInside(canvas.width, canvas.height);
    });
}

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function randomPosition(radius, max) {
    return Math.random() * (max - radius * 2) + radius;
}

function findSpawnPosition(hitRadius, existingObjects, canvasWidth, canvasHeight) {
    let x;
    let y;
    let validPosition = false;
    let attempts = 0;

    const spawnMargin = hitRadius + 30;
    const side = Math.floor(Math.random() * 4);

    while (!validPosition && attempts < 150) {
        attempts++;

        if (side === 0) {
            x = randomBetween(hitRadius, canvasWidth - hitRadius);
            y = -spawnMargin;
        } else if (side === 1) {
            x = canvasWidth + spawnMargin;
            y = randomBetween(hitRadius, canvasHeight - hitRadius);
        } else if (side === 2) {
            x = randomBetween(hitRadius, canvasWidth - hitRadius);
            y = canvasHeight + spawnMargin;
        } else {
            x = -spawnMargin;
            y = randomBetween(hitRadius, canvasHeight - hitRadius);
        }

        validPosition = true;

        for (let i = 0; i < existingObjects.length; i++) {
            const other = existingObjects[i];

            const dx = other.posX - x;
            const dy = other.posY - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < other.hitRadius + hitRadius + 10) {
                validPosition = false;
                break;
            }
        }
    }

    if (!validPosition) {
        x = randomBetween(hitRadius, canvasWidth - hitRadius);
        y = -spawnMargin;
    }

    return { x, y };
}

function getVelocityByMovement(movementType) {
    const speedLevel = getSpeedLevel();

    if (movementType === "up") {
        return {
            dx: randomBetween(-0.8, 0.8),
            dy: -randomBetween(speedLevel.minY, speedLevel.maxY)
        };
    }

    if (movementType === "down") {
        return {
            dx: randomBetween(-0.8, 0.8),
            dy: randomBetween(speedLevel.minY, speedLevel.maxY)
        };
    }

    if (movementType === "diagonal") {
        let dx = randomBetween(-2.2, 2.2);
        let dy = randomBetween(-2.2, 2.2);

        if (Math.abs(dx) < 0.8) {
            dx = dx < 0 ? -0.8 : 0.8;
        }

        if (Math.abs(dy) < 0.8) {
            dy = dy < 0 ? -0.8 : 0.8;
        }

        return { dx, dy };
    }

    return {
        dx: 0,
        dy: 0
    };
}

function getSpawnVelocity(side) {
    const speedLevel = getSpeedLevel();
    const mainSpeed = randomBetween(speedLevel.minY, speedLevel.maxY);
    const sideSpeed = randomBetween(-1.2, 1.2);

    if (side === 0) {
        // Arriba -> hacia abajo
        return {
            dx: sideSpeed,
            dy: mainSpeed
        };
    }

    if (side === 1) {
        // Derecha -> hacia izquierda
        return {
            dx: -mainSpeed,
            dy: sideSpeed
        };
    }

    if (side === 2) {
        // Abajo -> hacia arriba
        return {
            dx: sideSpeed,
            dy: -mainSpeed
        };
    }

    // Izquierda -> hacia derecha
    return {
        dx: mainSpeed,
        dy: sideSpeed
    };
}

function createObject(existingObjects) {
    const size = randomBetween(36, 56);
    const hitRadius = size * 0.45;
    const position = findSpawnPosition(hitRadius, existingObjects, canvas.width, canvas.height);
    const movementType = getRandomMovementType();
    const velocity = getVelocityByMovement(movementType);

    return new FallingObject(
        position.x,
        position.y,
        size,
        spriteImage,
        velocity.dy,
        velocity.dx,
        movementType
    );
}

function generateObjects(n) {
    objects = [];

    for (let i = 0; i < n; i++) {
        objects.push(createObject(objects));
    }
}

function handleObjectCollisions() {
    for (let i = 0; i < objects.length; i++) {
        for (let j = i + 1; j < objects.length; j++) {
            const objectA = objects[i];
            const objectB = objects[j];

            if (
                objectA.collisionCooldown === 0 &&
                objectB.collisionCooldown === 0 &&
                objectA.isCollidingWith(objectB)
            ) {
                objectA.flashBlue();
                objectB.flashBlue();
                objectA.bounceWith(objectB);
            }
        }
    }
}

function updateAllObjectSpeeds() {
    objects.forEach(object => {
        object.applySpeedLevel();
    });
}

function maintainObjectCount() {
    while (objects.length < TOTAL_OBJECTS) {
        const newObject = createObject(objects);
        objects.push(newObject);
    }
}

function getPointerPosition(event) {
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
    };
}

function updateHoveredObject(pointerX, pointerY) {
    hoveredObjectIndex = -1;

    objects.forEach(object => {
        object.isHovered = false;
    });

    for (let i = objects.length - 1; i >= 0; i--) {
        if (objects[i].containsPoint(pointerX, pointerY)) {
            hoveredObjectIndex = i;
            objects[i].isHovered = true;
            break;
        }
    }

    if (hoveredObjectIndex !== -1) {
        canvas.style.cursor = "url('assets/img/raqueta.png') 16 16, pointer";
    } else {
        canvas.style.cursor = "url('assets/img/raqueta.png') 16 16, auto";
    }
}

function removeHoveredObject() {
    if (hoveredObjectIndex !== -1) {
        playHitSound();

        objects.splice(hoveredObjectIndex, 1);
        eliminations++;
        hoveredObjectIndex = -1;

        updateAllObjectSpeeds();
        maintainObjectCount();
        updateHoveredObject(mouseX, mouseY);
    }
}

function drawEliminationCounter(context) {
    let mode = "Inicial";
    let bg = "rgba(59,130,246,0.85)";
    let border = "#2563eb";

    if (eliminations > 15) {
        mode = "Alta";
        bg = "rgba(239,68,68,0.9)";
        border = "#b91c1c";
    } else if (eliminations > 10) {
        mode = "Media";
        bg = "rgba(245,158,11,0.9)";
        border = "#b45309";
    }

    const paddingX = 18;

    const text1 = "Eliminaciones: " + eliminations;
    const text2 = "Modo: " + mode;

    context.save();

    context.font = "bold 18px Arial";
    const width = Math.max(
        context.measureText(text1).width,
        context.measureText(text2).width
    );

    const boxWidth = width + paddingX * 2;
    const boxHeight = 64;

    const x = canvas.width - boxWidth - 20;
    const y = 20;

    context.shadowColor = "rgba(0,0,0,0.25)";
    context.shadowBlur = 14;
    context.shadowOffsetY = 6;

    context.fillStyle = bg;
    context.strokeStyle = border;
    context.lineWidth = 2;

    if (typeof context.roundRect === "function") {
        context.beginPath();
        context.roundRect(x, y, boxWidth, boxHeight, 16);
        context.fill();
        context.stroke();
        context.closePath();
    } else {
        context.fillRect(x, y, boxWidth, boxHeight);
        context.strokeRect(x, y, boxWidth, boxHeight);
    }

    context.shadowColor = "transparent";
    context.shadowBlur = 0;
    context.shadowOffsetY = 0;

    context.fillStyle = "#ffffff";
    context.textAlign = "left";
    context.textBaseline = "middle";

    context.fillText(text1, x + paddingX, y + 24);
    context.fillText(text2, x + paddingX, y + 44);

    context.restore();
}

function drawBackground() {
    if (!(backgroundImage.complete && backgroundImage.naturalWidth > 0)) {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
    }

    const imgWidth = backgroundImage.naturalWidth;
    const imgHeight = backgroundImage.naturalHeight;

    const canvasRatio = canvas.width / canvas.height;
    const imageRatio = imgWidth / imgHeight;

    let drawWidth;
    let drawHeight;
    let offsetX;
    let offsetY;

    if (imageRatio > canvasRatio) {
        drawHeight = canvas.height;
        drawWidth = drawHeight * imageRatio;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
    } else {
        drawWidth = canvas.width;
        drawHeight = drawWidth / imageRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
    }

    ctx.drawImage(backgroundImage, offsetX, offsetY, drawWidth, drawHeight);
}

function animate() {
    drawBackground();
    handleObjectCollisions();

    objects.forEach(object => {
        object.update(ctx, canvas.width, canvas.height, objects);
    });

    drawEliminationCounter(ctx, canvas.width);

    requestAnimationFrame(animate);
}

canvas.addEventListener("pointermove", event => {
    if (!gameStarted) {
        return;
    }

    const pointer = getPointerPosition(event);
    mouseX = pointer.x;
    mouseY = pointer.y;
    updateHoveredObject(mouseX, mouseY);

});

canvas.addEventListener("pointerdown", event => {
    if (!gameStarted) {
        return;
    }

    const pointer = getPointerPosition(event);
    mouseX = pointer.x;
    mouseY = pointer.y;
    updateHoveredObject(mouseX, mouseY);
    removeHoveredObject();
});

canvas.addEventListener("mouseleave", () => {
    hoveredObjectIndex = -1;
    objects.forEach(object => {
        object.isHovered = false;
    });
    canvas.style.cursor = "default";
});

function init() {
    resizeCanvas();
    generateObjects(TOTAL_OBJECTS);
    drawBackground();
    objects.forEach(object => object.draw(ctx));
    drawEliminationCounter(ctx);
}

let loadedAssets = 0;

function assetReady() {
    loadedAssets++;
    if (loadedAssets === 2) {
        init();
    }
}

function assetError(name, path) {
    console.error(`Error cargando ${name}: ${path}`);
}

backgroundImage.onload = assetReady;
spriteImage.onload = assetReady;

backgroundImage.onerror = () => assetError("fondo", backgroundImage.src);
spriteImage.onerror = () => assetError("sprite", spriteImage.src);

window.addEventListener("resize", resizeCanvas);

function startGame() {
    if (gameStarted) {
        return;
    }

    gameStarted = true;

    bgMusic.volume = 0.15; // Volumen más bajo para destacar el efecto de la pelota
    bgMusic.play().catch(error => {
        console.error("No se pudo reproducir la música:", error);
    });

    startGameBtn.style.display = "none";

    animate();
}

startGameBtn.addEventListener("click", startGame);

function playHitSound() {
    if (!hitSound) return;

    hitSound.currentTime = 0; // reinicia para permitir múltiples clics rápidos
    hitSound.volume = 0.5;    // volumen del efecto
    hitSound.play().catch(() => {});
}

