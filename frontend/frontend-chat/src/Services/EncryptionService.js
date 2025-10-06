import CryptoJS from 'crypto-js';

export const generateSharedSecret = (username1, username2) => {
    // A simple, deterministic way to generate a shared secret.
    // In a real application, a more secure key exchange mechanism like Diffie-Hellman would be used.
    const sortedUsernames = [username1, username2].sort();
    return CryptoJS.SHA256(sortedUsernames.join('-')).toString();
};

export const encryptMessage = (message, secretKey) => {
    return CryptoJS.AES.encrypt(message, secretKey).toString();
};

export const decryptMessage = (encryptedMessage, secretKey) => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted || encryptedMessage; // Return original if decryption fails
    } catch (error) {
        return encryptedMessage; // Return original on error
    }
};