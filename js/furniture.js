import { state } from './state.js';
import { addToInventory } from './inventory.js';

const furnitureGrid = document.getElementById('furnitureGrid');
const furnitureSearchInput = document.getElementById('furnitureSearchInput');
const categoryChips = document.querySelectorAll('.category-chip');
const resultsCountText = document.getElementById('resultsCount');

export async function fetchFurniture(query = 'furniture') {
    if (state.isFetching || !furnitureGrid) return;
    
    // Check cache, but only if it contains our new 'link' data
    if (state.searchCache[query]) {
        const hasLinks = state.searchCache[query].results?.[0]?.link;
        if (hasLinks) {
            console.log(`Using cached results for: ${query}`);
            renderFurnitureData(state.searchCache[query], query);
            return;
        }
    }

    state.isFetching = true;
    resultsCountText.textContent = `Searching for "${query}"...`;
    furnitureGrid.innerHTML = '<div class="loading-spinner"></div>'; 

    try {
        const res = await fetch(`/api/search_furniture?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        if (res.ok) {
            state.searchCache[query] = data; // Save to cache
        }
        
        renderFurnitureData(data, query);
    } catch (err) {
        console.error("API Error:", err);
        resultsCountText.textContent = `Error fetching results`;
    } finally {
        state.isFetching = false;
    }
}

export function renderFurnitureData(data, query) {
    furnitureGrid.innerHTML = ''; 
    if (data.results && data.results.length > 0) {
        resultsCountText.textContent = `${data.results.length} items for "${query}"`;
        
            data.results.forEach(item => {
                const card = document.createElement('div');
                card.className = 'furniture-card';
                
                // Card Link (Merchant)
                const cardLink = document.createElement('a');
                cardLink.className = 'furniture-card-link';
                cardLink.href = item.link || '#';
                cardLink.target = '_blank';
                cardLink.rel = 'noopener noreferrer';

                const imgWrapper = document.createElement('div');
                imgWrapper.className = 'furniture-image-wrapper';

                const img = document.createElement('img');
                img.className = 'furniture-image';
                img.src = item.thumbnail || 'https://via.placeholder.com/200';
                img.alt = item.title;
                img.loading = 'lazy';
                
                // Redesigned Add Button
                const addBtn = document.createElement('div');
                addBtn.className = 'add-to-room-btn';
                addBtn.innerHTML = 'Add to Room';
                
                addBtn.addEventListener('click', (e) => {
                    e.preventDefault(); // prevent link redirect
                    e.stopPropagation(); // prevent card click
                    addToInventory(item);
                });

                imgWrapper.appendChild(img);
                imgWrapper.appendChild(addBtn);
                
                const details = document.createElement('div');
                details.className = 'furniture-details';
                
                const title = document.createElement('div');
                title.className = 'furniture-title';
                title.textContent = item.title;
                title.title = item.title;
                
                const seller = document.createElement('div');
                seller.className = 'furniture-seller';
                seller.textContent = item.seller || 'Unknown Source';
                
                const price = document.createElement('div');
                price.className = 'furniture-price';
                price.textContent = item.price || 'N/A';
                
                const footerRow = document.createElement('div');
                footerRow.className = 'furniture-footer-row';
                
                const badge = document.createElement('div');
                badge.className = 'furniture-badge';
                badge.textContent = item.category || 'Item';
                
                const rating = document.createElement('div');
                rating.className = 'furniture-rating';
                if (item.rating) {
                    rating.innerHTML = `★ <span>${item.rating}</span>`;
                }

                footerRow.appendChild(badge);
                if (item.rating) footerRow.appendChild(rating);
                
                details.appendChild(title);
                details.appendChild(seller);
                details.appendChild(price);
                details.appendChild(footerRow);
                
                cardLink.appendChild(imgWrapper);
                cardLink.appendChild(details);
                card.appendChild(cardLink);
                
                furnitureGrid.appendChild(card);
            });
    } else {
        resultsCountText.textContent = `No items found for "${query}"`;
    }
}

export function setupFurnitureBrowser() {
    if (categoryChips) {
        categoryChips.forEach(chip => {
            chip.addEventListener('click', () => {
                categoryChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                
                const category = chip.getAttribute('data-category');
                if (furnitureSearchInput) furnitureSearchInput.value = '';
                fetchFurniture(category);
            });
        });
    }

    if (furnitureSearchInput) {
        furnitureSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const q = e.target.value.trim();
                if (q) {
                    categoryChips.forEach(c => c.classList.remove('active'));
                    fetchFurniture(q);
                }
            }
        });
    }
}
