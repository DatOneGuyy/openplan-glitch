import { state } from './state.js';
import { drawMasks, hideMaskOverlay, showMaskOverlay } from './masks.js';

const inventoryList = document.getElementById('inventoryList');
const emptyInventoryState = document.getElementById('emptyInventoryState');
const inventorySubtitle = document.querySelector('.inventory-subtitle');

export function updateInventoryUI() {
    if (!inventoryList || !emptyInventoryState || !inventorySubtitle) return;

    const count = state.addedFurnishings.length;
    inventorySubtitle.textContent = `${count} ${count === 1 ? 'item' : 'items'} in room`;

    if (state.addedFurnishings.length > 0) {
        emptyInventoryState.style.display = 'none';
        inventoryList.style.display = 'flex';
        inventoryList.innerHTML = '';

        state.addedFurnishings.forEach((item, index) => {
            const isFinished = item.completed === true || state.completedIds.includes(item.id);
            const row = document.createElement('div');
            row.className = 'inventory-item';
            if (isFinished) row.style.backgroundColor = 'var(--primary-blue-light)';

            const thumb = document.createElement('img');
            thumb.className = 'inventory-item-thumbnail';
            thumb.src = item.thumbnail || 'https://via.placeholder.com/200';

            const indexBadge = document.createElement('div');
            indexBadge.className = 'inventory-item-index';
            indexBadge.style.backgroundColor = item.color || 'var(--primary-blue)';

            if (isFinished) {
                indexBadge.classList.add('checked');
                indexBadge.innerHTML = `<img src="/icons/check.svg" style="width: 12px; height: 12px; filter: brightness(0) invert(1);">`;
            } else {
                indexBadge.textContent = index + 1;
            }

            const title = document.createElement('div');
            title.className = 'inventory-item-title';
            title.textContent = item.title;
            title.title = item.title;

            const delBtn = document.createElement('button');
            delBtn.className = 'inventory-item-delete';
            delBtn.title = 'Remove item';
            delBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

            row.appendChild(thumb);
            row.appendChild(indexBadge);
            row.appendChild(title);

            if (state.isDesigning && !isFinished) {
                // Replace delete button with a spinner during design
                const spinner = document.createElement('div');
                spinner.className = 'inventory-item-spinner';
                row.appendChild(spinner);
            } else if (isFinished) {
                // Keep the row clean but ensure delBtn is not visible
                delBtn.style.display = 'none';
                row.appendChild(delBtn);
            } else {
                delBtn.addEventListener('click', () => {
                    removeFromInventory(index);
                });
                row.appendChild(delBtn);
            }

            inventoryList.appendChild(row);
        });
        // Calculate total price
        let total = 0;
        state.addedFurnishings.forEach(item => {
            total += parsePrice(item.price);
        });

        const totalEl = document.getElementById('inventoryTotal');
        if (totalEl) {
            totalEl.textContent = `Total: $${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
    } else {
        emptyInventoryState.style.display = 'flex';
        inventoryList.style.display = 'none';
        inventoryList.innerHTML = '';

        const totalEl = document.getElementById('inventoryTotal');
        if (totalEl) totalEl.textContent = `Total: $0.00`;
    }

    // Design Room Button State Management
    const designRoomBtn = document.getElementById('designRoomBtn');
    if (designRoomBtn) {
        if (state.isDesigning) {
            designRoomBtn.disabled = true;
            designRoomBtn.textContent = 'Designing';
            designRoomBtn.style.backgroundColor = '#f0f0f0';
            designRoomBtn.style.color = 'var(--text-gray)';
            designRoomBtn.style.opacity = '1';
        } else {
            const hasRoom = !!state.originalImageBase64;
            const pendingItems = state.addedFurnishings.filter(item => {
                const isFinished = item.completed === true || state.completedIds.includes(item.id);
                return !isFinished;
            });

            const shouldDisable = !hasRoom || pendingItems.length === 0;
            designRoomBtn.disabled = shouldDisable;
            designRoomBtn.textContent = 'Design';
            designRoomBtn.style.backgroundColor = 'var(--primary-blue)';
            designRoomBtn.style.color = 'var(--text-white)';
            designRoomBtn.style.opacity = shouldDisable ? '0.5' : '1';
            designRoomBtn.style.cursor = shouldDisable ? 'not-allowed' : 'pointer';
        }
    }
}

// Helper: Parse currency strings to numeric values
function parsePrice(priceStr) {
    if (!priceStr || typeof priceStr !== 'string') return 0;
    // Remove currency symbols, commas, and handle "N/A"
    const cleanStr = priceStr.replace(/[$,\s]/g, '');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? 0 : num;
}

export function addToInventory(item) {
    // Ensure item is a unique instance to prevent shared state bugs
    const newItem = { ...item };
    if (!newItem.id) {
        newItem.id = 'furnishing-' + Math.random().toString(36).substr(2, 9);
    }
    newItem.completed = false; // Always start as pending

    if (!newItem.color) {
        newItem.color = state.palette[state.itemCounter % state.palette.length];
        state.itemCounter++;
    }

    if (!newItem.points) {
        const cx = state.currentImgWidth / 2 || 200;
        const cy = state.currentImgHeight / 2 || 200;
        const size = 60;
        newItem.points = [
            { x: cx - size, y: cy - size },
            { x: cx + size, y: cy - size },
            { x: cx + size, y: cy + size },
            { x: cx - size, y: cy + size }
        ];
    }
    state.addedFurnishings.push(newItem);
    state.designComplete = false;

    updateInventoryUI();
    drawMasks();
}

export function removeFromInventory(index) {
    state.addedFurnishings.splice(index, 1);
    updateInventoryUI();
    drawMasks();
}

export function initInventory() {
    updateInventoryUI();

    const designRoomBtn = document.getElementById('designRoomBtn');
    if (designRoomBtn) {
        designRoomBtn.addEventListener('click', async () => {
            if (state.addedFurnishings.length === 0) {
                alert("Please add some items to your room first!");
                return;
            }

            state.isDesigning = true;
            designRoomBtn.disabled = true;
            designRoomBtn.textContent = "Designing";
            updateInventoryUI();

            try {
                // 1. Filter for pending items only
                const pendingItems = state.addedFurnishings.filter(item => !item.completed);
                if (pendingItems.length === 0) {
                    alert("All items in your room have already been designed!");
                    state.isDesigning = false;
                    designRoomBtn.disabled = false;
                    designRoomBtn.innerHTML = `<img src="/icons/openplan.svg" alt="Design" class="upload-icon"> Design Room`;
                    updateInventoryUI();
                    return;
                }

                // 2. Generate Masks with Metadata for pending items
                const polygons = pendingItems.map(item => item.points);
                const ids = pendingItems.map(item => item.id);

                const maskResponse = await fetch('/api/generate_masks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        width: state.currentImgWidth,
                        height: state.currentImgHeight,
                        polygons: polygons,
                        ids: ids
                    })
                });

                const maskData = await maskResponse.json();
                if (!maskData.masks) throw new Error("Failed to generate masks");

                // 2. Iterative Inpainting Loop
                let workingImage = state.currentSessionImageBase64;
                const canvasImg = document.querySelector('.canvas-area img');

                for (let i = 0; i < maskData.masks.length; i++) {
                    const maskObj = maskData.masks[i];
                    const item = state.addedFurnishings.find(it => it.id === maskObj.id);
                    if (!item) continue;

                    // Keep general text as requested
                    designRoomBtn.textContent = "Designing";

                    // Construct detailed prompt
                    const prompt = `Seamlessly inpaint a ${item.title} into the masked area of the room. Ensure the ${item.category} matches the existing room's lighting, shadows, and perspective for a photorealistic integrated look.`;

                    // Call Generation API with Visual Reference
                    console.log(`Sending Inpainting Request for ${item.title}. Mask Length: ${maskObj.base64.length}`);
                    console.log(`Base64 Mask:`, maskObj.base64);

                    const genResponse = await fetch('/api/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            itemName: item.title,
                            itemCategory: item.category || 'furniture',
                            furnitureImage: item.thumbnail,
                            maskBase64: maskObj.base64,
                            imageBase64: workingImage
                        })
                    });

                    const genData = await genResponse.json();
                    if (genData.generated_image) {
                        workingImage = genData.generated_image;
                        state.currentSessionImageBase64 = workingImage;
                        if (canvasImg) canvasImg.src = workingImage;

                        // Mark item as completed in state (source of truth)
                        const stateItem = state.addedFurnishings.find(it => it.id === maskObj.id);
                        if (stateItem) {
                            stateItem.completed = true;
                        }
                        if (!state.completedIds.includes(maskObj.id)) {
                            state.completedIds.push(maskObj.id);
                        }

                        // Force a clean UI sync
                        queueMicrotask(() => {
                            updateInventoryUI();
                            drawMasks();
                        });
                    } else {
                        console.error(`Turn ${i + 1} failed:`, genData.error);
                    }
                }

                // 3. Finalize
                state.designComplete = true;
                queueMicrotask(() => {
                    updateInventoryUI();
                    drawMasks();
                });

            } catch (err) {
                console.error("Design process failed:", err);
                alert("Something went wrong during the design process. Check console for details.");
            } finally {
                state.isDesigning = false;
                designRoomBtn.disabled = false;
                designRoomBtn.innerHTML = `<img src="/icons/openplan.svg" alt="Design" class="upload-icon"> Design`;
            }
        });
    }
}
