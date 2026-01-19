/**
 * Avatar Helper Utilities
 * Generates avatar URLs and properties for consistent user avatars
 * Uses DiceBear API for illustrated avatars in UI
 * Uses initials as fallback
 */

// Color palette for consistent avatar backgrounds
const AVATAR_COLORS = [
  'b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf',
  'feca57', 'ff6b6b', 'ee5a6f', '4ecdc4', '45b7d1',
  '96ceb4', 'dfe6e9', 'fab1a0', 'fdcb6e', '6c5ce7',
  'a29bfe', 'fd79a8', 'fdcb6e', '55efc4', '81ecec'
];

/**
 * Get avatar illustration URL using DiceBear API
 * Creates consistent, beautiful avatar illustrations
 * @param {string} name - User's name
 * @returns {string} Avatar URL
 */
export const getAvatarUrl = (name) => {
  if (!name) return null;
  
  const safeName = encodeURIComponent(name);
  
  // Generate consistent color based on name hash
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const bgColor = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  
  // Using DiceBear "notionists" style - clean and modern
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${safeName}&backgroundColor=${bgColor}`;
};

/**
 * Get avatar properties (initials and color) for fallback
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
 * Get complete avatar configuration
 * Returns illustrated avatar URL with fallback initials
 * @param {string} name - User's name
 * @returns {Object} { url, initials, backgroundColor }
 */
export const getAvatarConfig = (name) => {
  const { initials, backgroundColor } = getAvatarProps(name);
  const url = getAvatarUrl(name);
  
  return {
    url,
    src: url, // Alias for compatibility
    initials,
    backgroundColor,
    bgcolor: backgroundColor // Alias for compatibility
  };
};


