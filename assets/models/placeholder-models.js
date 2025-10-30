// نماذج بديلة يتم إنشاؤها برمجياً
class ModelGenerator {
    static generateTree() {
        const group = new THREE.Group();
        
        // جذع
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        
        // تاج الشجرة
        const topGeometry = new THREE.SphereGeometry(1.5, 8, 6);
        const topMaterial = new THREE.MeshStandardMaterial({ color: 0x2ecc71 });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 2;
        
        group.add(trunk);
        group.add(top);
        
        return group;
    }

    static generateRock() {
        const geometry = new THREE.DodecahedronGeometry(1, 1);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x7f8c8d,
            roughness: 0.9
        });
        return new THREE.Mesh(geometry, material);
    }

    static generateCharacter() {
        const group = new THREE.Group();
        
        // الجسم
        const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1.5, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3498db });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        
        // الرأس
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFAD6A5 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.1;
        
        group.add(body);
        group.add(head);
        
        return group;
    }

    static generateWall() {
        const geometry = new THREE.BoxGeometry(2, 2, 0.3);
        const material = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        return new THREE.Mesh(geometry, material);
    }
}

window.ModelGenerator = ModelGenerator;
