import type { Properties as CSSProperties } from "csstype";
import { hash } from "./core/hash";
import { compile } from "./core/compile";
import { getSheet } from "./core/get-sheet";

// Define interfaces and types
export interface CSSAttribute extends CSSProperties {
  [key: string]: CSSAttribute | string | number | undefined | null;
}

export interface CSSContext {
  p?: any; // props
  g?: 1; // global flag
  k?: 1; // keyframes flag
  o?: any; // options
  target?: Element; // target element
}

export type CSSInterpolation =
  | string
  | number
  | boolean
  | undefined
  | null
  | ((
      props: any
    ) => CSSAttribute | string | number | boolean | undefined | null);

export type CSSValue = CSSAttribute | TemplateStringsArray | string | Function;

/**
 * Creates CSS styles and returns a unique className
 *
 * @param {CSSValue} styleValue - CSS template string, object or function
 * @param {...CSSInterpolation} interpolations - Values to interpolate into CSS
 * @returns {string} - A generated className
 */
function css(
  this: CSSContext,
  styleValue: CSSValue,
  ...interpolations: CSSInterpolation[]
): string {
  const context: CSSContext = this || {};

  // Process styleValue based on type
  const processedStyle =
    typeof styleValue === "function"
      ? styleValue(context.p) // Evaluate function with props
      : styleValue;

  // Process and hash styles
  return hash(
    // Handle different types of style input
    Array.isArray(processedStyle) && "unshift" in processedStyle
      ? (processedStyle as any).raw
        ? // Tagged templates processing
          compile(processedStyle, interpolations, context.p)
        : // Array of style objects
          (processedStyle as Array<any>).reduce(
            (result, item) =>
              Object.assign(
                result,
                item && typeof item === "function" ? item(context.p) : item
              ),
            {}
          )
      : processedStyle, // Object or string

    // Get the stylesheet target
    getSheet(context.target),

    // Pass remaining flags and options - convert number flags to boolean
    !!context.g, // Global flag
    context.o, // Options
    !!context.k // Keyframes flag
  );
}

/**
 * CSS Global function to declare global styles
 * @param {CSSValue} styleValue - CSS template string, object or function
 * @param {...CSSInterpolation} interpolations - Values to interpolate into CSS
 * @returns {string} - An empty string for globals
 */
const glob = css.bind({ g: 1 });

/**
 * Keyframes function for defining animations
 * @param {CSSValue} styleValue - CSS template string, object or function
 * @param {...CSSInterpolation} interpolations - Values to interpolate into CSS
 * @returns {string} - A generated animation name
 */
const keyframes = css.bind({ k: 1 });

export { css, glob, keyframes };
