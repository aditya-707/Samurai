// Wait for DOM content to load
document.addEventListener("DOMContentLoaded", () => {
    // Initialize components
    initLoader();
    initNavigation();
    initAudioPlayer();
    initThreeJS();
    initAnimations();
});

// Loader
function initLoader() {
    const loader = document.querySelector('.loader');
    
    // Hide loader after content is loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            gsap.to(loader, {
                opacity: 0,
                duration: 1,
                onComplete: () => {
                    loader.classList.add('hidden');
                }
            });
        }, 1500); // Show loader for at least 1.5 seconds for the animation to be seen
    });
}

// Navigation
function initNavigation() {
    const header = document.querySelector('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links a');
    
    // Toggle mobile menu
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Close mobile menu when a link is clicked
    links.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
    // Change header background on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Smooth scroll to sections
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Audio Player
function initAudioPlayer() {
    const audioPlayer = document.querySelector('.audio-player');
    const audioToggle = document.querySelector('.audio-toggle');
    const audio = document.getElementById('bg-audio');
    const volumeSlider = document.querySelector('.volume-slider');
    
    let isPlaying = false;
    
    // Toggle audio player expansion
    audioToggle.addEventListener('click', () => {
        audioPlayer.classList.toggle('expanded');
        
        // Toggle play/pause
        if (!isPlaying) {
            audio.play();
            audioToggle.innerHTML = '<i class="fas fa-pause"></i>';
            isPlaying = true;
        } else {
            audio.pause();
            audioToggle.innerHTML = '<i class="fas fa-music"></i>';
            isPlaying = false;
        }
    });
    
    // Volume control
    volumeSlider.addEventListener('input', () => {
        audio.volume = volumeSlider.value / 100;
    });
}

// Three.js Scene
function initThreeJS() {
    // Set up Three.js scene
    const container = document.getElementById('model-canvas');
    
    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // Add directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Add spotlight from front
    const spotLight = new THREE.SpotLight(0xd4af37, 1);
    spotLight.position.set(0, 5, 10);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.1;
    spotLight.decay = 2;
    spotLight.distance = 50;
    spotLight.castShadow = true;
    scene.add(spotLight);
    
    // Add controls for model interaction
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 1.5;
    
    // Load 3D model
    const loader = new THREE.GLTFLoader();
    let samuraiModel;
    
    loader.load(
        'assets/samurai.glb',
        (gltf) => {
            samuraiModel = gltf.scene;
            samuraiModel.position.set(0, -1, 0);
            samuraiModel.scale.set(1.5, 1.5, 1.5);
            
            // Apply materials, if needed
            samuraiModel.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            
            scene.add(samuraiModel);
            
            // Add entrance animation
            gsap.from(samuraiModel.rotation, {
                y: Math.PI * 2,
                duration: 2,
                ease: "power2.out"
            });
            
            gsap.from(samuraiModel.position, {
                y: -5,
                duration: 1.5,
                ease: "bounce.out"
            });
        },
        (xhr) => {
            // Show loading progress if needed
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
            console.error('An error occurred loading the 3D model:', error);
            
            // Create a fallback if model can't be loaded
            const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
            const material = new THREE.MeshStandardMaterial({ 
                color: 0xd4af37,
                metalness: 0.7,
                roughness: 0.3
            });
            const torusKnot = new THREE.Mesh(geometry, material);
            torusKnot.castShadow = true;
            scene.add(torusKnot);
            
            // Animate the fallback
            const animate = () => {
                torusKnot.rotation.x += 0.01;
                torusKnot.rotation.y += 0.02;
                requestAnimationFrame(animate);
            };
            animate();
        }
    );
    
    // Add environment map
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const environmentMap = cubeTextureLoader.load([
        'assets/envmap/px.jpg',
        'assets/envmap/nx.jpg',
        'assets/envmap/py.jpg',
        'assets/envmap/ny.jpg',
        'assets/envmap/pz.jpg',
        'assets/envmap/nz.jpg'
    ], () => {}, () => {
        // Fallback if environment map can't be loaded
        scene.background = new THREE.Color(0x0a0a0a);
    });
    
    scene.environment = environmentMap;
    
    // Add particle effects
    const particles = new THREE.Group();
    scene.add(particles);
    
    const particleCount = 100;
    const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({
        color: 0xd4af37,
        transparent: true,
        opacity: 0.6
    });
    
    for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        // Distribute particles randomly in a sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 3 + Math.random() * 2;
        
        particle.position.x = radius * Math.sin(phi) * Math.cos(theta);
        particle.position.y = radius * Math.sin(phi) * Math.sin(theta);
        particle.position.z = radius * Math.cos(phi);
        
        // Store original position for animation
        particle.userData = {
            originalPosition: particle.position.clone(),
            speed: 0.001 + Math.random() * 0.003
        };
        
        particles.add(particle);
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        // Update camera
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        
        // Update renderer
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    // Render loop
    const animate = () => {
        requestAnimationFrame(animate);
        
        // Rotate model if it exists
        if (samuraiModel) {
            samuraiModel.rotation.y += 0.003;
        }
        
        // Animate particles
        particles.children.forEach(particle => {
            const originalPosition = particle.userData.originalPosition;
            const speed = particle.userData.speed;
            
            particle.position.x = originalPosition.x + Math.sin(Date.now() * speed) * 0.2;
            particle.position.y = originalPosition.y + Math.cos(Date.now() * speed) * 0.2;
            particle.position.z = originalPosition.z + Math.sin(Date.now() * speed * 0.5) * 0.2;
        });
        
        controls.update();
        renderer.render(scene, camera);
    };
    
    animate();
}

// GSAP Animations and ScrollReveal
function initAnimations() {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    
    // Hero section animations
    gsap.from('.hero h1', {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 1.8
    });
    
    gsap.from('.hero p', {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 2
    });
    
    gsap.from('.cta-button', {
        y: 20,
        opacity: 0,
        duration: 1,
        delay: 2.2
    });
    
    // Text box animations
    gsap.from('.text-box h2', {
        scrollTrigger: {
            trigger: '.text-box',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        x: -50,
        opacity: 0,
        duration: 0.8
    });
    
    gsap.from('.text-box p', {
        scrollTrigger: {
            trigger: '.text-box',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2
    });
    
    // Timeline animations with ScrollReveal
    const sr = ScrollReveal({
        origin: 'bottom',
        distance: '50px',
        duration: 1000,
        delay: 200,
        easing: 'cubic-bezier(0.5, 0, 0, 1)',
        reset: false
    });
    
    // Reveal timeline items with a stagger effect
    sr.reveal('.timeline-section h2', {
        origin: 'top',
        distance: '20px'
    });
    
    sr.reveal('.timeline-item:nth-child(odd)', {
        origin: 'left',
        interval: 200
    });
    
    sr.reveal('.timeline-item:nth-child(even)', {
        origin: 'right',
        interval: 200
    });
    
    // Footer animations
    sr.reveal('.footer-logo, .footer-links, .social-links, .copyright', {
        interval: 200
    });
    
    // Logo SVG animation
    const logoSVG = document.querySelectorAll('.logo svg path');
    gsap.from(logoSVG, {
        duration: 1.5,
        delay: 2.5,
        stagger: 0.2,
        drawSVG: 0,
        ease: "power2.inOut"
    });
    
    // Smooth scroll trigger for each section
    gsap.utils.toArray('section').forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 80%',
            onEnter: () => section.classList.add('active')
        });
    });
    
    // Parallax effect for hero section
    gsap.to('.hero', {
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        },
        y: 150,
        ease: 'none'
    });
    
    // Custom cursor with trailing effect (optional)
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: rgba(212, 175, 55, 0.5);
        pointer-events: none;
        transform: translate(-50%, -50%);
        z-index: 9999;
        mix-blend-mode: difference;
        transition: transform 0.1s, width 0.3s, height 0.3s;
    `;
    document.body.appendChild(cursor);
    
    const cursorTrail = document.createElement('div');
    cursorTrail.className = 'cursor-trail';
    cursorTrail.style.cssText = `
        position: fixed;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 1px solid rgba(212, 175, 55, 0.3);
        pointer-events: none;
        transform: translate(-50%, -50%);
        z-index: 9998;
        transition: 0.15s;
    `;
    document.body.appendChild(cursorTrail);
    
    // Update cursor position on mouse move
    document.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1
        });
        
        gsap.to(cursorTrail, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.3
        });
    });
    
    // Change cursor size on hover over links and buttons
    const interactiveElements = document.querySelectorAll('a, button, .menu-toggle');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            gsap.to(cursor, {
                width: 10,
                height: 10,
                duration: 0.3
            });
            
            gsap.to(cursorTrail, {
                width: 60,
                height: 60,
                border: '1px solid rgba(212, 175, 55, 0.8)',
                duration: 0.3
            });
        });
        
        el.addEventListener('mouseleave', () => {
            gsap.to(cursor, {
                width: 20,
                height: 20,
                duration: 0.3
            });
            
            gsap.to(cursorTrail, {
                width: 40,
                height: 40,
                border: '1px solid rgba(212, 175, 55, 0.3)',
                duration: 0.3
            });
        });
    });
    
    // Create SVG decorative elements
    createDecorativeSVG();
}

// Create decorative SVG elements
function createDecorativeSVG() {
    const svgNamespace = "http://www.w3.org/2000/svg";
    
    // Create decorative corner for timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach(item => {
        const svg = document.createElementNS(svgNamespace, "svg");
        svg.setAttribute("viewBox", "0 0 30 30");
        svg.style.cssText = `
            position: absolute;
            top: 0;
            right: 0;
            width: 30px;
            height: 30px;
            pointer-events: none;
        `;
        
        const path = document.createElementNS(svgNamespace, "path");
        path.setAttribute("d", "M0,0 L30,0 L30,30 Z");
        path.setAttribute("fill", "#9c0e0e");
        
        svg.appendChild(path);
        item.style.position = "relative";
        item.style.overflow = "hidden";
        item.appendChild(svg);
    });
    
    // Create katana divider for sections
    const sections = document.querySelectorAll('.timeline-section');
    
    sections.forEach(section => {
        if (section.id !== 'history') { // Skip first section
            const divider = document.createElement('div');
            divider.className = 'section-divider';
            divider.style.cssText = `
                position: relative;
                height: 60px;
                margin-top: -20px;
                margin-bottom: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            const svg = document.createElementNS(svgNamespace, "svg");
            svg.setAttribute("viewBox", "0 0 300 20");
            svg.style.cssText = `
                width: 80%;
                max-width: 800px;
            `;
            
            // Draw katana
            const katana = document.createElementNS(svgNamespace, "path");
            katana.setAttribute("d", "M50,10 L250,10 M30,10 L50,10 C50,10 55,5 60,10 C65,15 70,5 75,10 L250,10 M250,10 L260,5 M250,10 L260,15");
            katana.setAttribute("stroke", "#d4af37");
            katana.setAttribute("stroke-width", "2");
            katana.setAttribute("fill", "none");
            
            svg.appendChild(katana);
            divider.appendChild(svg);
            
            // Insert before the section
            section.parentNode.insertBefore(divider, section);
            
            // Animate with GSAP
            gsap.from(katana, {
                scrollTrigger: {
                    trigger: divider,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                },
                drawSVG: "0%",
                duration: 1.5,
                ease: "power2.inOut"
            });
        }
    });
}