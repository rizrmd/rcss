import { getSheet } from './get-sheet';

/**
 * SSR style container interface
 */
interface StyleContainer {
  data: string;
}

/**
 * Extracts and wipes the CSS cache
 * @param {Element} [targetElement] - Optional target element
 * @returns {String} - The extracted CSS
 */
export const extractCss = (targetElement?: Element): string => {
  const styleSheet = getSheet(targetElement) as StyleContainer;
  const extractedCss = styleSheet.data;
  styleSheet.data = '';
  return extractedCss;
};

/**
 * Updates the target style sheet and manages CSS content
 * @param {String} cssContent - The CSS content to update
 * @param {StyleContainer|HTMLStyleElement|Text} styleSheet - The style sheet to update
 * @param {Boolean} shouldAppend - Whether to append or prepend the CSS
 * @param {String} [cssToReplace] - CSS content to be replaced
 */
export const update = (
  cssContent: string,
  styleSheet: StyleContainer | HTMLStyleElement | Text,
  shouldAppend?: boolean,
  cssToReplace?: string | null
): void => {
  // If we have a style sheet with data property (SSR or prepared DOM node)
  if ('data' in styleSheet) {
    if (cssToReplace) {
      // Replace the existing CSS with the new one
      styleSheet.data = styleSheet.data.replace(cssToReplace, cssContent);
    } else if (styleSheet.data.indexOf(cssContent) === -1) {
      // Only add if not already present
      styleSheet.data = shouldAppend 
        ? cssContent + styleSheet.data  // Append mode
        : styleSheet.data + cssContent; // Prepend mode (default)
    }
  }
  // If we're in a DOM environment with a Text node
  else if ('nodeValue' in styleSheet) {
    // @ts-ignore - We know this is a Text node
    styleSheet.nodeValue = cssContent;
  }
};