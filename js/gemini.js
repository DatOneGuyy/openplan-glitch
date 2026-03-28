import { state } from './state.js';

const canvasArea = document.querySelector('.canvas-area');
const summaryText = document.getElementById('analysisSummary');
const suggestionsContainer = document.getElementById('suggestionsContainer');
const emptyState = document.getElementById('customizeEmptyState');
const resultsArea = document.getElementById('customizeResults');

export async function runRoomAnalysis() {
    const hasImage = canvasArea.querySelector('img') !== null;

    if (!hasImage) {
        emptyState.style.display = 'flex';
        resultsArea.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    resultsArea.style.display = 'block';
    
    const img = canvasArea.querySelector('img');
    
    // Cache Check: If this image is the same as the last one, skip analysis
    if (img.src === state.lastAnalyzedImageSrc) {
        return;
    }

    state.lastAnalyzedImageSrc = img.src;
    
    // Loading state
    summaryText.innerHTML = '<em>Gemini is analyzing your space...</em>';
    suggestionsContainer.innerHTML = '<div class="loading-spinner"></div>';

    try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const base64Image = canvas.toDataURL('image/jpeg', 0.8);

        const prompt = `give me a room summary and suggested improvements based off the image following the format below.
Use a * ONLY to mark when a full suggestion (Title + Suggestion) ends.

Format:
Global Room Summary (1-2 sentences)
*
Suggestion Title
The first line of the suggestion. 
The rest of the suggestion text...
*
Another Suggestion Title
The first line of the second suggestion...
*
...`;

        const response = await fetch('/api/analyze_room', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64Image, prompt: prompt })
        });

        if (!response.ok) throw new Error('Analysis failed');

        const data = await response.json();
        const text = data.analysis;

        // Parsing sections by *
        const sections = text.split('*').map(s => s.trim()).filter(s => s.length > 0);
        
        if (sections.length > 0) {
            // First section is the summary
            summaryText.textContent = sections[0];
            
            // Clear suggestions container
            suggestionsContainer.innerHTML = '';
            
            // Subsequent sections are suggestions
            for (let i = 1; i < sections.length; i++) {
                const section = sections[i];
                const lines = section.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                
                if (lines.length > 0) {
                    const title = lines[0];
                    const subtitle = lines.length > 1 ? lines[1] : "AI Recommendation";
                    const fullDescription = lines.slice(1).join('\n');
                    
                    if (lines.length === 1 && i + 1 < sections.length) {
                        const nextSection = sections[i + 1];
                        const nextLines = nextSection.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                        if (nextLines.length > 0) {
                            createCard(title, nextLines[0], nextLines.join('\n'));
                            i++;
                            continue;
                        }
                    }

                    createCard(title, subtitle, fullDescription);
                }
            }
        } else {
            summaryText.textContent = "Gemini couldn't provide a detailed analysis at this time.";
            suggestionsContainer.innerHTML = '';
        }
    } catch (err) {
        console.error(err);
        summaryText.textContent = "An error occurred during analysis.";
        suggestionsContainer.innerHTML = '';
    }
}

function createCard(title, subtitle, description) {
    const card = document.createElement('div');
    card.className = 'suggestion-card';
    card.innerHTML = `
        <div class="suggestion-header">
            <div class="suggestion-info">
                <div class="suggestion-title">${title}</div>
                <div class="suggestion-subtitle">${subtitle}</div>
            </div>
            <div class="suggestion-arrow">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>
        </div>
        <div class="suggestion-body">
            <div class="suggestion-desc">${description.replace(/\n/g, '<br>')}</div>
        </div>
    `;
    
    card.onclick = () => {
        card.classList.toggle('expanded');
    };
    
    suggestionsContainer.appendChild(card);
}
