/**
 * Regular expressions for CSS parsing
 */
const cssRuleRegex = /(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g;
const commentAndExtraSpacesRegex = /\/\*[^]*?\*\/|  +/g;
const newlineRegex = /\n+/g;
const spaceReplacement = ' ';

/**
 * CSS object type definition
 */
interface CSSObject {
  [key: string]: CSSObject | string;
}

/**
 * Converts a CSS string into an object representation (AST-like structure)
 * @param {String} cssString - CSS string to parse
 * @returns {Object} - Object representation of the CSS
 */
export const astish = (cssString: string): CSSObject => {
  // Stack of nested objects representing the CSS structure
  const objectStack: CSSObject[] = [{}];
  let matchResult: RegExpExecArray | null;
  let selectorName: string;

  // Clean the input by removing comments and normalizing whitespace
  const cleanedCss = cssString.replace(commentAndExtraSpacesRegex, '');

  // Process each CSS rule
  while ((matchResult = cssRuleRegex.exec(cleanedCss))) {
    if (matchResult[4]) {
      // Closing brace - move up one level in the stack
      objectStack.shift();
    } else if (matchResult[3]) {
      // Selector or at-rule with block - create new nested object
      selectorName = matchResult[3].replace(newlineRegex, spaceReplacement).trim();
      
      // Create the object if it doesn't exist yet
      objectStack[0][selectorName] = objectStack[0][selectorName] || {};
      
      // Add the new object to the top of the stack
      objectStack.unshift(objectStack[0][selectorName] as CSSObject);
    } else if (matchResult[1] && matchResult[2]) {
      // Property: value pair
      objectStack[0][matchResult[1]] = matchResult[2]
        .replace(newlineRegex, spaceReplacement)
        .trim();
    }
  }

  return objectStack[0];
};