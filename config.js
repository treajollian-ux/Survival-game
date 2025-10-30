// config.js - الإعدادات المركزية للعبة
const GameConfig = {
    // إعدادات الرسوميات
    graphics: {
        shadows: true,
        antialias: true,
        fog: true,
        maxFPS: 60
    },

    // إعدادات اللاعب
    player: {
        moveSpeed: 0.15,
        rotateSpeed: 0.08,
        health: 100,
        stamina: 100
    },

    // إعدادات الموارد
    resources: {
        respawnTime: 45000, // 45 ثانية
        collectionRadius: 2.5,
        initialSpawn: {
            wood: 20,
            stone: 15,
            food: 10
        }
    },

    // إعدادات البناء
    building: {
        costs: {
            wall: { wood: 5 },
            floor: { wood: 3 },
            door: { wood: 8 },
            chest: { wood: 10, stone: 5 },
            tower: { wood: 20, stone: 15 }
        },
        maxBuildings: 50
    },

    // إعدادات العالم
    world: {
        size: 100,
        gridSize: 50,
        dayNightCycle: true,
        dayDuration: 300000 // 5 دقائق
    },

    // الإعدادات الصوتية
    audio: {
        volume: 0.6,
        mute: false,
        soundEffects: true,
        backgroundMusic: true
    },

    // الترجمة
    i18n: {
        language: 'ar',
        strings: {
            health: 'الصحة',
            wood: 'خشب',
            stone: 'حجر',
            food: 'طعام',
            build: 'بناء',
            collect: 'جمع',
            craft: 'حرف'
        }
    }
};

// التصدير للاستخدام العام
window.GameConfig = GameConfig;
