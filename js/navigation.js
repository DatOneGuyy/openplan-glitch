import { runRoomAnalysis } from './gemini.js';

const furnitureBrowser = document.getElementById('furnitureBrowser');
const inspirationArea = document.getElementById('inspirationArea');
const customizeArea = document.getElementById('customizeArea');
const roomPanel = document.getElementById('roomPanel');
const sidebarBtns = document.querySelectorAll('.sidebar-btn');
const sidebar = document.querySelector('.sidebar');

function closeAllTabs() {
    roomPanel.classList.remove('open');
    furnitureBrowser.classList.remove('open');
    inspirationArea.classList.remove('open');
    customizeArea.classList.remove('open');
    
    // Set 'Select' button as active as it's the default mode
    sidebarBtns.forEach(b => {
        if (b.dataset.tooltip === 'Select') b.classList.add('active');
        else b.classList.remove('active');
    });
}

export function setupNavigation() {
    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the document click listener from immediately closing
            
            // Remove active class from all buttons
            sidebarBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tooltip = btn.dataset.tooltip;

            if (tooltip === 'Room') {
                roomPanel.classList.add('open');
                furnitureBrowser.classList.remove('open');
                inspirationArea.classList.remove('open');
                customizeArea.classList.remove('open');
            } else if (tooltip === 'Add') {
                furnitureBrowser.classList.add('open');
                roomPanel.classList.remove('open');
                inspirationArea.classList.remove('open');
                customizeArea.classList.remove('open');
            } else if (tooltip === 'Inspiration') {
                inspirationArea.classList.add('open');
                roomPanel.classList.remove('open');
                furnitureBrowser.classList.remove('open');
                customizeArea.classList.remove('open');
            } else if (tooltip === 'Customize with Gemini') {
                customizeArea.classList.add('open');
                roomPanel.classList.remove('open');
                furnitureBrowser.classList.remove('open');
                inspirationArea.classList.remove('open');
                runRoomAnalysis();
            } else {
                closeAllTabs();
            }
        });
    });

    // Close tabs when clicking outside
    document.addEventListener('click', (e) => {
        const isOpen = roomPanel.classList.contains('open') || 
                       furnitureBrowser.classList.contains('open') || 
                       inspirationArea.classList.contains('open') || 
                       customizeArea.classList.contains('open');
        
        if (!isOpen) return;

        // Check if click is inside any panel or the sidebar itself
        const isOutside = !roomPanel.contains(e.target) &&
                          !furnitureBrowser.contains(e.target) &&
                          !inspirationArea.contains(e.target) &&
                          !customizeArea.contains(e.target) &&
                          !sidebar.contains(e.target);

        if (isOutside) {
            closeAllTabs();
        }
    });
}
