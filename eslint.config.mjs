import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn"
    }
  },
  {
    ignores: [".next/**", "node_modules/**", "mobile/**"]
  }
];

export default config;
