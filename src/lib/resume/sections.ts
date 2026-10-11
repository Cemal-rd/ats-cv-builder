import { BUILTIN_SECTIONS, type BuiltinSectionKey, type Resume } from "@/lib/schema/resume";

export type CustomSectionKey = `custom:${string}`;
export type SectionKey = BuiltinSectionKey | CustomSectionKey;

const CUSTOM_PREFIX = "custom:";

export const customSectionKey = (id: string): CustomSectionKey => `${CUSTOM_PREFIX}${id}`;

export const isCustomSectionKey = (key: string): key is CustomSectionKey => key.startsWith(CUSTOM_PREFIX);

export const customSectionIdFromKey = (key: CustomSectionKey) => key.slice(CUSTOM_PREFIX.length);

/**
 * Kayıtlı sırayı mevcut bölümlerle uzlaştırır: silinmiş özel bölümler atılır,
 * yeni eklenenler (veya eski kayıtlarda olmayan yerleşik bölümler) sona eklenir.
 */
export function resolveSectionOrder(resume: Resume): SectionKey[] {
  const available: SectionKey[] = [
    ...BUILTIN_SECTIONS,
    ...resume.customSections.map((section) => customSectionKey(section.id)),
  ];
  const availableSet = new Set<string>(available);
  const ordered = [...new Set(resume.sectionOrder)].filter((key): key is SectionKey => availableSet.has(key));
  const missing = available.filter((key) => !ordered.includes(key));
  return [...ordered, ...missing];
}
