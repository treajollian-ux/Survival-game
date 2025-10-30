// modules/resources.js
class ResourcesModule {
    constructor(game) {
        this.game = game;
        this.resourceNodes = [];
        this.respawnInterval = 30000; // 30 ثانية
        
        this.init();
    }

    init() {
        this.createInitialResources();
        this.startResourceRespawn();
        console.log('📦 وحدة الموارد جاهزة');
    }

    createInitialResources() {
        // إنشاء موارد أولية في العالم
        const resourceTypes = ['wood', 'stone', 'food'];
        
        for (let i = 0; i < 15; i++) {
            const type = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
            this.createResourceNode(
                Math.random() * 80 - 40,
                Math.random() * 80 - 40,
                type
            );
        }
    }

    createResourceNode(x, z, type) {
        const node = {
            id: this.resourceNodes.length,
            type: type,
            position: { x: x, y: 0.5, z: z },
            mesh: null,
            available: true,
            respawnTime: 0
        };

        this.createResourceMesh(node);
        this.resourceNodes.push(node);
        return node;
    }

    createResourceMesh(node) {
        let geometry, material, color, scale = 1;

        switch (node.type) {
            case 'wood':
                geometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 8);
                color = 0x8B4513; // بني
                scale = 1.5;
                break;
            case 'stone':
                geometry = new THREE.DodecahedronGeometry(0.5, 0);
                color = 0x7f8c8d; // رمادي
                break;
            case 'food':
                geometry = new THREE.SphereGeometry(0.4, 8, 6);
                color = 0xe74c3c; // أحمر
                break;
        }

        material = new THREE.MeshStandardMaterial({ color });
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(node.position.x, node.position.y, node.position.z);
        mesh.scale.set(scale, scale, scale);
        mesh.castShadow = true;
        mesh.userData = { 
            type: node.type,
            resourceId: node.id,
            available: true
        };

        this.game.scene.add(mesh);
        node.mesh = mesh;
    }

    collectResource(resourceId, playerPosition) {
        const node = this.resourceNodes.find(n => n.id === resourceId);
        
        if (!node || !node.available) return false;

        // التحقق من المسافة
        const distance = Math.sqrt(
            Math.pow(playerPosition.x - node.position.x, 2) +
            Math.pow(playerPosition.z - node.position.z, 2)
        );

        if (distance > 3) return false;

        // جمع المورد
        node.available = false;
        node.mesh.visible = false;
        node.respawnTime = Date.now() + this.respawnInterval;

        // إضافة للموارد
        this.game.gameState.resources[node.type]++;
        
        // تأثيرات
        this.game.createFloatingText(
            `+1 ${this.getResourceName(node.type)}`,
            node.mesh.position
        );
        
        // صوت الجمع
        this.playCollectSound(node.type);
        
        // تحديث الواجهة
        this.game.updateUI();

        return true;
    }

    getResourceName(type) {
        const names = {
            'wood': 'خشب',
            'stone': 'حجر', 
            'food': 'طعام'
        };
        return names[type] || type;
    }

    startResourceRespawn() {
        setInterval(() => {
            this.resourceNodes.forEach(node => {
                if (!node.available && Date.now() > node.respawnTime) {
                    node.available = true;
                    node.mesh.visible = true;
                    
                    // تأثيرات إعادة الظهور
                    node.mesh.scale.set(0.1, 0.1, 0.1);
                    gsap.to(node.mesh.scale, {
                        x: node.type === 'wood' ? 1.5 : 1,
                        y: node.type === 'wood' ? 1.5 : 1,
                        z: node.type === 'wood' ? 1.5 : 1,
                        duration: 0.5
                    });
                }
            });
        }, 1000);
    }

    playCollectSound(type) {
        // يمكن إضافة أصوات حقيقية لاحقاً
        const audio = new Audio();
        audio.volume = 0.3;
        audio.play().catch(e => console.log('لم يتم تحميل الصوت بعد'));
    }

    getNearbyResources(playerPosition, radius = 3) {
        return this.resourceNodes.filter(node => {
            if (!node.available) return false;
            
            const distance = Math.sqrt(
                Math.pow(playerPosition.x - node.position.x, 2) +
                Math.pow(playerPosition.z - node.position.z, 2)
            );
            
            return distance <= radius;
        });
    }
}

// التصدير
window.resourcesModule = new ResourcesModule(window.game);
