/**
 * Transforms the input string into a deterministic className.
 * The multiplication constant 101 is selected to be a prime,
 * as is the initial value of 11.
 * The intermediate and final results are truncated into 32-bit
 * unsigned integers.
 * @param {String} inputString - The string to hash
 * @returns {String} - The generated className with 'go' prefix
 */
export const toHash = (inputString: string): string => {
  let index = 0;
  let hashValue = 11; // Initial prime value
  
  // Generate hash by iterating through each character
  while (index < inputString.length) {
    // Multiply by prime (101), add char code, and truncate to 32-bit unsigned int
    hashValue = (101 * hashValue + inputString.charCodeAt(index++)) >>> 0;
  }
  
  // Return className with 'go' prefix
  return 'go' + hashValue;
};