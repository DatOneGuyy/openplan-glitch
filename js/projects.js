import { state } from './state.js';
import { updateInventoryUI } from './inventory.js';
import { drawMasks } from './masks.js';
import { showAlert, showConfirm, showPrompt, showAuthRequired } from './dialogs.js';
import { fitCanvasToScreen } from './canvas.js';

const projectsModal = document.getElementById('projectsModal');
const projectsGrid = document.getElementById('projectsGrid');
const closeProjectsModalBtn = document.getElementById('closeProjectsModalBtn');

export function initProjects() {
    if (closeProjectsModalBtn) {
        closeProjectsModalBtn.onclick = () => projectsModal.style.display = 'none';
    }

    // Close on overlay click
    if (projectsModal) {
        projectsModal.onclick = (e) => {
            if (e.target === projectsModal) projectsModal.style.display = 'none';
        };
    }
}

export async function openProjectsModal() {
    if (!state.isLoggedIn) {
        showAuthRequired('Please log in to view and manage your saved rooms.', 'My Rooms');
        return;
    }

    projectsGrid.innerHTML = '<div class="loading-spinner"></div>';
    projectsModal.style.display = 'flex';

    try {
        const response = await fetch('/api/projects/list');
        const data = await response.json();

        if (response.ok) {
            renderProjects(data.projects);
        } else {
            projectsGrid.innerHTML = `<div class="error-text">${data.error || 'Failed to load projects'}</div>`;
        }
    } catch (err) {
        projectsGrid.innerHTML = '<div class="error-text">Connection error</div>';
    }
}

function renderProjects(projects) {
    if (projects.length === 0) {
        projectsGrid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">No saved projects yet.</div>';
        return;
    }

    projectsGrid.innerHTML = '';
    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';
        // Add cache bust to ensure overwrites reflect immediately
        const thumbUrl = `${project.thumbnail}?t=${Date.now()}`;
        
        card.innerHTML = `
            <div class="project-thumbnail">
                <img src="${thumbUrl}" alt="${project.name}">
                <div class="project-overlay">
                    <button class="project-btn load-btn" data-id="${project.id}">Load</button>
                    <button class="project-btn delete-btn" data-id="${project.id}">Delete</button>
                </div>
            </div>
            <div class="project-info">
                <div class="project-name">${project.name}</div>
            </div>
        `;

        card.querySelector('.load-btn').onclick = () => handleLoadProject(project.id);
        card.querySelector('.delete-btn').onclick = () => handleDeleteProject(project.id);

        projectsGrid.appendChild(card);
    });
}

async function handleLoadProject(id) {
    try {
        const response = await fetch(`/api/projects/load/${id}`);
        const data = await response.json();

        if (response.ok) {
            // Restore State
            state.addedFurnishings = data.furnitureData;
            state.currentSessionImageBase64 = data.imageUrl;
            state.originalImageBase64 = data.imageUrl;
            state.completedIds = data.furnitureData.filter(i => i.isComplete).map(i => i.id);
            state.itemCounter = data.furnitureData.length;
            state.currentProjectName = data.name;
            state.designComplete = false;

            // Update Canvas — use Image to get real dimensions
            const canvasArea = document.querySelector('.canvas-area');
            const img = new Image();
            img.onload = () => {
                state.currentImgWidth = img.width;
                state.currentImgHeight = img.height;
                canvasArea.style.width = `${img.width}px`;
                canvasArea.style.height = `${img.height}px`;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.display = 'block';
                canvasArea.innerHTML = '';
                canvasArea.appendChild(img);
                
                fitCanvasToScreen();
                updateInventoryUI();
                drawMasks();
            };
            img.src = data.imageUrl;
            img.alt = 'Room Design';

            projectsModal.style.display = 'none';
            showAlert(`Project "${data.name}" loaded successfully!`, 'Project Loaded');
        } else {
            showAlert(data.error || 'Failed to load project', 'Error');
        }
    } catch (err) {
        showAlert('Connection error', 'Error');
    }
}

async function handleDeleteProject(id) {
    // Hide the gallery modal so the confirmation dialog is centered and clean
    projectsModal.style.display = 'none';

    if (await showConfirm('Are you sure you want to delete this project? This cannot be undone.', 'Delete Project')) {
        try {
            const response = await fetch(`/api/projects/delete/${id}`, { method: 'DELETE' });
            if (response.ok) {
                openProjectsModal(); // This will refresh and re-open the modal
            } else {
                const data = await response.json();
                showAlert(data.error || 'Delete failed', 'Error');
                openProjectsModal(); // Re-open on error too
            }
        } catch (err) {
            showAlert('Connection error', 'Error');
            openProjectsModal();
        }
    } else {
        // Re-open the modal if they cancel
        openProjectsModal();
    }
}

export async function handleSaveProject() {
    if (!state.isLoggedIn) {
        showAuthRequired('Please log in to save your room designs for later.', 'Save Room');
        return;
    }

    const canvasImg = document.querySelector('.canvas-area img');
    if (!canvasImg || !canvasImg.src) {
        showAlert('No room to save.', 'Save Error');
        return;
    }

    const name = await showPrompt('Enter a name for your project:', 'Save Project', state.currentProjectName || 'My Dream Room');
    if (!name) return;

    try {
        const response = await fetch('/api/projects/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                imageBase64: canvasImg.src,
                furnitureData: state.addedFurnishings
            })
        });

        if (response.ok) {
            state.currentProjectName = name;
            showAlert('Project saved successfully!', 'Success');
        } else {
            const data = await response.json();
            if (response.status === 401) {
                showAlert('Please login to save your projects.', 'Authentication Required');
            } else {
                showAlert(data.error || 'Save failed', 'Error');
            }
        }
    } catch (err) {
        showAlert('Connection error', 'Error');
    }
}
