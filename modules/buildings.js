class BuildingsModule {
    constructor(game) {
        this.game = game;
        this.buildMode = false;
        this.selectedBuilding = null;
        
        this.init();
    }

    init() {
        this.setupBuildMenu();
        console.log('🏗️ وحدة البناء جاهزة');
    }

    setupBuildMenu() {
        const buildButtons = document.querySelectorAll('.build-options button');
        
        buildButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.selectedBuilding = button.dataset.type;
                this.enterBuildMode();
            });
        });
    }

    enterBuildMode() {
        this.buildMode = true;
        document.getElementById('buildMenu').classList.add('hidden');
        
        // تغيير نص زر البناء
        document.getElementById('buildBtn').textContent = '✅';
        
        console.log(`🏗️ وضع البناء: ${this.selectedBuilding}`);
    }

    exitBuildMode() {
        this.buildMode = false;
        this.selectedBuilding = null;
        document.getElementById('buildBtn').textContent = '🔨';
    }

    placeBuilding(position) {
        if (!this.buildMode || !this.selectedBuilding) return;

        const cost = this.getBuildingCost(this.selectedBuilding);
        if (!this.canAfford(cost)) {
            this.game.createFloatingText('❌ موارد غير كافية', position);
            return;
        }

        this.deductResources(cost);
        this.createBuilding(this.selectedBuilding, position);
        this.exitBuildMode();
    }

    getBuildingCost(type) {
        const costs = {
            'wall': { wood: 5 },
            'floor': { wood: 3 },
            'door': { wood: 8 },
            'chest': { wood: 10, stone: 5 }
        };
        return costs[type] || {};
    }

    canAfford(cost) {
        for (const [resource, amount] of Object.entries(cost)) {
            if (this.game.gameState.resources[resource] < amount) {
                return false;
            }
        }
        return true;
    }

    deductResources(cost) {
        for (const [resource, amount] of Object.entries(cost)) {
            this.game.gameState.resources[resource] -= amount;
        }
        this.game.updateUI();
    }

    createBuilding(type, position) {
        let geometry, material, color;
        
        switch (type) {
            case 'wall':
                geometry = new THREE.BoxGeometry(2, 2, 0.3);
                color = 0x8B4513;
                break;
            case 'floor':
                geometry = new THREE.PlaneGeometry(2, 2);
                color = 0xA0522D;
                break;
            case 'door':
                geometry = new THREE.BoxGeometry(1.5, 2, 0.2);
                color = 0xDEB887;
                break;
            case 'chest':
                geometry = new THREE.BoxGeometry(1, 1, 1);
                color = 0xD2691E;
                break;
        }
        
        material = new THREE.MeshStandardMaterial({ color });
        const building = new THREE.Mesh(geometry, material);
        
        building.position.copy(position);
        building.position.y = type === 'floor' ? 0.01 : 1;
        
        if (type === 'floor') {
            building.rotation.x = -Math.PI / 2;
        }
        
        building.castShadow = true;
        building.receiveShadow = true;
        building.userData = { type };
        
        this.game.scene.add(building);
        this.game.buildings.push(building);
        
        this.game.createFloatingText(`✅ تم البناء`, position);
    }
}

window.buildingsModule = new BuildingsModule(window.game);
