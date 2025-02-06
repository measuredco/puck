
/**
 * 
 * @param props 
 * @param externalData 
 * @returns string
 * @description This is an example function used by beforeRender to transform props using global externalData provided to Puck
 */

// import Handlebars from 'handlebars';
//Default import causes a webpack warning

//@ts-expect-error
import * as Handlebars from 'handlebars/dist/handlebars';

const processPropsHandlebars = (props: any, externalData: any): any => {
  if (!props) return
  if(!externalData) return props
  return Object.entries(props || {}).reduce((acc: Record<string, any>, [key, value]: [string, any]) => {
    if (value && typeof value === "string" && value.includes("{{") && value.includes("}}")) {
      const template = Handlebars.compile(value)
      const htmlString = template(externalData)
      acc[key] = htmlString
    } else if (value && Array.isArray(value)) {
      acc[key] = value.map(item => processPropsHandlebars(item, externalData))
    } else if (value && typeof value === "object") {
      acc[key] = processPropsHandlebars(value, externalData)
    } else {
      acc[key] = value
    }
    return acc
  }, {})
}

export default processPropsHandlebars;