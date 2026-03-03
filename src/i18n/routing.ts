// Re-export routing from root i18n/routing.ts
// This allows @/i18n/routing imports from src/ files while keeping
// the canonical routing config at project root for next.config.ts compatibility
export { routing } from "../../i18n/routing";
