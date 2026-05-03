export const LANGUAGES = [
  { code: "", label: "English" },
  { code: "it", label: "Italiano" },
  { code: "ro", label: "Română" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "nl", label: "Nederlands" },
  { code: "pl", label: "Polski" },
  { code: "cs", label: "Čeština" },
  { code: "fi", label: "Suomi" },
  { code: "sv", label: "Svenska" },
  { code: "no", label: "Norsk" },
  { code: "da", label: "Dansk" },
  { code: "hu", label: "Magyar" },
  { code: "ru", label: "Русский" },
  { code: "uk", label: "Українська" },
  { code: "el", label: "Ελληνικά" },
  { code: "he", label: "עברית" },
  { code: "ar", label: "العربية" },
  { code: "tr", label: "Türkçe" },
  { code: "fa", label: "فارسی" },
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
  { code: "zh-CN", label: "中文 (简体)" },
  { code: "zh-TW", label: "中文 (繁體)" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "th", label: "ภาษาไทย" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "ms", label: "Bahasa Melayu" },
  { code: "sw", label: "Kiswahili" },
];

export function getCurrentLang() {
  const m = document.cookie.match(/googtrans=\/en\/([^;]+)/);
  if (!m) return "English";
  const found = LANGUAGES.find(l => l.code === m[1]);
  return found ? found.label : "English";
}

export function setLang(code) {
  if (!code) {
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
  } else {
    const val = "/en/" + code;
    document.cookie = "googtrans=" + val + "; path=/";
    document.cookie = "googtrans=" + val + "; path=/; domain=" + window.location.hostname;
  }
  window.location.href = window.location.pathname + window.location.search;
}

export function injectGoogleTranslate() {
  if (window.google && window.google.translate) return;
  if (document.getElementById("gt-script")) return;
  window.googleTranslateElementInit = function () {
    new window.google.translate.TranslateElement(
      { pageLanguage: "en", autoDisplay: false },
      "gt-hidden"
    );
  };
  const s = document.createElement("script");
  s.id = "gt-script";
  s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  document.body.appendChild(s);
  if (!document.getElementById("gt-hidden")) {
    const div = document.createElement("div");
    div.id = "gt-hidden";
    div.style.display = "none";
    document.body.appendChild(div);
  }
}
