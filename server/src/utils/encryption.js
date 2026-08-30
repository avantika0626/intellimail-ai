const crypto = require('crypto');
const config = require('../config/env');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

// Derive a 32-byte key from the configured encryption key
function getKey() {
  const secret = config.credentialEncryptionKey || 'default_32byte_secret_key_12345678';
  return crypto.createHash('sha256').update(String(secret)).digest();
}

/**
 * Encrypt plain text using AES-256-GCM
 * @param {string} text 
 * @returns {string} iv:tag:encryptedData (hex encoded)
 */
function encrypt(text) {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  } catch (err) {
    console.error('[Encryption] Error encrypting data:', err.message);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt ciphertext using AES-256-GCM
 * @param {string} cipherText 
 * @returns {string} decrypted plain text
 */
function decrypt(cipherText) {
  if (!cipherText) return cipherText;
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) {
      // Return as-is if not formatted or if already plain
      return cipherText;
    }
    
    const [ivHex, tagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const key = getKey();
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.error('[Encryption] Error decrypting data:', err.message);
    return null;
  }
}

module.exports = {
  encrypt,
  decrypt,
};
