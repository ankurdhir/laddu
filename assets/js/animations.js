// GSAP Animations
// Note: Ensure GSAP and ScrollTrigger are loaded via CDN in index.html

export function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Animation
    const heroTl = gsap.timeline();
    
    heroTl.from(".hero-content > *", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
    })
    .from(".hero-image", {
        x: 50,
        opacity: 0,
        duration: 1.2,
        ease: "power2.out",
    }, "-=0.8");

    // Floating Ingredients Animation (Continuous)
    gsap.to(".floating-ingredient", {
        y: -15,
        rotation: 5,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
            amount: 1.5,
            from: "random"
        }
    });

    // Section Reveals
    gsap.utils.toArray('.reveal-section').forEach(section => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                toggleActions: "play none none reverse"
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
    });
}

// Call init if window is loaded, otherwise wait
if (document.readyState === 'complete') {
    initAnimations();
} else {
    window.addEventListener('load', initAnimations);
}

