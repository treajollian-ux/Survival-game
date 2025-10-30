// المحرك الرئيسي للعبة
class SurvivalGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.buildings = [];
        this.resources = [];
        this.enemies = [];
        
        this.gameState = {
            resources: { wood: 0, stone: 0, food: 0 },
            health: 100,
            dayTime: true,
            gameTime: 12
        };
        
        this.init();
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLighting();
        this.createEnvironment();
        this.createPlayer();
        this.setupControls();
        this.setupUI();
        this.animate();
        
        console.log('🎮 لعبة Survival جاهزة!');
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // سماء زرقاء
        this.scene.fog = new THREE.Fog(0x87CEEB, 10, 50);
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 15, 10);
        this.camera.lookAt(0, 0, 0);
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('gameContainer').appendChild(this.renderer.domElement);
    }

    createLighting() {
        // إضاءة محيطة
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // إضاءة اتجاهية (شمس)
        this.sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.sunLight.position.set(50, 50, 25);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.scene.add(this.sunLight);
    }

    createEnvironment() {
        this.createGround();
        this.createTrees();
        this.createRocks();
        this.createResources();
    }

    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3a5f0b,
            roughness: 0.8,
            metalness: 0.2
        });
        
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);

        // شبكة المساعدة
        const gridHelper = new THREE.GridHelper(100, 50, 0x444444, 0x222222);
        this.scene.add(gridHelper);
    }

    createTrees() {
        for (let i = 0; i < 20; i++) {
            this.createTree(
                Math.random() * 80 - 40,
                Math.random() * 80 - 40
            );
        }
    }

    createTree(x, z) {
        // الجذع
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, 1, z);
        trunk.castShadow = true;

        // التاج
        const topGeometry = new THREE.SphereGeometry(1.5, 8, 6);
        const topMaterial = new THREE.MeshStandardMaterial({ color: 0x2ecc71 });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.set(x, 3.5, z);
        top.castShadow = true;

        this.scene.add(trunk);
        this.scene.add(top);
    }

    createRocks() {
        for (let i = 0; i < 15; i++) {
            this.createRock(
                Math.random() * 80 - 40,
                Math.random() * 80 - 40
            );
        }
    }

    createRock(x, z) {
        const rockGeometry = new THREE.DodecahedronGeometry(0.7, 0);
        const rockMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x7f8c8d,
            roughness: 0.9
        });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(x, 0.7, z);
        rock.castShadow = true;
        this.scene.add(rock);
    }

    createResources() {
        // إنشاء موارد عشوائية في العالم
        for (let i = 0; i < 10; i++) {
            this.createResource(
                Math.random() * 80 - 40,
                Math.random() * 80 - 40,
                i % 2 === 0 ? 'wood' : 'stone'
            );
        }
    }

    createResource(x, z, type) {
        let geometry, material, color;
        
        if (type === 'wood') {
            geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            color = 0x8B4513;
        } else {
            geometry = new THREE.OctahedronGeometry(0.4);
            color = 0x95a5a6;
        }
        
        material = new THREE.MeshStandardMaterial({ color });
        const resource = new THREE.Mesh(geometry, material);
        resource.position.set(x, 0.5, z);
        resource.userData = { type, collected: false };
        resource.castShadow = true;
        
        this.scene.add(resource);
        this.resources.push(resource);
    }

    createPlayer() {
        const playerGeometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
        const playerMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3498db,
            roughness: 0.7
        });
        
        this.player = new THREE.Mesh(playerGeometry, playerMaterial);
        this.player.position.set(0, 1.5, 0);
        this.player.castShadow = true;
        this.scene.add(this.player);
    }

    setupControls() {
        // سيتم تفصيل هذا في modules/player.js
        this.keys = {};
        
        document.addEventListener('keydown', (event) => {
            this.keys[event.key.toLowerCase()] = true;
        });

        document.addEventListener('keyup', (event) => {
            this.keys[event.key.toLowerCase()] = false;
        });

        // إعداد السويستيك
        this.setupJoystick();
    }

    setupJoystick() {
        const joystick = document.querySelector('.joystick');
        const joystickArea = document.getElementById('movementJoystick');
        let isTouching = false;

        joystickArea.addEventListener('touchstart', (e) => {
            isTouching = true;
            e.preventDefault();
        });

        joystickArea.addEventListener('touchmove', (e) => {
            if (!isTouching) return;
            
            const touch = e.touches[0];
            const rect = joystickArea.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = touch.clientX - centerX;
            const deltaY = touch.clientY - centerY;
            
            // تحديد حركة السويستيك
            const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), 30);
            const angle = Math.atan2(deltaY, deltaX);
            
            const joyX = Math.cos(angle) * distance;
            const joyY = Math.sin(angle) * distance;
            
            joystick.style.transform = `translate(${joyX}px, ${joyY}px)`;
            
            // إرسال بيانات الحركة للاعب
            if (window.playerModule) {
                window.playerModule.setJoystickInput(deltaX / 30, deltaY / 30);
            }
        });

        joystickArea.addEventListener('touchend', () => {
            isTouching = false;
            joystick.style.transform = 'translate(-50%, -50%)';
            if (window.playerModule) {
                window.playerModule.setJoystickInput(0, 0);
            }
        });
    }

    setupUI() {
        // أزرار التحكم
        document.getElementById('buildBtn').addEventListener('click', () => {
            this.toggleBuildMenu();
        });

        document.getElementById('actionBtn').addEventListener('click', () => {
            this.playerAction();
        });

        document.getElementById('inventoryBtn').addEventListener('click', () => {
            this.toggleInventory();
        });

        // تحديث الواجهة
        this.updateUI();
    }

    toggleBuildMenu() {
        const menu = document.getElementById('buildMenu');
        menu.classList.toggle('hidden');
    }

    playerAction() {
        // جمع الموارد أو التفاعل
        this.collectNearbyResources();
    }

    collectNearbyResources() {
        const playerPos = this.player.position;
        
        this.resources.forEach(resource => {
            if (resource.userData.collected) return;
            
            const distance = playerPos.distanceTo(resource.position);
            if (distance < 2) {
                this.collectResource(resource);
            }
        });
    }

    collectResource(resource) {
        resource.userData.collected = true;
        
        // إضافة للموارد
        this.gameState.resources[resource.userData.type]++;
        
        // تأثير مرئي
        this.createFloatingText(`+1 ${resource.userData.type === 'wood' ? 'خشب' : 'حجر'}`, resource.position);
        
        // إخفاء المورد
        resource.visible = false;
        
        // تحديث الواجهة
        this.updateUI();
    }

    createFloatingText(text, position) {
        const floatingText = document.createElement('div');
        floatingText.className = 'floating-text';
        floatingText.textContent = text;
        floatingText.style.left = '50%';
        floatingText.style.top = '50%';
        
        document.getElementById('gameContainer').appendChild(floatingText);
        
        // تحريك النص
        gsap.to(floatingText, {
            y: -100,
            opacity: 0,
            duration: 2,
            onComplete: () => {
                floatingText.remove();
            }
        });
    }

    updateUI() {
        document.getElementById('healthValue').textContent = this.gameState.health;
        document.getElementById('woodCount').textContent = this.gameState.resources.wood;
        document.getElementById('stoneCount').textContent = this.gameState.resources.stone;
        document.getElementById('foodCount').textContent = this.gameState.resources.food;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // تحديث اللاعب
        if (window.playerModule) {
            window.playerModule.update();
        }
        
        // تحديث الكاميرا
        this.updateCamera();
        
        // التصيير
        this.renderer.render(this.scene, this.camera);
    }

    updateCamera() {
        // كاميرا تتبع اللاعب
        if (this.player) {
            this.camera.position.x = this.player.position.x;
            this.camera.position.z = this.player.position.z + 15;
            this.camera.lookAt(this.player.position.x, 0, this.player.position.z);
        }
    }
}

// بدء اللعبة عند تحميل الصفحة
window.addEventListener('load', () => {
    window.game = new SurvivalGame();
});

// التعامل مع تغيير حجم النافذة
window.addEventListener('resize', () => {
    if (window.game) {
        window.game.camera.aspect = window.innerWidth / window.innerHeight;
        window.game.camera.updateProjectionMatrix();
        window.game.renderer.setSize(window.innerWidth, window.innerHeight);
    }
});
