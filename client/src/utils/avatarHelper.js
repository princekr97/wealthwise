
const AVATAR_COLORS = [
    '#93c5fd', // Blue 300
    '#86efac', // Green 300
    '#fcd34d', // Amber 300
    '#fca5a5', // Red 300
    '#d8b4fe', // Purple 300
    '#a5b4fc', // Indigo 300
    '#fdba74', // Orange 300
    '#5eead4', // Teal 300
    '#f0abfc', // Fuchsia 300
    '#f9a8d4', // Pink 300
    '#67e8f9', // Cyan 300
    '#bef264', // Lime 300
];

/**
 * Generates a consistent avatar configuration (background color and image URL) based on the user's name.
 * @param {string} name - The user's name.
 * @param {string} [customUrl] - Optional custom avatar URL (e.g., from user profile).
 * @returns {{ bgcolor: string, src: string, color: string }} - The avatar configuration.
 */
export const getAvatarConfig = (name, customUrl = null) => {
    if (!name) return { bgcolor: '#f1f5f9', src: '', color: '#1e293b' };

    // Generate consistent color hash
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const bgcolor = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];

    // DiceBear URL (Notionists style)
    // Use encodeURIComponent to handle spaces/special chars in names correctly for the URL
    const src = customUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}`;

    return { 
        bgcolor, 
        src,
        color: '#1e293b', // Default dark text color for contrast against pastel bg
        border: '1px solid rgba(0,0,0,0.05)' // Subtle border
    };
};
