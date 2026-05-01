/**
 * Generates a simple avatar fallback for a user.
 * Used when no profile image is available.
 *
 * - Extracts the first available name field from user data
 * - Falls back to email if no name exists
 * - Uses "?" if no valid data is found
 * - Generates a random background color for avatar UI
 *
 * @param {Object} userData - User object from DB or auth provider
 * @returns {Object} { letter: string, randomColor: string }
 */

const generateAvatar = (nameSource) => {

    // Take first character safely and convert to uppercase
    const randomLetter = (nameSource.trim().charAt(0) || "?").toUpperCase();

    // Generate random hex color for avatar background
    // Used when no profile image exists
    const randomColor =
        "#" +
        Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0");
    return { randomLetter, randomColor };
};

module.exports = {
    generateAvatar
};