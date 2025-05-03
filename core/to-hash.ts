/**
 * Transforms the input string into a deterministic className.
 * The multiplication constant 101 is selected to be a prime,
 * as is the initial value of 11.
 * The intermediate and final results are truncated into 32-bit
 * unsigned integers.
 * @param {String} inputString - The string to hash
 * @param {Function} [formatFn] - Optional function to format the hash value
 * @returns {String} - The generated className
 */
export const toHash = (
  inputString: string, 
  formatFn?: (hashValue: number) => string
): string => {
  let index = 0;
  let hashValue = 11; // Initial prime value
  
  // Generate hash by iterating through each character
  while (index < inputString.length) {
    // Multiply by prime (101), add char code, and truncate to 32-bit unsigned int
    hashValue = (101 * hashValue + inputString.charCodeAt(index++)) >>> 0;
  }
  
  // Use the format function if provided, otherwise use default 'go' prefix
  return formatFn ? formatFn(hashValue) : 'go' + hashValue;
};