const dataAttrRe = /^(data-.*)$/;

export const filterDataAttrs = (props: Record<string, any>) => {
  let filteredProps: Record<string, any> = {};

  for (const prop in props) {
    if (
      Object.prototype.hasOwnProperty.call(props, prop) &&
      dataAttrRe.test(prop)
    ) {
      filteredProps[prop] = props[prop];
    }
  }

  return filteredProps;
};
