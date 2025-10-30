// modules/ui.js
class UIModule {
    constructor(game) {
        this.game = game;
        this.isInventoryOpen = false;
        this.isBuildMenuOpen = false;
        
        this.init();
    }

    init() {
        this.createUI();
        this.setupEventListeners();
        this.createMiniMap();
        console.log('🖥️ وحدة واجهة المستخدم جاهزة');
    }

    createUI() {
        // سيتم إضافة عناصر واجهة إضافية هنا
        this.createInventoryPanel();
        this.createCraftingPanel();
        this.createMissionPanel();
    }

    createInventoryPanel() {
        const inventoryHTML = `
            <div id="inventoryPanel" class="panel hidden">
                <h3>🎒 الحقيبة</h3>
                <div class="inventory-slots">
                    ${this.createInventorySlots()}
                </div>
                <button id="closeInventory" class="close-btn">✕ إغلاق</button>
            </div>
        `;
        
        document.getElementById('gameContainer').insertAdjacentHTML('beforeend', inventoryHTML);
    }

    createInventorySlots() {
        let slotsHTML = '';
        for (let i = 0; i < 20; i++) {
            slotsHTML += `<div class="inventory-slot" data-slot="${i}"></div>`;
        }
        return slotsHTML;
    }

    createCraftingPanel() {
        const craftingHTML = `
            <div id="craftingPanel" class="panel hidden">
                <h3>⚒️ الحرف</h3>
                <div class="crafting-recipes">
                    <div class="recipe" data-recipe="wall">
                        <div class="recipe-result">🧱 جدار</div>
                        <div class="recipe-cost">🪵 5 خشب</div>
                    </div>
                    <div class="recipe" data-recipe="axe">
                        <div class="recipe-result">🪓 فأس</div>
                        <div class="recipe-cost">🪵 3 خشب, 🪨 2 حجر</div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('gameContainer').insertAdjacentHTML('beforeend', craftingHTML);
    }

    createMissionPanel() {
        const missionHTML = `
            <div id="missionPanel" class="panel">
                <h3>🎯 المهام</h3>
                <div class="missions-list">
                    <div class="mission" data-mission="collectWood">
                        <span class="mission-icon">🪵</span>
                        <span class="mission-text">جمع 10 خشب</span>
                        <span class="mission-progress">(0/10)</span>
                    </div>
                    <div class="mission" data-mission="buildWalls">
                        <span class="mission-icon">🧱</span>
                        <span class="mission-text">بناء 3 جدران</span>
                        <span class="mission-progress">(0/3)</span>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('gameContainer').insertAdjacentHTML('beforeend', missionHTML);
    }

    setupEventListeners() {
        // زر الحقيبة
        document.getElementById('inventoryBtn').addEventListener('click', () => {
            this.toggleInventory();
        });

        // زر الإغلاق
        document.getElementById('closeInventory')?.addEventListener('click', () => {
            this.toggleInventory();
        });

        // وصفات الحرف
        document.querySelectorAll('.recipe').forEach(recipe => {
            recipe.addEventListener('click', () => {
                this.craftItem(recipe.dataset.recipe);
            });
        });
    }

    toggleInventory() {
        this.isInventoryOpen = !this.isInventoryOpen;
        const panel = document.getElementById('inventoryPanel');
        
        if (this.isInventoryOpen) {
            panel.classList.remove('hidden');
            this.updateInventoryDisplay();
        } else {
            panel.classList.add('hidden');
        }
    }

    updateInventoryDisplay() {
        const slots = document.querySelectorAll('.inventory-slot');
        const resources = this.game.gameState.resources;
        
        // تحديث العرض بناءً على الموارد الحالية
        slots.forEach((slot, index) => {
            slot.innerHTML = '';
            
            if (index === 0 && resources.wood > 0) {
                slot.innerHTML = `🪵 ${resources.wood}`;
            } else if (index === 1 && resources.stone > 0) {
                slot.innerHTML = `🪨 ${resources.stone}`;
            } else if (index === 2 && resources.food > 0) {
                slot.innerHTML = `🍖 ${resources.food}`;
            }
        });
    }

    craftItem(recipe) {
        const recipes = {
            'wall': { wood: 5 },
            'axe': { wood: 3, stone: 2 }
        };

        const cost = recipes[recipe];
        if (!cost) return;

        // التحقق من الموارد
        for (const [resource, amount] of Object.entries(cost)) {
            if (this.game.gameState.resources[resource] < amount) {
                this.showMessage('❌ موارد غير كافية');
                return;
            }
        }

        // خصم الموارد
        for (const [resource, amount] of Object.entries(cost)) {
            this.game.gameState.resources[resource] -= amount;
        }

        // منح العنصر المصنوع
        this.showMessage(`✅ تم صنع ${this.getRecipeName(recipe)}`);
        this.game.updateUI();
        this.updateInventoryDisplay();
    }

    getRecipeName(recipe) {
        const names = {
            'wall': 'جدار',
            'axe': 'فأس'
        };
        return names[recipe] || recipe;
    }

    showMessage(text) {
        const message = document.createElement('div');
        message.className = 'game-message';
        message.textContent = text;
        
        document.getElementById('gameContainer').appendChild(message);
        
        gsap.to(message, {
            y: -50,
            opacity: 0,
            duration: 2,
            onComplete: () => message.remove()
        });
    }

    createMiniMap() {
        const canvas = document.getElementById('mapCanvas');
        const ctx = canvas.getContext('2d');
        
        // تحديث الخريطة باستمرار
        setInterval(() => this.updateMiniMap(ctx), 100);
    }

    updateMiniMap(ctx) {
        const canvas = document.getElementById('mapCanvas');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // رسم الخلفية
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // رسم اللاعب
        if (this.game.player) {
            const playerX = (this.game.player.position.x + 50) * (canvas.width / 100);
            const playerY = (this.game.player.position.z + 50) * (canvas.height / 100);
            
            ctx.fillStyle = '#3498db';
            ctx.beginPath();
            ctx.arc(playerX, playerY, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // اتجاه اللاعب
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(playerX, playerY);
            ctx.lineTo(
                playerX + Math.sin(this.game.player.rotation.y) * 8,
                playerY + Math.cos(this.game.player.rotation.y) * 8
            );
            ctx.stroke();
        }
        
        // رسم الموارد
        if (window.resourcesModule) {
            window.resourcesModule.resourceNodes.forEach(node => {
                if (!node.available) return;
                
                const resX = (node.position.x + 50) * (canvas.width / 100);
                const resY = (node.position.z + 50) * (canvas.height / 100);
                
                ctx.fillStyle = this.getResourceColor(node.type);
                ctx.beginPath();
                ctx.arc(resX, resY, 2, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }

    getResourceColor(type) {
        const colors = {
            'wood': '#8B4513',
            'stone': '#7f8c8d', 
            'food': '#e74c3c'
        };
        return colors[type] || '#ffffff';
    }

    updateMissionProgress() {
        // تحديث تقدم المهام
        const woodMission = document.querySelector('[data-mission="collectWood"] .mission-progress');
        const wallMission = document.querySelector('[data-mission="buildWalls"] .mission-progress');
        
        if (woodMission) {
            woodMission.textContent = `(${Math.min(this.game.gameState.resources.wood, 10)}/10)`;
        }
        
        if (wallMission) {
            // يمكن تحديث بناء الجدران لاحقاً
            wallMission.textContent = '(0/3)';
        }
    }
}

window.uiModule = new UIModule(window.game);
