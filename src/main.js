
import * as THREE from 'three';

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87bce0);
scene.fog = new THREE.Fog(0x87bce0, 22, 85);

// CAMERA - FIXED
const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    150
);

camera.position.set(0, 4.8, 17);
camera.lookAt(0, 2.5, -8);

// RENDERER
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(renderer.domElement);

// LIGHTING
scene.add(new THREE.HemisphereLight(0xd9edff, 0x526b35, 2.2));

const sunlight = new THREE.DirectionalLight(0xffe2b5, 3.2);
sunlight.position.set(-10, 18, 8);
sunlight.castShadow = true;
sunlight.shadow.mapSize.set(2048, 2048);
sunlight.shadow.camera.left = -25;
sunlight.shadow.camera.right = 25;
sunlight.shadow.camera.top = 25;
sunlight.shadow.camera.bottom = -25;
scene.add(sunlight);

// SUN
const sun = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0xffedbd })
);
sun.position.set(12, 13, -35);
scene.add(sun);

// GROUND
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(150, 150),
    new THREE.MeshStandardMaterial({
        color: 0x365c2b,
        roughness: 1
    })
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.1;
ground.receiveShadow = true;
scene.add(ground);

// REALISTIC DENSE GRASS FIELD

function createGrassGeometry() {
    const vertices = [];
    const indices = [];

    const segments = 5;

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;

        const width = 0.055 * (1 - t) + 0.002;
        const height = t * 0.85;
        const bend = t * t * 0.12;

        vertices.push(-width / 2, height, bend);
        vertices.push(width / 2, height, bend);

        if (i < segments) {
            const a = i * 2;
            indices.push(
                a, a + 1, a + 2,
                a + 1, a + 3, a + 2
            );
        }
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(vertices, 3)
    );

    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
}

const grassGeometry = createGrassGeometry();

const grassMaterial = new THREE.MeshStandardMaterial({
    color: 0x57933b,
    side: THREE.DoubleSide,
    roughness: 1
});

const grassCount = 12000;

const grass = new THREE.InstancedMesh(
    grassGeometry,
    grassMaterial,
    grassCount
);

const grassDummy = new THREE.Object3D();

const grassColors = [
    new THREE.Color(0x477c30),
    new THREE.Color(0x639c3d),
    new THREE.Color(0x82a94c),
    new THREE.Color(0x386b2d),
    new THREE.Color(0x719c42)
];

for (let i = 0; i < grassCount; i++) {

    grassDummy.position.set(
        (Math.random() - 0.5) * 43,
        0,
        12 - Math.random() * 48
    );

    grassDummy.rotation.set(
        0,
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.3
    );

    const scale = 0.5 + Math.random() * 1.2;

    grassDummy.scale.set(
        scale,
        scale,
        scale
    );

    grassDummy.updateMatrix();

    grass.setMatrixAt(i, grassDummy.matrix);

    grass.setColorAt(
        i,
        grassColors[
            Math.floor(Math.random() * grassColors.length)
        ]
    );
}

grass.instanceMatrix.needsUpdate = true;

scene.add(grass);


// FLOWER COLOURS
const colors = [
    0xff79a9, // Pink
    0xffa6b9, // Light pink
    0xffffff, // White
    0xffc52e, // Yellow
    0xff963c, // Orange
    0x8888ed, // Blue-purple
    0xc18be8  // Lavender
];

const petalMaterials = colors.map(color =>
    new THREE.MeshStandardMaterial({
        color,
        roughness: 0.72,
        side: THREE.DoubleSide
    })
);

const stemMaterial = new THREE.MeshStandardMaterial({
    color: 0x347b35,
    roughness: 0.9
});

const leafMaterial = new THREE.MeshStandardMaterial({
    color: 0x438d3d,
    side: THREE.DoubleSide,
    roughness: 0.85
});

const centerMaterial = new THREE.MeshStandardMaterial({
    color: 0xe7a92b,
    roughness: 0.8
});

// NATURAL PETAL SHAPE
function createPetalGeometry(length, width) {
    const shape = new THREE.Shape();

    shape.moveTo(0, 0);
    shape.bezierCurveTo(
        -width, length * 0.2,
        -width, length * 0.8,
        0, length
    );
    shape.bezierCurveTo(
        width, length * 0.8,
        width, length * 0.2,
        0, 0
    );

    return new THREE.ShapeGeometry(shape, 12);
}

// NATURAL LEAF SHAPE
function createLeaf() {
    const shape = new THREE.Shape();

    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.25, 0.08, 0.48, 0.3, 0.65, 0.4);
    shape.bezierCurveTo(0.38, 0.42, 0.12, 0.2, 0, 0);

    return new THREE.ShapeGeometry(shape, 8);
}

const leafGeometry = createLeaf();

// FLOWERS
const flowers = [];

