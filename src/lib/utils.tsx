export function getTranslation(
  translations: Array<{ language: number; label: string }>,
  language: 'mn' | 'en'
): string {
  const langCode = language === 'mn' ? 1 : 2
  const translation = translations?.find(t => t.language === langCode)
  return translation?.label || ''
}