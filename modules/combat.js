// modules/combat.js - نظام القتال
class CombatModule {
    constructor(game) {
        this.game = game;
        this.enemies = [];
        this.attackCooldown = false;
        this.attackRange = 2.5;
        
        this.init();
    }

    init() {
        this.spawnInitialEnemies();
        this.setupCombatControls();
        this.startEnemyBehavior();
        console.log('⚔️ وحدة القتال جاهزة');
    }

    spawnInitialEnemies() {
        for (let i = 0; i < 5; i++) {
            this.spawnEnemy(
                Math.random() * 60 - 30,
                Math.random() * 60 - 30
            );
        }
    }

    spawnEnemy(x, z) {
        const enemyGroup = new THREE.Group();
        
        // جسم العدو
        const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1.5, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xe74c3c,
            roughness: 0.8
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;

        // رأس العدو
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xc0392b 
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.1;

        enemyGroup.add(body);
        enemyGroup.add(head);
        enemyGroup.position.set(x, 1.5, z);

        const enemy = {
            id: this.enemies.length,
            mesh: enemyGroup,
            health: 30,
            maxHealth: 30,
            damage: 10,
            speed: 0.05,
            state: 'wandering', // wandering, chasing, attacking
            lastAttack: 0,
            attackCooldown: 2000 // 2 ثانية
        };

        this.game.scene.add(enemyGroup);
        this.enemies.push(enemy);

        return enemy;
    }

    setupCombatControls() {
        // زر الهجوم
        document.getElementById('actionBtn').addEventListener('click', () => {
            this.playerAttack();
        });

        // اختصار لوحة المفاتيح للهجوم
        document.addEventListener('keydown', (event) => {
            if (event.key === ' ' || event.key === 'Spacebar') {
                this.playerAttack();
            }
        });
    }

    playerAttack() {
        if (this.attackCooldown) return;

        const playerPos = this.game.player.position;
        let hitEnemy = false;

        // البحث عن أعداء في نطاق الهجوم
        this.enemies.forEach(enemy => {
            const distance = playerPos.distanceTo(enemy.mesh.position);
            
            if (distance <= this.attackRange) {
                this.damageEnemy(enemy, 15);
                hitEnemy = true;
            }
        });

        if (hitEnemy) {
            // تأثيرات الهجوم الناجح
            if (window.audioModule) {
                window.audioModule.play('attack');
            }
            
            this.game.createFloatingText('⚔️ هجوم!', playerPos, '#e74c3c');
        }

        this.startAttackCooldown();
    }

    damageEnemy(enemy, damage) {
        enemy.health -= damage;
        
        // تأثيرات التلف
        this.showDamageEffect(enemy.mesh.position, damage);
        
        if (enemy.health <= 0) {
            this.defeatEnemy(enemy);
        } else {
            // رد فعل العدو عند الإصابة
            this.enemyHitReaction(enemy);
        }
    }

    showDamageEffect(position, damage) {
        this.game.createFloatingText(`💥 ${damage}`, position, '#e74c3c');
        
        // تأثير وميض أحمر
        const originalMaterials = [];
        enemy.mesh.traverse(child => {
            if (child.isMesh) {
                originalMaterials.push(child.material);
                child.material = new THREE.MeshBasicMaterial({ 
                    color: 0xff0000 
                });
            }
        });
        
        setTimeout(() => {
            let index = 0;
            enemy.mesh.traverse(child => {
                if (child.isMesh) {
                    child.material = originalMaterials[index++];
                }
            });
        }, 200);
    }

    enemyHitReaction(enemy) {
        // تراجع بسيط
        const direction = new THREE.Vector3()
            .subVectors(enemy.mesh.position, this.game.player.position)
            .normalize();
        
        enemy.mesh.position.add(direction.multiplyScalar(0.5));
        enemy.state = 'chasing';
    }

