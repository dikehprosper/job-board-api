const generateAvatar = (userData) => {
    // Extract the first letter from firstName or email
    const letter =
        userData?.firstName?.charAt(0).toUpperCase() ||
        userData?.email?.charAt(0).toUpperCase() ||
        "?";

    // Generate a random background color
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

    return { letter, randomColor };
};

module.exports = {
    generateAvatar
}