/**
 * CSS property/value object type definition
 */
interface CSSObject {
  [key: string]: CSSObject | string | number | undefined | null;
}

/**
 * Optional prefixer function type
 */
type PrefixerFunction = (property: string, value: any) => string;

/**
 * Parses an object into CSS string, creating properly scoped blocks
 * @param {Object} styleObject - The object to parse into CSS
 * @param {String} selector - The CSS selector to scope styles to
 * @returns {String} - Generated CSS string
 */
export const parse = (styleObject: CSSObject, selector: string = ''): string => {
  let atRules = '';
  let nestedBlocks = '';
  let currentProperties = '';

  // Add static prefixer property to the parse function
  (parse as any).p = (parse as any).p || undefined;

  for (let property in styleObject) {
    let value = styleObject[property];

    if (property[0] === '@') {
      // Handle CSS at-rules
      if (property[1] === 'i') {
        // @import rule - doesn't need brackets
        atRules = property + ' ' + value + ';';
      } else if (property[1] === 'f') {
        // @font-face rule - doesn't need the selector
        nestedBlocks += parse(value as CSSObject, property);
      } else {
        // Other at-rules (@media, @keyframes, etc)
        nestedBlocks += property + '{' + 
                     parse(value as CSSObject, property[1] === 'k' ? '' : selector) +
                     '}';
      }
    } else if (typeof value === 'object' && value !== null) {
      // Handle nested selectors and media queries
      nestedBlocks += parse(
        value as CSSObject,
        selector
          ? // Process complex selectors
            selector.replace(/([^,])+/g, (sel) => {
              // Return the current selector with the property matching multiple selectors if any
              return property.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g, (nestedSelector) => {
                // If the current nestedSelector has an '&', replace it with the parent selector
                if (/&/.test(nestedSelector)) return nestedSelector.replace(/&/g, sel);
                
                // Otherwise, prepend the parent selector
                return sel ? sel + ' ' + nestedSelector : nestedSelector;
              });
            })
          : property
      );
    } else if (value != undefined) {
      // Process CSS properties and values
      
      // Convert camelCase to kebab-case, except for CSS variables (--*)
      const formattedProperty = /^--/.test(property) 
        ? property 
        : property.replace(/[A-Z]/g, '-$&').toLowerCase();
      
      // Add the property:value to the current properties string
      if ((parse as any).p) {
        // Use the prefixer if available
        currentProperties += (parse as any).p(formattedProperty, value);
      } else {
        // Otherwise just add the property:value pair
        currentProperties += formattedProperty + ':' + value + ';';
      }
    }
  }

  // Combine everything and return
  return atRules + 
         (selector && currentProperties ? selector + '{' + currentProperties + '}' : currentProperties) + 
         nestedBlocks;
};