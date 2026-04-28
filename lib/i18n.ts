import daMessages from "@/messages/da.json";
import enMessages from "@/messages/en.json";

type MessageTree = typeof daMessages;
type Locale = "da" | "en";

const dictionaries: Record<Locale, MessageTree> = {
  da: daMessages,
  en: enMessages as MessageTree
};

export function t(path: string, locale: Locale = "da") {
  const active = dictionaries[locale] ?? dictionaries.da;
  const fallback = dictionaries.en;
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, active);

  if (typeof value === "string") {
    return value;
  }

  const fallbackValue = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, fallback);

  return typeof fallbackValue === "string" ? fallbackValue : path;
}
