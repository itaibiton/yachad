// Re-export routing and navigation utilities from root i18n/routing.ts
// This allows @/i18n/routing imports from src/ files while keeping
// the canonical routing config at project root for next.config.ts compatibility
export { routing, Link, redirect, usePathname, useRouter } from "../../i18n/routing";
