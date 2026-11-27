import rawConfig from "../../data/site-config.json";

export function getSiteConfig() {
  return rawConfig || {};
}

export default rawConfig;
