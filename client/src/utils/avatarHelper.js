/**
 * Avatar Helper Utilities
 * Generates CSS-based avatars without external API calls
 */

/**
 * Get avatar properties (initials and color) for a name
 * @param {string} name - User's name
 * @returns {Object} { initials, backgroundColor }
 */
export const getAvatarProps = (name) => {
  if (!name) {
    return {
      initials: '?',
      backgroundColor: '#666666',
    };
  }

  // Generate initials (first letter of each word, max 2)
  const initials = name
    .trim()
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word[0].toUpperCase())
    .slice(0, 2)
    .join('');

  // Generate consistent color based on name hash
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  const backgroundColor = `hsl(${hue}, 70%, 50%)`;

  return {
    initials: initials || '?',
    backgroundColor,
  };
};

/**
 * Get avatar color only (for existing avatar components)
 * @param {string} name - User's name
 * @returns {string} HSL color string
 */
export const getAvatarColor = (name) => {
  if (!name) return '#666666';
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

/**
 * Get avatar configuration with SVG data URI (for components using img src)
 * Creates inline SVG that doesn't require external API calls
 * @param {string} name - User's name
 * @returns {Object} { src: string, bgcolor: string }
 */
export const getAvatarConfig = (name) => {
  const { initials, backgroundColor } = getAvatarProps(name);
  
  // Create inline SVG
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="${backgroundColor}" rx="50"/>
      <text 
        x="50" 
        y="50" 
        font-family="Arial, sans-serif" 
        font-size="42" 
        font-weight="700" 
        fill="#ffffff" 
        text-anchor="middle" 
        dominant-baseline="central"
      >${initials}</text>
    </svg>
  `.trim().replace(/\s+/g, ' ');
  
  // Convert to data URI
  const dataUri = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  
  return {
    src: dataUri,
    bgcolor: backgroundColor
  };
};

