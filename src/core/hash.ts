import { toHash } from "./to-hash";
import { update } from "./update";
import { astish } from "./astish";
import { parse } from "./parse";

/**
 * Type-safe cache interface that allows both string indexing and special properties
 */
type StyleCache = Record<string, string> & {
  g?: string | undefined; // Special property for global styles
};

/**
 * In-memory cache.
 */
let styleCache: StyleCache = {};

/**
 * Stringifies an object structure to create a deterministic string
 * @param {any} styleData - The data to stringify
 * @returns {String} - Deterministic string representation
 */
const stringifyObject = (styleData: any): string => {
  if (typeof styleData === "object" && styleData !== null) {
    let outputString = "";
    for (let propertyName in styleData) {
      outputString += propertyName + stringifyObject(styleData[propertyName]);
    }
    return outputString;
  } else {
    return String(styleData);
  }
};

/**
 * Generates the needed className and injects the CSS
 * @param {any} compiledStyles - The compiled styles (object or string)
 * @param {CSSStyleSheet|HTMLStyleElement|Text|any} styleSheet - StyleSheet target
 * @param {boolean} isGlobal - Global flag
 * @param {any} options - Additional options
 * @param {boolean} isKeyframes - Keyframes mode. The input is the keyframes body that needs to be wrapped.
 * @returns {String} - Generated className
 */
export const hash = (
  compiledStyles: any,
  styleSheet: CSSStyleSheet | HTMLStyleElement | Text | any,
  isGlobal?: boolean,
  options?: any,
  isKeyframes?: boolean
): string => {
  // Get a string representation of the compiledStyles
  const stringifiedStyles = stringifyObject(compiledStyles);

  // Retrieve the className from cache or hash it in place
  const className =
    styleCache[stringifiedStyles] ||
    (styleCache[stringifiedStyles] = toHash(stringifiedStyles));

  // If there's no entry for the current className
  if (!styleCache[className]) {
    // Build the abstract syntax tree-like structure if needed
    const ast =
      stringifiedStyles !== compiledStyles
        ? compiledStyles
        : astish(compiledStyles);

    // Parse it
    styleCache[className] = parse(
      // For keyframes
      isKeyframes ? { ["@keyframes " + className]: ast } : ast,
      isGlobal ? "" : "." + className
    );
  }

  // If the global flag is set, save the current stringified and compiled CSS to `styleCache.g`
  // to allow replacing styles in <style /> instead of appending them.
  // This is required for using `createGlobalStyles` with themes
  const cssToReplace = isGlobal && styleCache.g ? styleCache.g : null;
  if (isGlobal) styleCache.g = styleCache[className];

  // add or update the styles in the DOM
  update(styleCache[className], styleSheet, options, cssToReplace);

  // return the generated className
  return className;
};
