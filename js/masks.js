import { state } from './state.js';

let draggedItem = null; // { index, pointIndex } or { index, type: 'body' }
let dragOffset = { x: 0, y: 0 };
const svgNS = "http://www.w3.org/2000/svg";

export function initMasks() {
    const canvasArea = document.querySelector('.canvas-area');
    let svg = canvasArea.querySelector('svg#maskOverlay');
    
    if (!svg) {
        svg = document.createElementNS(svgNS, 'svg');
        svg.id = 'maskOverlay';
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none'; // Only children have pointers
        canvasArea.appendChild(svg);
    }
    
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
}

export function drawMasks() {
    let svg = document.getElementById('maskOverlay');
    if (!svg) {
        const canvasArea = document.querySelector('.canvas-area');
        if (!canvasArea) return;
        initMasks();
        svg = document.getElementById('maskOverlay');
        if (!svg) return;
    }
    
    svg.innerHTML = ''; // Clear for redraw
    
    state.addedFurnishings.forEach((item, index) => {
        const itemGroup = document.createElementNS(svgNS, 'g');
        itemGroup.setAttribute('data-item-id', item.id);
        
        const isCurrentlyCompleted = item.completed === true || state.completedIds.includes(item.id);

        if (!item.points) {
            const cx = state.currentImgWidth / 2 || 200;
            const cy = state.currentImgHeight / 2 || 200;
            const size = 60;
            item.points = [
                { x: cx - size, y: cy - size },
                { x: cx + size, y: cy - size },
                { x: cx + size, y: cy + size },
                { x: cx - size, y: cy + size }
            ];
        }
        
        // 1. Polygon Face
        const isDesignDone = state.designComplete === true;
        
        // Only draw the polygon/handles if NOT design done and NOT item completed
        if (!isDesignDone && !isCurrentlyCompleted) {
            const polygon = document.createElementNS(svgNS, 'polygon');
            const pointsStr = item.points.map(p => `${p.x},${p.y}`).join(' ');
            polygon.setAttribute('points', pointsStr);
            polygon.setAttribute('fill', 'rgba(255, 255, 255, 0.4)');
            polygon.setAttribute('stroke', 'white');
            polygon.setAttribute('stroke-width', '2');
            polygon.setAttribute('data-item-id', item.id);
            polygon.style.pointerEvents = 'auto';
            polygon.style.cursor = 'move';
            
            polygon.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                const { x, y } = getMousePos(e);
                draggedItem = { index, type: 'body' };
                dragOffset = { x, y };
            });
            
            itemGroup.appendChild(polygon);
            
            // 2. Corner Handles
            item.points.forEach((p, pIdx) => {
                const handle = document.createElementNS(svgNS, 'circle');
                handle.setAttribute('cx', p.x);
                handle.setAttribute('cy', p.y);
                handle.setAttribute('r', '10');
                handle.setAttribute('fill', 'white');
                handle.setAttribute('stroke', 'var(--primary-blue)');
                handle.setAttribute('class', 'mask-handle');
                handle.setAttribute('data-item-id', item.id);
                handle.setAttribute('stroke-width', '2');
                handle.style.pointerEvents = 'auto';
                handle.style.cursor = 'crosshair';
                
                handle.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                    draggedItem = { index, pointIndex: pIdx };
                });
                
                itemGroup.appendChild(handle);
            });
        }

        // 3. Index Bubble (Only draw if NOT completed)
        if (!isCurrentlyCompleted) {
            const centerX = item.points.reduce((sum, p) => sum + p.x, 0) / item.points.length;
            const centerY = item.points.reduce((sum, p) => sum + p.y, 0) / item.points.length;
            
            const bubbleGroup = document.createElementNS(svgNS, 'g');
            bubbleGroup.setAttribute('class', 'bubble-group');
            
            const bubble = document.createElementNS(svgNS, 'circle');
            bubble.setAttribute('cx', centerX);
            bubble.setAttribute('cy', centerY);
            bubble.setAttribute('r', '14');
            bubble.setAttribute('fill', item.color || 'var(--primary-blue)');
            bubble.setAttribute('stroke', 'white');
            bubble.setAttribute('stroke-width', '2');
            bubbleGroup.appendChild(bubble);

            const text = document.createElementNS(svgNS, 'text');
            text.setAttribute('x', centerX);
            text.setAttribute('y', centerY + 5);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'white');
            text.setAttribute('font-size', '12');
            text.setAttribute('font-weight', 'bold');
            text.textContent = index + 1;
            bubbleGroup.appendChild(text);
            
            itemGroup.appendChild(bubbleGroup);
        }
        
        svg.appendChild(itemGroup);
    });
}

export function hideMaskOverlay() {
    const svg = document.getElementById('maskOverlay');
    if (svg) svg.style.display = 'none';
}

export function showMaskOverlay() {
    const svg = document.getElementById('maskOverlay');
    if (svg) svg.style.display = 'block';
}

function getMousePos(e) {
    const svg = document.getElementById('maskOverlay');
    const CTM = svg.getScreenCTM();
    return {
        x: (e.clientX - CTM.e) / CTM.a,
        y: (e.clientY - CTM.f) / CTM.d
    };
}

function handleGlobalMouseMove(e) {
    if (!draggedItem) return;
    
    const { x, y } = getMousePos(e);
    const item = state.addedFurnishings[draggedItem.index];
    
    if (draggedItem.type === 'body') {
        const dx = x - dragOffset.x;
        const dy = y - dragOffset.y;
        
        item.points.forEach(p => {
            p.x += dx;
            p.y += dy;
        });
        
        dragOffset = { x, y };
    } else {
        // Handle drag
        item.points[draggedItem.pointIndex] = { x, y };
    }
    
    drawMasks();
}

function handleGlobalMouseUp() {
    draggedItem = null;
}
