// modules/missions.js - نظام المهام المتقدم
class MissionsModule {
    constructor(game) {
        this.game = game;
        this.activeMissions = new Map();
        this.completedMissions = new Set();
        this.missionRewards = new Map();
        
        this.init();
    }

    init() {
        this.setupMissions();
        this.setupRewards();
        this.startMissionChecker();
        console.log('🎯 وحدة المهام جاهزة');
    }

    setupMissions() {
        this.activeMissions.set('collectWood', {
            id: 'collectWood',
            title: 'جمع الخشب',
            description: 'اجمع 10 قطع خشب لبناء ملجأ',
            icon: '🪵',
            type: 'collection',
            target: 'wood',
            required: 10,
            current: 0,
            reward: { xp: 50, resources: { wood: 5 } }
        });

        this.activeMissions.set('buildWalls', {
            id: 'buildWalls',
            title: 'بناء الجدران',
            description: 'ابنِ 3 جدران لحماية منطقتك',
            icon: '🧱',
            type: 'building',
            target: 'wall',
            required: 3,
            current: 0,
            reward: { xp: 100, resources: { wood: 10, stone: 5 } }
        });

        this.activeMissions.set('gatherStone', {
            id: 'gatherStone',
            title: 'جمع الحجارة',
            description: 'اجمع 15 حجراً لتحسين البناء',
            icon: '🪨',
            type: 'collection',
            target: 'stone',
            required: 15,
            current: 0,
            reward: { xp: 75, resources: { stone: 8 } }
        });
    }

    setupRewards() {
        this.missionRewards.set('xp', (amount) => {
            this.game.addXP(amount);
        });

        this.missionRewards.set('resources', (resources) => {
            Object.entries(resources).forEach(([type, amount]) => {
                this.game.gameState.resources[type] += amount;
            });
            this.game.updateUI();
        });
    }

    startMissionChecker() {
        setInterval(() => {
            this.checkMissionProgress();
        }, 2000);
    }

    checkMissionProgress() {
        this.activeMissions.forEach((mission, missionId) => {
            switch (mission.type) {
                case 'collection':
                    this.updateCollectionMission(mission);
                    break;
                case 'building':
                    this.updateBuildingMission(mission);
                    break;
            }

            this.checkMissionCompletion(mission);
        });
    }

    updateCollectionMission(mission) {
        const currentCount = this.game.gameState.resources[mission.target] || 0;
        mission.current = Math.min(currentCount, mission.required);
    }

    updateBuildingMission(mission) {
        // يمكن تحديث بناء الجدران هنا
        if (mission.target === 'wall') {
            // سيتم تحديثه من وحدة البناء
        }
    }

    checkMissionCompletion(mission) {
        if (mission.current >= mission.required && !this.completedMissions.has(mission.id)) {
            this.completeMission(mission);
        }
    }

    completeMission(mission) {
        this.completedMissions.add(mission.id);
        this.giveReward(mission.reward);
        this.showMissionComplete(mission);
        
        // إنشاء المهمة التالية
        this.createNextMission(mission.id);
    }

    giveReward(reward) {
        Object.entries(reward).forEach(([type, value]) => {
            if (this.missionRewards.has(type)) {
                this.missionRewards.get(type)(value);
            }
        });
    }

    showMissionComplete(mission) {
        this.game.createFloatingText(
            `🎉 اكتملت: ${mission.title}`,
            this.game.player.position,
            '#2ecc71'
        );

        if (window.audioModule) {
            window.audioModule.play('levelUp');
        }

        // تحديث واجهة المهام
        this.updateMissionDisplay();
    }

    createNextMission(completedMissionId) {
        const nextMissions = {
            'collectWood': 'buildWalls',
            'buildWalls': 'gatherStone',
            'gatherStone': 'collectWood' // يمكن إضافة المزيد
        };

        const nextMissionId = nextMissions[completedMissionId];
        if (nextMissionId && !this.activeMissions.has(nextMissionId)) {
            this.activeMissions.set(nextMissionId, this.createMissionTemplate(nextMissionId));
        }
    }

    createMissionTemplate(missionId) {
        const templates = {
            'collectWood': {
                id: 'collectWood',
                title: 'جمع الخشب',
                description: 'اجمع 15 قطعة خشب',
                icon: '🪵',
                type: 'collection',
                target: 'wood',
                required: 15,
                current: 0,
                reward: { xp: 75, resources: { wood: 8 } }
            }
        };
        return templates[missionId];
    }

    updateMissionDisplay() {
        const missionList = document.querySelector('.missions-list');
        if (!missionList) return;

        missionList.innerHTML = '';

        this.activeMissions.forEach(mission => {
            const missionElement = this.createMissionElement(mission);
            missionList.appendChild(missionElement);
        });
    }

    createMissionElement(mission) {
        const element = document.createElement('div');
        element.className = `mission ${this.completedMissions.has(mission.id) ? 'completed' : ''}`;
        element.dataset.mission = mission.id;

        const progress = this.completedMissions.has(mission.id) ? 
            '✅' : `(${mission.current}/${mission.required})`;

        element.innerHTML = `
            <span class="mission-icon">${mission.icon}</span>
            <span class="mission-text">${mission.title}</span>
            <span class="mission-progress">${progress}</span>
        `;

        return element;
    }

    // طرق مساعدة للوحدات الأخرى
    onResourceCollected(resourceType) {
        this.activeMissions.forEach(mission => {
            if (mission.type === 'collection' && mission.target === resourceType) {
                mission.current = Math.min(mission.current + 1, mission.required);
            }
        });
    }

    onBuildingBuilt(buildingType) {
        this.activeMissions.forEach(mission => {
            if (mission.type === 'building' && mission.target === buildingType) {
                mission.current = Math.min(mission.current + 1, mission.required);
            }
        });
    }
}

window.missionsModule = new MissionsModule(window.game);