    defeatEnemy(enemy) {
        // مكافأة اللاعب
        this.game.addXP(25);
        this.game.gameState.resources.food += 2;
        this.game.updateUI();
        
        // تأثيرات الهزيمة
        this.game.createFloatingText('🎯 هزيمة!', enemy.mesh.position, '#2ecc71');
        
        if (window.audioModule) {
            window.audioModule.play('collect');
        }
        
        // إزالة العدو
        this.game.scene.remove(enemy.mesh);
        this.enemies = this.enemies.filter(e => e.id !== enemy.id);
        
        // إعادة ظهور عدو جديد بعد فترة
        setTimeout(() => {
            this.spawnEnemy(
                Math.random() * 60 - 30,
                Math.random() * 60 - 30
            );
        }, 10000);
    }

    startAttackCooldown() {
        this.attackCooldown = true;
        setTimeout(() => {
            this.attackCooldown = false;
        }, 500); // 0.5 ثانية
    }

    startEnemyBehavior() {
        setInterval(() => {
            this.updateEnemies();
        }, 100);
    }

    updateEnemies() {
        const playerPos = this.game.player.position;
        
        this.enemies.forEach(enemy => {
            const distanceToPlayer = playerPos.distanceTo(enemy.mesh.position);
            
            switch (enemy.state) {
                case 'wandering':
                    this.wanderBehavior(enemy);
                    if (distanceToPlayer < 8) {
                        enemy.state = 'chasing';
                    }
                    break;
                    
                case 'chasing':
                    this.chaseBehavior(enemy, playerPos);
                    if (distanceToPlayer > 12) {
                        enemy.state = 'wandering';
                    } else if (distanceToPlayer <= this.attackRange) {
                        enemy.state = 'attacking';
                    }
                    break;
                    
                case 'attacking':
                    this.attackBehavior(enemy, playerPos);
                    if (distanceToPlayer > this.attackRange) {
                        enemy.state = 'chasing';
                    }
                    break;
            }
        });
    }

    wanderBehavior(enemy) {
        // حركة عشوائية
        if (Math.random() < 0.02) {
            const angle = Math.random() * Math.PI * 2;
            enemy.mesh.position.x += Math.cos(angle) * enemy.speed;
            enemy.mesh.position.z += Math.sin(angle) * enemy.speed;
            
            // البقاء ضمن الحدود
            enemy.mesh.position.x = Math.max(-45, Math.min(45, enemy.mesh.position.x));
            enemy.mesh.position.z = Math.max(-45, Math.min(45, enemy.mesh.position.z));
        }
    }

    chaseBehavior(enemy, playerPos) {
        const direction = new THREE.Vector3()
            .subVectors(playerPos, enemy.mesh.position)
            .normalize();
        
        enemy.mesh.position.add(direction.multiplyScalar(enemy.speed));
        enemy.mesh.lookAt(playerPos);
    }

    attackBehavior(enemy, playerPos) {
        const currentTime = Date.now();
        
        if (currentTime - enemy.lastAttack >= enemy.attackCooldown) {
            this.enemyAttack(enemy);
            enemy.lastAttack = currentTime;
        }
    }

    enemyAttack(enemy) {
        // إلحاق الضرر باللاعب
        this.game.gameState.health -= enemy.damage;
        this.game.updateUI();
        
        // تأثيرات
        this.game.createFloatingText(`💔 ${enemy.damage}`, this.game.player.position, '#e74c3c');
        
        if (window.audioModule) {
            window.audioModule.play('damage');
        }
        
        // اهتزاز الكاميرا
        this.cameraShake();
        
        // التحقق من هزيمة اللاعب
        if (this.game.gameState.health <= 0) {
            this.gameOver();
        }
    }

    cameraShake() {
        const originalPosition = this.game.camera.position.clone();
        
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.game.camera.position.x = originalPosition.x + (Math.random() - 0.5) * 0.5;
                this.game.camera.position.y = originalPosition.y + (Math.random() - 0.5) * 0.5;
            }, i * 50);
        }
        
        setTimeout(() => {
            this.game.camera.position.copy(originalPosition);
        }, 500);
    }

    gameOver() {
        this.game.createFloatingText('💀 Game Over', this.game.player.position, '#e74c3c');
        
        // إعادة تعيين اللعبة بعد 3 ثوان
        setTimeout(() => {
            location.reload();
        }, 3000);
    }
}

window.combatModule = new CombatModule(window.game);
