import { state } from './state.js';
import { updateInventoryUI } from './inventory.js';
import { drawMasks } from './masks.js';
import { showAlert, showConfirm } from './dialogs.js';
import { handleSaveProject, openProjectsModal } from './projects.js';

export function initRoomModule() {
    const createNewRoomBtn = document.getElementById('createNewRoomBtn');
    const saveRoomBtn = document.getElementById('saveRoomBtn');
    const myProjectsBtn = document.getElementById('myProjectsBtn');
    const clearItemsBtn = document.getElementById('clearItemsBtn');
    const exportRoomBtn = document.getElementById('exportRoomBtn');

    if (createNewRoomBtn) {
        createNewRoomBtn.addEventListener('click', async () => {
            if (await showConfirm('Are you sure you want to create a new room? This will clear all progress.', 'Create New Room')) {
                createNewRoom();
            }
        });
    }

    if (saveRoomBtn) {
        saveRoomBtn.addEventListener('click', async () => {
            await handleSaveProject();
        });
    }

    if (myProjectsBtn) {
        myProjectsBtn.addEventListener('click', async () => {
            await openProjectsModal();
        });
    }

    if (clearItemsBtn) {
        clearItemsBtn.addEventListener('click', async () => {
            if (await showConfirm('Are you sure you want to clear all items? The room image will be restored to its original state.', 'Clear Items')) {
                clearItems();
            }
        });
    }

    if (exportRoomBtn) {
        exportRoomBtn.addEventListener('click', async () => {
            await exportRoom();
        });
    }
}

function createNewRoom() {
    // 1. Reset State
    state.originalImageBase64 = null;
    state.currentSessionImageBase64 = null;
    state.addedFurnishings = [];
    state.completedIds = [];
    state.designComplete = false;
    state.itemCounter = 0;

    // 2. Reset UI
    const canvasArea = document.querySelector('.canvas-area');
    if (canvasArea) canvasArea.innerHTML = '';
    
    // Clear Input File value
    const fileInput = document.getElementById('room-upload');
    if (fileInput) fileInput.value = '';

    updateInventoryUI();
    drawMasks();
}

function clearItems() {
    // 1. Reset Items state
    state.addedFurnishings = [];
    state.completedIds = [];
    state.designComplete = false;
    state.itemCounter = 0;

    // 2. Revert Image
    state.currentSessionImageBase64 = state.originalImageBase64;
    
    const canvasImg = document.querySelector('.canvas-area img');
    if (canvasImg && state.originalImageBase64) {
        canvasImg.src = state.originalImageBase64;
    }

    updateInventoryUI();
    drawMasks();
}

async function exportRoom() {
    const canvasImg = document.querySelector('.canvas-area img');
    if (!canvasImg || !canvasImg.src) {
        await showAlert('No room image to export.', 'Export Error');
        return;
    }

    const link = document.createElement('a');
    link.href = canvasImg.src;
    link.download = `openplan-design-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
