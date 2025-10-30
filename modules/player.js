class PlayerModule {
    constructor(game) {
        this.game = game;
        this.moveSpeed = 0.2;
        this.rotateSpeed = 0.1;
        this.joystickInput = { x: 0, y: 0 };
        
        this.init();
    }

    init() {
        console.log('🎮 وحدة اللاعب جاهزة');
    }

    setJoystickInput(x, y) {
        this.joystickInput.x = x;
        this.joystickInput.y = y;
    }

    update() {
        this.handleMovement();
        this.handleRotation();
    }

    handleMovement() {
        if (!this.game.player) return;

        let moveX = 0;
        let moveZ = 0;

        // التحكم بالسويستيك
        if (this.joystickInput.x !== 0 || this.joystickInput.y !== 0) {
            moveX = this.joystickInput.x * this.moveSpeed;
            moveZ = -this.joystickInput.y * this.moveSpeed;
        }
        // التحكم بالكيبورد
        else {
            if (this.game.keys['w'] || this.game.keys['arrowup']) {
                moveZ = -this.moveSpeed;
            }
            if (this.game.keys['s'] || this.game.keys['arrowdown']) {
                moveZ = this.moveSpeed;
            }
            if (this.game.keys['a'] || this.game.keys['arrowleft']) {
                moveX = -this.moveSpeed;
            }
            if (this.game.keys['d'] || this.game.keys['arrowright']) {
                moveX = this.moveSpeed;
            }
        }

        // تطبيق الحركة
        this.game.player.position.x += moveX;
        this.game.player.position.z += moveZ;

        // حدود الحركة
        this.game.player.position.x = Math.max(-45, Math.min(45, this.game.player.position.x));
        this.game.player.position.z = Math.max(-45, Math.min(45, this.game.player.position.z));
    }

    handleRotation() {
        if (this.joystickInput.x !== 0 || this.joystickInput.y !== 0) {
            const angle = Math.atan2(this.joystickInput.x, -this.joystickInput.y);
            this.game.player.rotation.y = angle;
        }
    }
}

// تصدير الوحدة
window.playerModule = new PlayerModule(window.game);
