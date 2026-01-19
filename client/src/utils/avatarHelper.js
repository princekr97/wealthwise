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
