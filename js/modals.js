import { addToInventory } from './inventory.js';

const createFurnitureModal = document.getElementById('createFurnitureModal');
const customFurnitureFile = document.getElementById('customFurnitureFile');
const modalUploadArea = document.getElementById('modalUploadArea');
const modalPreviewContainer = document.getElementById('modalPreviewContainer');
const customFurniturePreview = document.getElementById('customFurniturePreview');
const customFurnitureTitle = document.getElementById('customFurnitureTitle');
const submitCustomFurnitureBtn = document.getElementById('submitCustomFurnitureBtn');

export function resetCustomModal() {
    if (customFurnitureFile) customFurnitureFile.value = '';
    if (customFurniturePreview) customFurniturePreview.src = '';
    if (customFurnitureTitle) {
        customFurnitureTitle.value = '';
        customFurnitureTitle.classList.remove('error');
    }
    const titleError = document.getElementById('customFurnitureTitleError');
    if (titleError) titleError.style.display = 'none';
    if (modalUploadArea) {
        modalUploadArea.style.display = 'flex';
        modalUploadArea.classList.remove('error');
    }
    const imgError = document.getElementById('customFurnitureImageError');
    if (imgError) imgError.style.display = 'none';
    if (modalPreviewContainer) modalPreviewContainer.style.display = 'none';
}

export function closeCustomModal() {
    if (createFurnitureModal) createFurnitureModal.style.display = 'none';
    resetCustomModal();
}

export function setupModals() {
    const createFurnitureBtn = document.querySelector('.create-furniture-btn');
    const closeCreateModalBtn = document.getElementById('closeCreateModalBtn');

    if (createFurnitureBtn) {
        createFurnitureBtn.addEventListener('click', () => {
            resetCustomModal();
            createFurnitureModal.style.display = 'flex';
        });
    }

    if (closeCreateModalBtn) {
        closeCreateModalBtn.addEventListener('click', closeCustomModal);
    }

    if (createFurnitureModal) {
        createFurnitureModal.addEventListener('click', (e) => {
            if (e.target === createFurnitureModal) {
                closeCustomModal();
            }
        });
    }

    if (customFurnitureFile) {
        customFurnitureFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (modalUploadArea) modalUploadArea.classList.remove('error');
            const imgError = document.getElementById('customFurnitureImageError');
            if (imgError) imgError.style.display = 'none';

            const reader = new FileReader();
            reader.onload = (event) => {
                customFurniturePreview.src = event.target.result;
                modalUploadArea.style.display = 'none';
                modalPreviewContainer.style.display = 'block';

                const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
                customFurnitureTitle.value = nameWithoutExt;
            };
            reader.readAsDataURL(file);
        });
    }

    if (submitCustomFurnitureBtn) {
        submitCustomFurnitureBtn.addEventListener('click', () => {
            const imgSrc = customFurniturePreview.src;
            const imgError = document.getElementById('customFurnitureImageError');

            if (!imgSrc || imgSrc === window.location.href) {
                if (modalUploadArea) modalUploadArea.classList.add('error');
                if (imgError) imgError.style.display = 'block';
                return;
            }

            const title = customFurnitureTitle.value.trim();
            const titleError = document.getElementById('customFurnitureTitleError');
            
            if (!title) {
                if (titleError) titleError.style.display = 'block';
                customFurnitureTitle.classList.add('error');
                return;
            }
            
            const newItem = {
                title: title,
                thumbnail: imgSrc,
                price: "$0.00",
                category: 'Custom',
                seller: 'User Upload'
            };

            addToInventory(newItem);
            closeCustomModal();
        });
    }

    if (customFurnitureTitle) {
        customFurnitureTitle.addEventListener('input', () => {
            if (customFurnitureTitle.value.trim() !== '') {
                customFurnitureTitle.classList.remove('error');
                const titleError = document.getElementById('customFurnitureTitleError');
                if (titleError) titleError.style.display = 'none';
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && createFurnitureModal && createFurnitureModal.style.display === 'flex') {
            e.preventDefault();
            if (submitCustomFurnitureBtn) submitCustomFurnitureBtn.click();
        }
    });
}
