import { parse } from './parse';

/**
 * Compiles a tagged template string with its expressions
 * @param {TemplateStringsArray} templateStringArray - The template string array
 * @param {Array<any>} expressionValues - The expression values
 * @param {Object} [propsData] - The props data for function interpolations
 * @returns {string} - The compiled CSS string
 */
export const compile = (
  templateStringArray: TemplateStringsArray | Array<string>, 
  expressionValues: Array<any>, 
  propsData?: any
): string => {
  return (templateStringArray as Array<string>).reduce((outputString, currentPart, index) => {
    let expressionValue = expressionValues[index];

    // If this is a function we need to:
    if (expressionValue && typeof expressionValue === 'function') {
      // 1. Call it with `propsData`
      const evaluatedResult = expressionValue(propsData);

      // 2. Grab the className
      const className = evaluatedResult && 
                      evaluatedResult.props && 
                      evaluatedResult.props.className;

      // 3. If there's none, see if this is basically a
      // previously styled className by checking the prefix
      const resultClassName = className || (/^go/.test(evaluatedResult) && evaluatedResult);

      if (resultClassName) {
        // If the `resultClassName` is defined means it's a className
        expressionValue = '.' + resultClassName;
      } else if (evaluatedResult && typeof evaluatedResult === 'object') {
        // If `evaluatedResult` is an object, we're either dealing with a vnode
        // or an object returned from a function interpolation
        expressionValue = evaluatedResult.props ? '' : parse(evaluatedResult, '');
      } else {
        // Regular value returned. Can be falsy as well.
        // Here we check if this is strictly a boolean with false value
        // define it as `''` to be picked up as empty, otherwise use
        // evaluatedResult value
        expressionValue = evaluatedResult === false ? '' : evaluatedResult;
      }
    }
    
    return outputString + currentPart + (expressionValue == null ? '' : expressionValue);
  }, '');
};