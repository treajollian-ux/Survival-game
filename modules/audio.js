// modules/audio.js - نظام الصوت المتقدم
class AudioModule {
    constructor(game) {
        this.game = game;
        this.sounds = new Map();
        this.audioContext = null;
        this.backgroundMusic = null;
        this.isMuted = false;
        
        this.init();
    }

    async init() {
        await this.setupAudioContext();
        await this.loadSounds();
        console.log('🔊 وحدة الصوت جاهزة');
    }

    async setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // استئناف السياق الصوتي عند التفاعل
            document.addEventListener('click', () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            }, { once: true });
            
        } catch (error) {
            console.warn('⚠️ تعذر إنشاء سياق الصوت:', error);
        }
    }

    async loadSounds() {
        // إنشاء أصوات برمجياً
        this.sounds.set('collect', this.createCollectSound());
        this.sounds.set('build', this.createBuildSound());
        this.sounds.set('attack', this.createAttackSound());
        this.sounds.set('levelUp', this.createLevelUpSound());
        this.sounds.set('damage', this.createDamageSound());
    }

    createCollectSound() {
        return this.createTone(800, 300, 0.3, 'sine');
    }

    createBuildSound() {
        return this.createTone(200, 400, 0.5, 'sine');
    }

    createAttackSound() {
        return this.createTone(150, 50, 0.2, 'square');
    }

    createLevelUpSound() {
        return this.createTone(400, 600, 1.0, 'triangle');
    }

    createDamageSound() {
        return this.createTone(300, 100, 0.4, 'sawtooth');
    }

    createTone(startFreq, endFreq, duration, type) {
        return {
            startFreq,
            endFreq,
            duration,
            type,
            play: () => this.playTone(startFreq, endFreq, duration, type)
        };
    }

    playTone(startFreq, endFreq, duration, type) {
        if (!this.audioContext || this.isMuted) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    play(soundName) {
        if (this.sounds.has(soundName)) {
            this.sounds.get(soundName).play();
        }
    }

    playBackgroundMusic() {
        if (this.isMuted || this.backgroundMusic) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);

            oscillator.start();
            this.backgroundMusic = oscillator;
        } catch (error) {
            console.warn('⚠️ تعذر تشغيل الموسيقى:', error);
        }
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
            this.backgroundMusic = null;
        }
    }

    setMute(muted) {
        this.isMuted = muted;
        if (muted) {
            this.stopBackgroundMusic();
        }
    }

    setVolume(volume) {
        // يمكن تطبيق التحكم في الصوت هنا
    }
}

window.audioModule = new AudioModule(window.game);
