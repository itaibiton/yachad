// Top 30 countries where Israelis might be stranded — sorted by travel frequency
export interface Country {
  code: string;
  name: string;
  nameHe: string;
  flag: string;
  embassyPhone?: string;
}

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", nameHe: "ארצות הברית", flag: "🇺🇸", embassyPhone: "+1-202-364-5500" },
  { code: "DE", name: "Germany", nameHe: "גרמניה", flag: "🇩🇪", embassyPhone: "+49-30-8904-5000" },
  { code: "FR", name: "France", nameHe: "צרפת", flag: "🇫🇷", embassyPhone: "+33-1-4076-5500" },
  { code: "GB", name: "United Kingdom", nameHe: "בריטניה", flag: "🇬🇧", embassyPhone: "+44-20-7957-9500" },
  { code: "TR", name: "Turkey", nameHe: "טורקיה", flag: "🇹🇷", embassyPhone: "+90-312-446-3600" },
  { code: "GR", name: "Greece", nameHe: "יוון", flag: "🇬🇷", embassyPhone: "+30-210-671-9500" },
  { code: "TH", name: "Thailand", nameHe: "תאילנד", flag: "🇹🇭", embassyPhone: "+66-2-204-9200" },
  { code: "IN", name: "India", nameHe: "הודו", flag: "🇮🇳", embassyPhone: "+91-11-3041-4500" },
  { code: "IT", name: "Italy", nameHe: "איטליה", flag: "🇮🇹", embassyPhone: "+39-06-3619-8500" },
  { code: "ES", name: "Spain", nameHe: "ספרד", flag: "🇪🇸", embassyPhone: "+34-91-782-9600" },
  { code: "PT", name: "Portugal", nameHe: "פורטוגל", flag: "🇵🇹", embassyPhone: "+351-21-792-8500" },
  { code: "NL", name: "Netherlands", nameHe: "הולנד", flag: "🇳🇱", embassyPhone: "+31-70-376-0500" },
  { code: "CH", name: "Switzerland", nameHe: "שוויץ", flag: "🇨🇭", embassyPhone: "+41-31-356-3500" },
  { code: "AT", name: "Austria", nameHe: "אוסטריה", flag: "🇦🇹", embassyPhone: "+43-1-476-4655" },
  { code: "PL", name: "Poland", nameHe: "פולין", flag: "🇵🇱", embassyPhone: "+48-22-500-9500" },
  { code: "CZ", name: "Czech Republic", nameHe: "צ'כיה", flag: "🇨🇿", embassyPhone: "+420-233-097-500" },
  { code: "HU", name: "Hungary", nameHe: "הונגריה", flag: "🇭🇺", embassyPhone: "+36-1-200-0781" },
  { code: "RO", name: "Romania", nameHe: "רומניה", flag: "🇷🇴", embassyPhone: "+40-21-202-9500" },
  { code: "BG", name: "Bulgaria", nameHe: "בולגריה", flag: "🇧🇬", embassyPhone: "+359-2-858-9900" },
  { code: "HR", name: "Croatia", nameHe: "קרואטיה", flag: "🇭🇷", embassyPhone: "+385-1-4896-500" },
  { code: "CA", name: "Canada", nameHe: "קנדה", flag: "🇨🇦", embassyPhone: "+1-613-567-6450" },
  { code: "AU", name: "Australia", nameHe: "אוסטרליה", flag: "🇦🇺", embassyPhone: "+61-2-6215-4500" },
  { code: "BR", name: "Brazil", nameHe: "ברזיל", flag: "🇧🇷", embassyPhone: "+55-61-2105-0500" },
  { code: "MX", name: "Mexico", nameHe: "מקסיקו", flag: "🇲🇽", embassyPhone: "+52-55-5201-1500" },
  { code: "AR", name: "Argentina", nameHe: "ארגנטינה", flag: "🇦🇷", embassyPhone: "+54-11-4338-2500" },
  { code: "ZA", name: "South Africa", nameHe: "דרום אפריקה", flag: "🇿🇦", embassyPhone: "+27-12-470-3500" },
  { code: "KE", name: "Kenya", nameHe: "קניה", flag: "🇰🇪", embassyPhone: "+254-20-363-5000" },
  { code: "JP", name: "Japan", nameHe: "יפן", flag: "🇯🇵", embassyPhone: "+81-3-3264-0911" },
  { code: "SG", name: "Singapore", nameHe: "סינגפור", flag: "🇸🇬", embassyPhone: "+65-6235-0100" },
  { code: "AE", name: "UAE", nameHe: "איחוד האמירויות", flag: "🇦🇪", embassyPhone: "+971-2-627-6444" },
];

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}
