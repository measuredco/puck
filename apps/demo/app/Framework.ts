export const validFrameworks = ["antd", "material-ui", "custom"] as const;
export type Framework = (typeof validFrameworks)[number];
