/**
 * Identifier for the goober style element
 */
const GOOBER_STYLE_ID = "_goober";

/**
 * Server-side rendering style container
 */
interface SSRStyleContainer {
  data?: string;
}

/**
 * Default SSR style container
 */
const ssrStyleContainer: SSRStyleContainer = {
  data: "",
};

/**
 * Returns the appropriate style sheet target for DOM manipulation
 * @param {Element} [targetElement] - Optional target DOM element to append the style to
 * @param {string} [customId] - Optional custom ID for the style element
 * @returns {HTMLStyleElement|Object} - Style element or SSR container
 */
export const getSheet = (
  targetElement?: Element,
  customId?: string
): Text | SSRStyleContainer | any => {
  const styleId = customId || GOOBER_STYLE_ID;

  if (typeof window === "object") {
    // Querying the existing target for a previously defined <style> tag
    // We're doing a querySelector because the <head> element doesn't implement getElementById
    const existingStyleElement = (
      targetElement
        ? targetElement.querySelector("#" + styleId)
        : (window as any)[styleId]
    ) as HTMLStyleElement | null;

    if (existingStyleElement && existingStyleElement.firstChild) {
      return existingStyleElement.firstChild;
    }

    // Create a new style element if none exists
    const styleElement = document.createElement("style");
    styleElement.innerHTML = " ";
    styleElement.id = styleId;

    // Append to target or document.head
    const parentElement = targetElement || document.head;
    parentElement.appendChild(styleElement);

    return styleElement.firstChild;
  }

  // Return the target or default SSR container for server-side rendering
  return targetElement &&
    (targetElement as SSRStyleContainer).data !== undefined
    ? (targetElement as SSRStyleContainer)
    : ssrStyleContainer;
};
