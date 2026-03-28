// Centralized state for the Room Designer app
export const state = {
    // Auth
    isLoggedIn: false,
    currentProjectName: null,
    
    // Inventory
    addedFurnishings: [],
    
    // Canvas & Image
    currentImgWidth: 0,
    currentImgHeight: 0,
    
    // Gemini Analysis Caching
    lastAnalyzedImageSrc: null,
    
    // Furniture Browser Caching
    searchCache: {},
    isFetching: false,
    hasLoadedInitialFurniture: false,

    // Coloring System
    itemCounter: 0,
    palette: [
        '#4F46E5', // Indigo
        '#E11D48', // Rose
        '#10B981', // Emerald
        '#D97706', // Amber
        '#7C3AED', // Violet
        '#0891B2', // Cyan
        '#DB2777', // Pink
        '#65A30D', // Lime
        '#EA580C', // Orange
        '#0284C7', // Sky
        '#C026D3', // Fuchsia
        '#0D9488'  // Teal
    ],

    // Inpainting Session State
    originalImageBase64: null,
    currentSessionImageBase64: null,
    isDesigning: false,
    designComplete: false,
    completedIds: []
};

console.log("Global State Initialized.");
window.state = state;
