/* welcome.js */

document.addEventListener('DOMContentLoaded', () => {
    const layerCircles = document.querySelector('.layer-circles');
    const layerClouds = document.querySelector('.layer-clouds');
    
    // UI Interaction handlers
    const clearBtn = document.getElementById('clearBtn');
    const exportBtn = document.getElementById('exportBtn');
    
    if (clearBtn) {
        clearBtn.onclick = () => {
            if (confirm('Are you sure you want to clear your current workspace?')) {
                window.location.href = '/'; 
            }
        };
    }
    
    if (exportBtn) {
        exportBtn.onclick = () => {
            window.location.href = '/'; // Export is a feature of the main app
        };
    }

    // Subtle Parallax Effect
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // Calculate center-relative position (-0.5 to 0.5)
        const relX = (mouseX / window.innerWidth) - 0.5;
        const relY = (mouseY / window.innerHeight) - 0.5;
        
        // Movement dampening (Subtle as requested)
        const circleFactor = 15; // Max 15px movement
        const cloudFactor = 30;  // Max 30px movement (clouds are farther/larger)
        
        if (layerCircles) {
            layerCircles.style.transform = `translate(${relX * circleFactor}px, ${relY * circleFactor}px)`;
        }
        
        if (layerClouds) {
            layerClouds.style.transform = `translate(${relX * cloudFactor}px, ${relY * cloudFactor}px)`;
        }
    });

    // Handle smooth entry animations
    const cards = document.querySelectorAll('.welcome-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });
});