function createFlower(x, z) {
    const flower = new THREE.Group();

    const height = 0.9 + Math.random() * 1.15;
    const bend = (Math.random() - 0.5) * 0.2;

    // CURVED STEM
    const stemCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(bend * 0.4, height * 0.35, 0),
        new THREE.Vector3(bend, height * 0.7, 0),
        new THREE.Vector3(bend * 1.3, height, 0)
    ]);

    const stem = new THREE.Mesh(
        new THREE.TubeGeometry(stemCurve, 10, 0.025, 6, false),
        stemMaterial
    );

    flower.add(stem);

    // LEAVES
    for (let i = 0; i < 3; i++) {
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);

        leaf.position.set(
            bend * (i / 3),
            height * (0.25 + i * 0.17),
            0.01
        );

        leaf.rotation.z = i % 2 === 0 ? 0.5 : 2.5;
        leaf.scale.set(
            0.7 + Math.random() * 0.4,
            0.7 + Math.random() * 0.4,
            1
        );

        flower.add(leaf);
    }

    // FLOWER HEAD
    const head = new THREE.Group();
    head.position.set(bend * 1.3, height, 0);
    flower.add(head);

    const color = petalMaterials[
        Math.floor(Math.random() * petalMaterials.length)
    ];

    const species = Math.floor(Math.random() * 3);

    const petalCount = species === 0 ? 10 : species === 1 ? 14 : 7;
    const petalLength = species === 0 ? 0.38 : species === 1 ? 0.3 : 0.46;
    const petalWidth = species === 0 ? 0.105 : species === 1 ? 0.13 : 0.17;

    const geometry = createPetalGeometry(petalLength, petalWidth);

    // PETALS
    for (let i = 0; i < petalCount; i++) {
        const petal = new THREE.Mesh(geometry, color);

        const angle = (i / petalCount) * Math.PI * 2;

        petal.rotation.z = angle;
        petal.position.z = 0.015;

        head.add(petal);
    }

    // FLOWER CENTRE
    const center = new THREE.Mesh(
        new THREE.SphereGeometry(0.115, 16, 12),
        centerMaterial
    );

    center.position.z = 0.055;
    head.add(center);

    // TINY CENTRE DETAILS
    for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.075;

        const dot = new THREE.Mesh(
            new THREE.SphereGeometry(0.012, 5, 5),
            new THREE.MeshStandardMaterial({ color: 0x9a601c })
        );

        dot.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            0.16
        );

        head.add(dot);
    }

    flower.position.set(x, 0, z);

    const size = 0.75 + Math.random() * 0.55;
    flower.scale.setScalar(size);

    flower.userData = {
        speed: 0.5 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
        strength: 0.025 + Math.random() * 0.035
    };

    flower.traverse(object => {
        if (object.isMesh) {
            object.castShadow = false;
        }
    });

    scene.add(flower);
    flowers.push(flower);
}

// DENSE FLOWER FIELD
for (let row = 0; row < 22; row++) {
    for (let column = 0; column < 23; column++) {

        const spacing = 1.05;

        const x = (column - 11) * spacing
            + (Math.random() - 0.5) * 0.65;

        const z = 11 - row * 1.65
            + (Math.random() - 0.5) * 0.8;

        createFlower(x, z);
    }
}

 // MOVING REALISTIC CLOUDS

const clouds = [];

const cloudMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1
});

const cloudGeometry = new THREE.SphereGeometry(1, 16, 12);

for (let i = 0; i < 9; i++) {

    const cloud = new THREE.Group();

    const parts = 5 + Math.floor(Math.random() * 4);

    for (let j = 0; j < parts; j++) {

        const puff = new THREE.Mesh(
            cloudGeometry,
            cloudMaterial
        );

        puff.position.set(
            (Math.random() - 0.5) * 2.8,
            (Math.random() - 0.5) * 0.7,
            (Math.random() - 0.5) * 0.8
        );

        puff.scale.set(
            0.8 + Math.random() * 0.7,
            0.35 + Math.random() * 0.3,
            0.5 + Math.random() * 0.4
        );

        cloud.add(puff);
    }

    cloud.position.set(
        (Math.random() - 0.5) * 35,
        8 + Math.random() * 5,
        -22 - Math.random() * 25
    );

    cloud.scale.setScalar(1.1 + Math.random() * 0.8);

    cloud.userData.speed = 0.12 + Math.random() * 0.12;

    scene.add(cloud);
    clouds.push(cloud);
}

// BUTTERFLIES

const butterflies = [];

const butterflyColors = [
    0xff70ad,
    0xffd34e,
    0x9c80ff,
    0x55c9df,
    0xff9955
];

for (let i = 0; i < 12; i++) {

    const butterfly = new THREE.Group();

    const color = butterflyColors[
        Math.floor(Math.random() * butterflyColors.length)
    ];

    const wingMaterial = new THREE.MeshStandardMaterial({
        color,
        side: THREE.DoubleSide,
        roughness: 0.55
    });

    // BODY
    const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0x30251e })
    );

    body.scale.set(0.65, 2.2, 0.7);
    butterfly.add(body);

    // WINGS
    const wingGeometry = new THREE.SphereGeometry(
        0.14, 12, 10
    );

    const leftWing = new THREE.Mesh(
        wingGeometry,
        wingMaterial
    );

    leftWing.position.set(-0.12, 0.08, 0);
    leftWing.scale.set(1.2, 1.5, 0.15);

    butterfly.add(leftWing);

    const rightWing = new THREE.Mesh(
        wingGeometry,
        wingMaterial
    );

    rightWing.position.set(0.12, 0.08, 0);
    rightWing.scale.set(1.2, 1.5, 0.15);

    butterfly.add(rightWing);

    butterfly.position.set(
        (Math.random() - 0.5) * 18,
        1.5 + Math.random() * 3,
        -Math.random() * 15
    );

    butterfly.userData = {
        leftWing,
        rightWing,
        phase: Math.random() * Math.PI * 2,
        speed: 0.7 + Math.random() * 0.6,
        startX: butterfly.position.x,
        startY: butterfly.position.y,
        startZ: butterfly.position.z
    };

    scene.add(butterfly);
    butterflies.push(butterfly);
}

// WIND ANIMATION
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    flowers.forEach(flower => {
        const data = flower.userData;

        flower.rotation.z =
            Math.sin(time * data.speed + data.phase)
            * data.strength;

        flower.rotation.x =
            Math.cos(time * data.speed * 0.7 + data.phase)
            * 0.018;
    });

    renderer.render(scene, camera);
}

animate();

// RESPONSIVE
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});
