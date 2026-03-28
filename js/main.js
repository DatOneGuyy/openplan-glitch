import { initCanvas, handleImageUpload } from './canvas.js';
import { setupNavigation } from './navigation.js';
import { setupFurnitureBrowser } from './furniture.js';
import { initInventory } from './inventory.js';
import { setupModals } from './modals.js';
import { initRoomModule } from './room.js';
import { initAuth } from './auth.js';
import { initProjects } from './projects.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialization
    initAuth();
    initProjects();

    // Canvas & Image Upload
    initCanvas();
    const fileInput = document.getElementById('room-upload');
    if (fileInput) fileInput.addEventListener('change', handleImageUpload);

    // Sidebar & Navigation
    setupNavigation();

    // Furniture Browser
    setupFurnitureBrowser();

    // Inventory
    initInventory();

    // Room Module
    initRoomModule();

    // Modals
    setupModals();

    // Inspiration Category Chips Toggle (Simple local logic)
    const inspirationChips = document.querySelectorAll('.inspiration-chip');
    inspirationChips.forEach(chip => {
        chip.addEventListener('click', () => {
            chip.classList.toggle('active');
        });
    });
});
