// Initialize AOS (Animate on Scroll)
document.addEventListener('DOMContentLoaded', function() {
    // Declare AOS, gsap, ScrollTrigger, and THREE
    const AOS = window.AOS;
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    const THREE = window.THREE;

    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });

    // Initialize GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Back to top button
    const backToTopButton = document.querySelector('.back-to-top');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('active');
        } else {
            backToTopButton.classList.remove('active');
        }
    });

    backToTopButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Testimonial carousel
    const testimonials = document.querySelectorAll('.testimonial-item');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');
    let currentIndex = 0;

    function showTestimonial(index) {
        testimonials.forEach(item => {
            item.classList.remove('active');
        });
        dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        testimonials[index].classList.add('active');
        dots[index].classList.add('active');
        currentIndex = index;
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showTestimonial(index);
        });
    });

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
        showTestimonial(currentIndex);
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        showTestimonial(currentIndex);
    });

    // Auto rotate testimonials
    setInterval(() => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        showTestimonial(currentIndex);
    }, 5000);

    // Dashboard features animation
    const dashboardFeatures = document.querySelectorAll('.dashboard-feature');
    
    gsap.to('.dashboard-img', {
        scrollTrigger: {
            trigger: '.dashboard-container',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1
        },
        y: -30,
        duration: 2
    });

    dashboardFeatures.forEach((feature, index) => {
        gsap.to(feature, {
            scrollTrigger: {
                trigger: '.dashboard-container',
                start: 'top 70%',
                end: 'bottom 20%',
                toggleClass: {targets: feature, className: 'active'},
                delay: index * 0.3
            }
        });
    });

    // Initialize 3D scene
    initThreeJS();
});

// Three.js 3D scene
function initThreeJS() {
    const container = document.getElementById('hero-3d-container');
    
    if (!container) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Create a group to hold all objects
    const group = new THREE.Group();
    scene.add(group);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);
    
    // Create floating cubes
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterials = [
        new THREE.MeshPhongMaterial({ color: 0x4361ee, flatShading: true }),
        new THREE.MeshPhongMaterial({ color: 0x7209b7, flatShading: true }),
        new THREE.MeshPhongMaterial({ color: 0x4cc9f0, flatShading: true })
    ];
    
    const cubes = [];
    const cubeCount = 20;
    
    for (let i = 0; i < cubeCount; i++) {
        const size = Math.random() * 0.5 + 0.1;
        const material = cubeMaterials[Math.floor(Math.random() * cubeMaterials.length)];
        const cube = new THREE.Mesh(cubeGeometry, material);
        
        // Position cubes randomly in a sphere
        const radius = 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        cube.position.x = radius * Math.sin(phi) * Math.cos(theta);
        cube.position.y = radius * Math.sin(phi) * Math.sin(theta);
        cube.position.z = radius * Math.cos(phi);
        
        cube.scale.set(size, size, size);
        cube.rotation.x = Math.random() * Math.PI;
        cube.rotation.y = Math.random() * Math.PI;
        
        // Store animation parameters
        cube.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.01
            },
            floatSpeed: Math.random() * 0.01 + 0.005,
            floatDistance: Math.random() * 0.2 + 0.1,
            initialY: cube.position.y,
            floatOffset: Math.random() * Math.PI * 2
        };
        
        group.add(cube);
        cubes.push(cube);
    }
    
    // Create a sphere in the center
    const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x4361ee,
        emissive: 0x4361ee,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.8
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    group.add(sphere);
    
    // Create connecting lines
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.2
    });
    
    const lines = [];
    
    for (let i = 0; i < cubes.length; i++) {
        const points = [];
        points.push(new THREE.Vector3(0, 0, 0)); // Center of the sphere
        points.push(cubes[i].position.clone());
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        group.add(line);
        lines.push({
            line: line,
            cubeIndex: i
        });
    }
    
    // Position camera
    camera.position.z = 10;
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotate the entire group slowly
        group.rotation.y += 0.002;
        
        // Animate each cube
        cubes.forEach(cube => {
            // Rotate cubes
            cube.rotation.x += cube.userData.rotationSpeed.x;
            cube.rotation.y += cube.userData.rotationSpeed.y;
            cube.rotation.z += cube.userData.rotationSpeed.z;
            
            // Float cubes up and down
            const time = Date.now() * 0.001;
            cube.position.y = cube.userData.initialY + 
                Math.sin(time * cube.userData.floatSpeed + cube.userData.floatOffset) * 
                cube.userData.floatDistance;
        });
        
        // Update connecting lines
        lines.forEach(lineObj => {
            const points = [];
            points.push(new THREE.Vector3(0, 0, 0));
            points.push(cubes[lineObj.cubeIndex].position.clone());
            
            lineObj.line.geometry.dispose();
            lineObj.line.geometry = new THREE.BufferGeometry().setFromPoints(points);
        });
        
        // Pulse the sphere
        const time = Date.now() * 0.001;
        sphere.scale.set(
            1 + Math.sin(time) * 0.05,
            1 + Math.sin(time) * 0.05,
            1 + Math.sin(time) * 0.05
        );
        
        renderer.render(scene, camera);
    }
    
    animate();
}