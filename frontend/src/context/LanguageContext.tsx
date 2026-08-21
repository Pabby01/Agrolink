import { createContext, useContext, useState, type ReactNode } from "react";

export type Language = "english" | "yoruba" | "igbo" | "hausa";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  english: {
    "nav.dashboard": "Dashboard",
    "nav.marketplace": "Marketplace",
    "nav.orders": "Orders",
    "nav.deliveries": "Deliveries",
    "nav.trust": "Trust",
    "nav.cropIntel": "Crop Intelligence",
    "nav.notifications": "Notifications",
    "nav.logout": "Log out",
    "common.view": "View",
    "common.order": "Order",
    "common.confirm": "Confirm",
    "common.cancel": "Cancel",
  },
  yoruba: {
    "nav.dashboard": "Páńpẹ̀",
    "nav.marketplace": "Ọjà",
    "nav.orders": "Àwọn ìdásílẹ̀",
    "nav.deliveries": "Gbígbé",
    "nav.trust": "Ìgbẹ́kẹ̀lé",
    "nav.cropIntel": "Ọgbọ́n Àgbè",
    "nav.notifications": "Ìdápọ̀",
    "nav.logout": "Jáde",
    "common.view": "Wo",
    "common.order": "Ra",
    "common.confirm": "Ẹ̀rí",
    "common.cancel": "Para",
  },
  igbo: {
    "nav.dashboard": "Dashboard",
    "nav.marketplace": "Ahịa",
    "nav.orders": "Ndoniwe",
    "nav.deliveries": "Ibuga",
    "nav.trust": "Otúzí",
    "nav.cropIntel": "Amamihe Ihe Ọkụ",
    "nav.notifications": "Ozi",
    "nav.logout": "Pụọ",
    "common.view": "Lee",
    "common.order": "Zụọ",
    "common.confirm": "Kwenye",
    "common.cancel": "Kagbuo",
  },
  hausa: {
    "nav.dashboard": "Dashboard",
    "nav.marketplace": "Kasuwa",
    "nav.orders": "Manhajar Oda",
    "nav.deliveries": "Sufuri",
    "nav.trust": "Gaskiya",
    "nav.cropIntel": "Hikimar Noma",
    "nav.notifications": "Sanarwa",
    "nav.logout": "Fita",
    "common.view": "Duba",
    "common.order": "Sayi",
    "common.confirm": "Tabbatar",
    "common.cancel": "Soke",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("english");
  const t = (key: string) => translations[language][key] ?? translations.english[key] ?? key;
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
