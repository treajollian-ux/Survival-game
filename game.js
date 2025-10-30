// game.js - المحرك الرئيسي المحسن
class SurvivalGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        
        this.player = null;
        this.buildings = [];
        this.resources = [];
        this.enemies = [];
        this.particles = [];
        
        this.gameState = {
            resources: { wood: 0, stone: 0, food: 0 },
            health: 100,
            stamina: 100,
            level: 1,
            xp: 0,
            dayTime: true,
            gameTime: 12,
            score: 0,
            missions: {}
        };
        
        this.performance = {
            lastFPS: 0,
            frameCount: 0,
            lastTime: performance.now()
        };
        
        this.init();
    }

    async init() {
        try {
            await this.createScene();
            await this.createCamera();
            await this.createRenderer();
            await this.createLighting();
            await this.createEnvironment();
            await this.createPlayer();
            await this.loadModules();
            await this.setupEventListeners();
            
            this.setupPerformanceMonitoring();
            this.startGameLoop();
            
            console.log('🎮 لعبة Survival جاهزة!');
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('❌ خطأ في تحميل اللعبة:', error);
            this.showErrorMessage();
        }
    }

    async createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        
        if (GameConfig.graphics.fog) {
            this.scene.fog = new THREE.Fog(0x87CEEB, 10, 80);
        }
    }

    async createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 25, 15);
        this.camera.lookAt(0, 0, 0);
    }

    async createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: GameConfig.graphics.antialias,
            alpha: true,
            powerPreference: "high-performance"
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        if (GameConfig.graphics.shadows) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        document.getElementById('gameContainer').appendChild(this.renderer.domElement);
    }

    async createLighting() {
        // إضاءة محيطة ديناميكية
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(this.ambientLight);

        // إضاءة اتجاهية مع ظلال
        this.sunLight = new THREE.DirectionalLight(0xffebaa, 0.8);
        this.sunLight.position.set(50, 100, 25);
        this.sunLight.castShadow = true;
        
        if (GameConfig.graphics.shadows) {
            this.sunLight.shadow.mapSize.width = 2048;
            this.sunLight.shadow.mapSize.height = 2048;
            this.sunLight.shadow.camera.near = 0.5;
            this.sunLight.shadow.camera.far = 500;
            this.sunLight.shadow.camera.left = -100;
            this.sunLight.shadow.camera.right = 100;
            this.sunLight.shadow.camera.top = 100;
            this.sunLight.shadow.camera.bottom = -100;
        }
        
        this.scene.add(this.sunLight);

        // إضاءة ليلية
        this.moonLight = new THREE.DirectionalLight(0x7aa2f7, 0.3);
        this.moonLight.position.set(-50, 100, -25);
        this.moonLight.visible = false;
        this.scene.add(this.moonLight);
    }

    async createEnvironment() {
        await this.createGround();
        await this.createSkybox();
        await this.createTrees();
        await this.createRocks();
        await this.createWater();
    }

    async createGround() {
        const groundGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
        
        // إنشاء مادة أرضية ديناميكية
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3a5f0b,
            roughness: 0.8,
            metalness: 0.1
        });
        
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        
        // إضافة تفاصيل للأرضية
        const groundTexture = new THREE.MeshPhongMaterial({
            color: 0x4a6f2b,
            shininess: 0
        });
        
        this.scene.add(this.ground);

        // شبكة متقدمة
        const gridHelper = new THREE.GridHelper(100, 50, 0x444444, 0x222222);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);
    }

    async createSkybox() {
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            side: THREE.BackSide
        });
        
        this.skybox = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(this.skybox);
    }

    async createTrees() {
        const treeCount = GameConfig.resources.initialSpawn.wood;
        
        for (let i = 0; i < treeCount; i++) {
            await this.createTree(
                Math.random() * 80 - 40,
                Math.random() * 80 - 40
            );
        }
    }

    async createTree(x, z) {
        const group = new THREE.Group();
        
        // الجذع مع تفاصيل أفضل
        const trunkGeometry = new THREE.CylinderGeometry(0.4, 0.5, 3, 10);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x5D4037,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.castShadow = true;
        trunk.receiveShadow = true;

        // تاج الشجرة مع تفاصيل
        const topGeometry = new THREE.SphereGeometry(2.5, 8, 6);
        const topMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2ecc71,
            roughness: 0.8
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 2.5;
        top.castShadow = true;

        group.add(trunk);
        group.add(top);
        group.position.set(x, 0, z);
        
        group.userData = {
            type: 'tree',
            health: 3,
            resourceType: 'wood'
        };

        this.scene.add(group);
        this.resources.push(group);
    }

    async createRocks() {
        const rockCount = GameConfig.resources.initialSpawn.stone;
        
        for (let i = 0; i < rockCount; i++) {
            await this.createRock(
                Math.random() * 80 - 40,
                Math.random() * 80 - 40
            );
        }
    }

    async createRock(x, z) {
        const geometry = new THREE.DodecahedronGeometry(1.2, 1);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x7f8c8d,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const rock = new THREE.Mesh(geometry, material);
        rock.position.set(x, 1.2, z);
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        
        rock.userData = {
            type: 'rock',
            health: 2,
            resourceType: 'stone'
        };

        this.scene.add(rock);
        this.resources.push(rock);
    }

    async createWater() {
        const waterGeometry = new THREE.PlaneGeometry(30, 30);
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x0077be,
            transparent: true,
            opacity: 0.8,
            roughness: 0.2,
            metalness: 0.8
        });
        
        this.water = new THREE.Mesh(waterGeometry, waterMaterial);
        this.water.rotation.x = -Math.PI / 2;
        this.water.position.set(35, 0.1, 35);
        this.scene.add(this.water);
    }

    async createPlayer() {
        const group = new THREE.Group();
        
        // جسم اللاعب
        const bodyGeometry = new THREE.CapsuleGeometry(0.6, 1.8, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3498db,
            roughness: 0.7,
            metalness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;

        // رأس اللاعب
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFAD6A5,
            roughness: 0.8
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.2;

        group.add(body);
        group.add(head);
        group.position.set(0, 1, 0);
        
        this.player = group;
        this.scene.add(this.player);

        // مؤشر اتجاه اللاعب
        const directionArrow = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, -1),
            new THREE.Vector3(0, 0, 0),
            1.5,
            0xff4444
        );
        this.player.add(directionArrow);
    }

    async loadModules() {
        // تحميل الوحدات بشكل ديناميكي
        const modules = [
            'player.js',
            'buildings.js', 
            'resources.js',
            'ui.js',
            'missions.js',
            'combat.js',
            'audio.js'
        ];

        for (const module of modules) {
            try {
                await this.loadModule(module);
            } catch (error) {
                console.warn(`⚠️ لم يتم تحميل الوحدة: ${module}`, error);
            }
        }
    }

    async loadModule(modulePath) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `modules/${modulePath}`;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    setupEventListeners() {
        // إدارة أحجام النوافذ
        window.addEventListener('resize', () => this.onWindowResize(), false);
        
        // منع السلوك الافتراضي في الجوال
        document.addEventListener('touchmove', (e) => {
            if (e.target.classList.contains('joystick-area')) {
                e.preventDefault();
            }
        }, { passive: false });

        // إدارة الذاكرة
        window.addEventListener('beforeunload', () => this.cleanup());
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    setupPerformanceMonitoring() {
        setInterval(() => {
            const currentTime = performance.now();
            const deltaTime = currentTime - this.performance.lastTime;
            
            if (deltaTime > 1000) {
                this.performance.lastFPS = Math.round(
                    (this.performance.frameCount * 1000) / deltaTime
                );
                this.performance.frameCount = 0;
                this.performance.lastTime = currentTime;
                
                // تحديث عرض الـ FPS إذا كان في وضع التطوير
                if (window.DEV_MODE) {
                    this.updateFPSDisplay();
                }
            }
        }, 1000);
    }

    updateFPSDisplay() {
        let fpsDisplay = document.getElementById('fpsDisplay');
        if (!fpsDisplay) {
            fpsDisplay = document.createElement('div');
            fpsDisplay.id = 'fpsDisplay';
            fpsDisplay.style.cssText = `
                position: fixed;
                top: 10px;
                left: 10px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                font-family: monospace;
                z-index: 10000;
            `;
            document.body.appendChild(fpsDisplay);
        }
        fpsDisplay.textContent = `FPS: ${this.performance.lastFPS}`;
    }

    startGameLoop() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            const deltaTime = this.clock.getDelta();
            
            this.update(deltaTime);
            this.render();
            this.performance.frameCount++;
        };
        
        animate();
    }

    update(deltaTime) {
        // تحديث الوحدات النشطة
        if (window.playerModule) window.playerModule.update(deltaTime);
        if (window.resourcesModule) window.resourcesModule.update(deltaTime);
        if (window.uiModule) window.uiModule.update(deltaTime);
        
        // تحديث البيئة
        this.updateEnvironment(deltaTime);
        this.updateCamera();
        
        // تحديث الأداء
        this.updatePerformance();
    }

    updateEnvironment(deltaTime) {
        // تحديث دورة النهار/الليل
        if (GameConfig.world.dayNightCycle) {
            this.updateDayNightCycle(deltaTime);
        }
        
        // تحريك الماء
        if (this.water) {
            this.water.rotation.z += deltaTime * 0.1;
        }
    }

    updateDayNightCycle(deltaTime) {
        this.gameState.gameTime += deltaTime * 0.02; // تسريع الوقت للعبة
        
        if (this.gameState.gameTime >= 24) {
            this.gameState.gameTime = 0;
        }
        
        const isDay = this.gameState.gameTime > 6 && this.gameState.gameTime < 18;
        
        if (isDay !== this.gameState.dayTime) {
            this.gameState.dayTime = isDay;
            this.transitionLighting();
        }
        
        this.updateSunPosition();
    }

    transitionLighting() {
        if (this.gameState.dayTime) {
            // انتقال إلى النهار
            gsap.to(this.sunLight, { intensity: 0.8, duration: 2 });
            gsap.to(this.moonLight, { intensity: 0, duration: 2 });
            gsap.to(this.scene.fog, { color: 0x87CEEB, duration: 2 });
        } else {
            // انتقال إلى الليل
            gsap.to(this.sunLight, { intensity: 0.1, duration: 2 });
            gsap.to(this.moonLight, { intensity: 0.3, duration: 2 });
            gsap.to(this.scene.fog, { color: 0x2c3e50, duration: 2 });
        }
    }

    updateSunPosition() {
        const time = this.gameState.gameTime;
        const sunAngle = (time / 24) * Math.PI * 2 - Math.PI / 2;
        
        const radius = 100;
        this.sunLight.position.x = Math.cos(sunAngle) * radius;
        this.sunLight.position.y = Math.max(10, Math.sin(sunAngle) * radius);
        this.sunLight.position.z = Math.sin(sunAngle) * radius;
        
        this.sunLight.lookAt(0, 0, 0);
    }

    updateCamera() {
        if (this.player) {
            const playerPos = this.player.position;
            const cameraOffset = new THREE.Vector3(0, 15, 15);
            
            this.camera.position.lerp(
                new THREE.Vector3(
                    playerPos.x + cameraOffset.x,
                    playerPos.y + cameraOffset.y, 
                    playerPos.z + cameraOffset.z
                ),
                0.1
            );
            
            this.camera.lookAt(playerPos.x, playerPos.y + 2, playerPos.z);
        }
    }

    updatePerformance() {
        // تنظيف الذاكرة بشكل دوري
        if (this.performance.frameCount % 300 === 0) {
            this.cleanupMemory();
        }
    }

    cleanupMemory() {
        // تنظيف الكائنات المحذوفة
        this.resources = this.resources.filter(resource => 
            resource.parent !== null
        );
        
        this.buildings = this.buildings.filter(building => 
            building.parent !== null
        );
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    cleanup() {
        // تنظيف الذاكرة قبل إغلاق اللعبة
        this.scene.traverse(object => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        
        this.renderer.dispose();
    }

    showWelcomeMessage() {
        this.createFloatingText('🎮 مرحباً في لعبة Survival!', this.player.position);
        
        setTimeout(() => {
            this.createFloatingText('استخدم السويستيك للتحرك', this.player.position);
        }, 2000);
    }

    showErrorMessage() {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255,0,0,0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 10000;
            font-family: Arial;
        `;
        errorDiv.innerHTML = `
            <h3>❌ خطأ في تحميل اللعبة</h3>
            <p>حدث خطأ أثناء تحميل اللعبة. يرجى تحديث الصفحة.</p>
            <button onclick="location.reload()" style="
                background: white;
                color: red;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            ">إعادة تحميل</button>
        `;
        document.body.appendChild(errorDiv);
    }

    createFloatingText(text, position, color = '#f1c40f') {
        const floatingText = document.createElement('div');
        floatingText.className = 'floating-text';
        floatingText.textContent = text;
        floatingText.style.color = color;
        
        const screenPosition = this.worldToScreen(position);
        floatingText.style.left = screenPosition.x + 'px';
        floatingText.style.top = screenPosition.y + 'px';
        
        document.getElementById('gameContainer').appendChild(floatingText);
        
        gsap.to(floatingText, {
            y: -100,
            opacity: 0,
            duration: 3,
            ease: "power2.out",
            onComplete: () => floatingText.remove()
        });
    }

    worldToScreen(worldPosition) {
        const vector = worldPosition.clone();
        vector.project(this.camera);
        
        return {
            x: (vector.x * 0.5 + 0.5) * window.innerWidth,
            y: (-(vector.y * 0.5 - 0.5)) * window.innerHeight
        };
    }

    // طرق مساعدة للوحدات الأخرى
    addXP(amount) {
        this.gameState.xp += amount;
        const xpNeeded = this.gameState.level * 100;
        
        if (this.gameState.xp >= xpNeeded) {
            this.levelUp();
        }
        
        if (window.uiModule) {
            window.uiModule.updateXPDisplay();
        }
    }

    levelUp() {
        this.gameState.level++;
        this.gameState.xp = 0;
        this.gameState.health = 100;
        this.gameState.stamina = 100;
        
        this.createFloatingText(`🎉 مستوى جديد! ${this.gameState.level}`, this.player.position, '#9b59b6');
        
        if (window.audioModule) {
            window.audioModule.playLevelUp();
        }
    }
}

// بدء اللعبة عند تحميل الصفحة
window.addEventListener('load', () => {
    // وضع التطوير
    window.DEV_MODE = window.location.hostname === 'localhost';
    
    // تهيئة اللعبة
    window.game = new SurvivalGame();
});

// منع سلوك السحب الافتراضي في الجوال
document.addEventListener('touchstart', (e) => {
    if (e.target.classList.contains('joystick-area')) {
        e.preventDefault();
    }
});

// إدارة حالة الرؤية للصفحة
document.addEventListener('visibilitychange', () => {
    if (window.game && document.hidden) {
        // توفير الموارد عندما الصفحة غير مرئية
        window.game.renderer.setAnimationLoop(null);
    } else if (window.game) {
        // استئناف اللعبة
        window.game.startGameLoop();
    }
});
