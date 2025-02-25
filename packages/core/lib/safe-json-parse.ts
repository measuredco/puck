export const safeJsonParse = <T = any>(str: string) => {
  try {
    const jsonValue: T = JSON.parse(str);
    return jsonValue;
  } catch {
    return str;
  }
};
