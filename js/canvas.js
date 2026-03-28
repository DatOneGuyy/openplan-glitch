// canvas.js
import { state } from './state.js';
import { runRoomAnalysis } from './gemini.js';
import { initMasks, drawMasks } from './masks.js';
import { updateInventoryUI } from './inventory.js';

const canvasArea = document.querySelector('.canvas-area');
const workspace = document.querySelector('.workspace');

export function fitCanvasToScreen() {
    if (!state.currentImgWidth || !state.currentImgHeight) return;
    
    // Use requestAnimationFrame to ensure the workspace layout is fully calculated 
    // (e.g., after sidebar animations or initial render)
    requestAnimationFrame(() => {
        const padding = 40;
        const availableWidth = workspace.clientWidth - padding * 2;
        const availableHeight = workspace.clientHeight - padding * 2;
        
        const scaleX = availableWidth / state.currentImgWidth;
        const scaleY = availableHeight / state.currentImgHeight;
        
        // Scale to fit, but don't upscale infinitely if the image is tiny
        const scale = Math.min(scaleX, scaleY);
        
        canvasArea.style.transform = `scale(${scale})`;
        canvasArea.style.transformOrigin = 'center center';
        
        // Ensure flexbox centers the scaled item correctly
        canvasArea.style.position = 'absolute';
    });
}

export function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            // Clear current canvas area
            canvasArea.innerHTML = '';
            
            // Set canvas area dimensions to exactly match the image
            state.currentImgWidth = img.width;
            state.currentImgHeight = img.height;
            
            canvasArea.style.width = `${state.currentImgWidth}px`;
            canvasArea.style.height = `${state.currentImgHeight}px`;
            
            // Add image to canvas area
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.display = 'block';
            img.style.borderRadius = 'inherit'; 
            img.style.backgroundColor = 'white';
            
            canvasArea.appendChild(img);
            
            // Store original and current session base64
            state.originalImageBase64 = event.target.result;
            state.currentSessionImageBase64 = event.target.result;
            state.designComplete = false;
            state.addedFurnishings.forEach(item => item.completed = false);
            state.completedIds = [];
            
            // Detach listener so subsequent AI updates don't trigger a reset
            img.onload = null;
            
            // Apply the initial scale limit
            fitCanvasToScreen();

            // Initialize/Sync Masks
            initMasks();
            drawMasks();
            updateInventoryUI();

            // If Customize tab is open, trigger analysis automatically
            const customizeArea = document.getElementById('customizeArea');
            if (customizeArea && customizeArea.classList.contains('open')) {
                runRoomAnalysis();
            }
        };
        img.src = event.target.result;
        img.alt = "Uploaded Room";
    };
    
    reader.readAsDataURL(file);
}

// Initial setup for the workspace
export function initCanvas() {
    workspace.style.overflow = 'hidden';
    window.addEventListener('resize', fitCanvasToScreen);
}
