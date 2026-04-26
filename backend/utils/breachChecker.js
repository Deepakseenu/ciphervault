const axios = require('axios');
const crypto = require('crypto');

/**
 * Check if a password has been exposed in known data breaches
 * Uses HaveIBeenPwned API with k-anonymity model:
 * 1. SHA-1 hash the password
 * 2. Send only first 5 chars of hash to API
 * 3. API returns all hashes starting with those 5 chars
 * 4. We check locally if our full hash is in the list
 * 5. The actual password NEVER leaves our server
 */

const checkPasswordBreach = async (password) => {
  try {
    // Step 1: SHA-1 hash the password
    const sha1Hash = crypto
      .createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase();

    // Step 2: Split — prefix (sent to API) and suffix (kept local)
    const prefix = sha1Hash.slice(0, 5);
    const suffix = sha1Hash.slice(5);

    // Step 3: Call HaveIBeenPwned API with only the prefix
    const response = await axios.get(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: {
          'Add-Padding': 'true', // Extra privacy padding
          'User-Agent': 'CipherVault-PasswordManager'
        },
        timeout: 5000 // 5 second timeout
      }
    );

    // Step 4: Parse response and check if our suffix exists
    const hashes = response.data.split('\n');
    
    for (const hash of hashes) {
      const [hashSuffix, count] = hash.split(':');
      if (hashSuffix.trim() === suffix) {
        return {
          breached: true,
          count: parseInt(count.trim()),
          message: `⚠️ This password has been exposed in ${parseInt(count.trim()).toLocaleString()} data breaches!`
        };
      }
    }

    return {
      breached: false,
      count: 0,
      message: '✅ This password has not been found in any known data breaches.'
    };

  } catch (err) {
    // Don't block password saving if breach check fails
    console.error('Breach check error:', err.message);
    return {
      breached: false,
      count: 0,
      message: '⚠️ Breach check unavailable — password saved anyway.',
      error: true
    };
  }
};

module.exports = { checkPasswordBreach };