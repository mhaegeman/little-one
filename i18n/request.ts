import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => ({
  locale: "da",
  messages: (await import("../messages/da.json")).default
}));
