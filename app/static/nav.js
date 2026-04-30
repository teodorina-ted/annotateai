// THEME
(function() {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute("data-theme", saved || (prefersDark ? "dark" : "light"));
})();

const LANGUAGES = [
  {code:"",label:"English (Original)"},{code:"it",label:"Italiano"},
  {code:"ro",label:"Romana"},{code:"es",label:"Espanol"},
  {code:"fr",label:"Francais"},{code:"de",label:"Deutsch"},
  {code:"pt",label:"Portugues"},{code:"nl",label:"Nederlands"},
  {code:"pl",label:"Polski"},{code:"cs",label:"Cestina"},
  {code:"fi",label:"Suomi"},{code:"sv",label:"Svenska"},
  {code:"no",label:"Norsk"},{code:"da",label:"Dansk"},
  {code:"hu",label:"Magyar"},{code:"uk",label:"Ukrainska"},
  {code:"ru",label:"Russki"},{code:"el",label:"Ellinika"},
  {code:"he",label:"Ivrit"},{code:"ar",label:"Arabiya"},
  {code:"tr",label:"Turkce"},{code:"hi",label:"Hindi"},
  {code:"zh-CN",label:"Zhongwen"},{code:"ja",label:"Nihongo"},
  {code:"ko",label:"Hangugeo"},{code:"th",label:"Thai"},
  {code:"vi",label:"Tieng Viet"},{code:"id",label:"Bahasa Indonesia"},
  {code:"fa",label:"Farsi"},{code:"bn",label:"Bangla"},
  {code:"sw",label:"Kiswahili"},{code:"ms",label:"Bahasa Melayu"}
];

function googleTranslateElementInit() {
  new google.translate.TranslateElement({pageLanguage:"en",autoDisplay:false}, "gt-hidden");
}

function translatePage(code) {
  closeLangDropdown();
  if (!code) {
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + location.hostname;
    location.reload();
    return;
  }
  const val = "/en/" + code;
  document.cookie = "googtrans=" + val + "; path=/";
  document.cookie = "googtrans=" + val + "; path=/; domain=" + location.hostname;
  location.reload();
}

function getCurrentLang() {
  const m = document.cookie.match(/googtrans=\/en\/([^;]+)/);
  return m ? m[1].toUpperCase().substring(0,2) : "EN";
}

function getTheme() { return document.documentElement.getAttribute("data-theme") || "light"; }

function toggleTheme() {
  const next = getTheme() === "dark" ? "light" : "dark";
  localStorage.setItem("theme", next);
  document.documentElement.setAttribute("data-theme", next);
  updateThemeIcon();
}

function updateThemeIcon() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.innerHTML = getTheme() === "dark"
    ? "<span class=\"material-symbols-outlined\" style=\"font-size:20px;vertical-align:middle\">light_mode</span>"
    : "<span class=\"material-symbols-outlined\" style=\"font-size:20px;vertical-align:middle\">dark_mode</span>";
}

function toggleLangDropdown(e) {
  e && e.stopPropagation();
  const dd = document.getElementById("lang-dropdown");
  if (!dd) return;
  dd.style.display = dd.style.display === "block" ? "none" : "block";
}

function closeLangDropdown() {
  const dd = document.getElementById("lang-dropdown");
  if (dd) dd.style.display = "none";
}

function toggleBurger(e) {
  e && e.stopPropagation();
  const m = document.getElementById("burger-menu");
  if (!m) return;
  m.style.display = m.style.display === "flex" ? "none" : "flex";
}

function closeBurger() {
  const m = document.getElementById("burger-menu");
  if (m) m.style.display = "none";
}

document.addEventListener("click", function() { closeLangDropdown(); closeBurger(); });

function logout() { localStorage.clear(); window.location.href = "/auth"; }

function renderNav() {
  const username = localStorage.getItem("username");
  const showUser = username && username !== "Guest" ? username : "";
  const p = window.location.pathname;
  const lang = getCurrentLang();

  const nav = document.getElementById("shared-nav");
  if (nav) nav.innerHTML =
    "<div style=\"display:flex;align-items:center;gap:8px\">" +
      "<div style=\"position:relative\" onclick=\"event.stopPropagation()\">" +
        "<button onclick=\"toggleBurger(event)\" style=\"background:none;border:none;cursor:pointer;color:var(--text-muted);display:flex;align-items:center;padding:6px;border-radius:8px\">" +
          "<span class=\"material-symbols-outlined\" style=\"font-size:20px\">menu</span>" +
        "</button>" +
        "<div id=\"burger-menu\" style=\"display:none;flex-direction:column;position:absolute;top:calc(100% + 10px);left:0;z-index:500;min-width:210px;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.2);background:var(--bg2);border:1px solid var(--border);padding:8px\">" +
          "<a href=\"/home\" style=\"display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;text-decoration:none;color:var(--text);font-size:14px\" onmouseover=\"this.style.background=\'rgba(0,102,204,0.07)'\" onmouseout=\"this.style.background=\'none'\">" +
            "<span class=\"material-symbols-outlined\" style=\"font-size:17px;color:var(--accent)\">home</span>Dashboard" +
          "</a>" +
          "<a href=\"/import\" style=\"display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;text-decoration:none;color:var(--text);font-size:14px\" onmouseover=\"this.style.background=\'rgba(0,102,204,0.07)'\" onmouseout=\"this.style.background=\'none'\">" +
            "<span class=\"material-symbols-outlined\" style=\"font-size:17px;color:var(--accent)\">link</span>Import URL" +
          "</a>" +
          "<a href=\"/#contact\" style=\"display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;text-decoration:none;color:var(--text);font-size:14px\" onmouseover=\"this.style.background=\'rgba(0,102,204,0.07)'\" onmouseout=\"this.style.background=\'none'\">" +
            "<span class=\"material-symbols-outlined\" style=\"font-size:17px;color:var(--accent)\">mail</span>Contact" +
          "</a>" +
          "<div style=\"height:1px;background:var(--border);margin:6px 8px\"></div>" +
          (showUser
            ? "<button onclick=\"logout()\" style=\"display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;border:none;background:none;cursor:pointer;color:#FF3B30;font-size:14px;font-family:inherit;width:100%\"><span class=\"material-symbols-outlined\" style=\"font-size:17px\">logout</span>Sign out</button>"
            : "<a href=\"/auth\" style=\"display:flex;align-items:center;justify-content:center;padding:11px 14px;border-radius:10px;text-decoration:none;background:var(--accent);color:white;font-size:14px;font-weight:600;margin-top:2px\">Sign In</a>") +
        "</div>" +
      "</div>" +
      "<a href=\"/\" style=\"display:flex;align-items:center;gap:6px;text-decoration:none;color:var(--text);font-size:17px;font-weight:600;letter-spacing:-0.01em\">" +
        "<span class=\"material-symbols-outlined\" style=\"color:var(--accent);font-size:20px\">bubble_chart</span>AnnotateAI" +
      "</a>" +
    "</div>" +
    "<div style=\"display:flex;align-items:center;gap:8px\">" +
      (showUser ? "<span style=\"font-size:12px;color:var(--text-muted)\">" + showUser + "</span>" : "") +
      "<button onclick=\"toggleTheme()\" id=\"theme-toggle\" style=\"background:none;border:none;cursor:pointer;color:var(--text-muted);display:flex;align-items:center;padding:6px;border-radius:8px\"></button>" +
      "<div style=\"position:relative\" onclick=\"event.stopPropagation()\">" +
        "<button onclick=\"toggleLangDropdown(event)\" style=\"background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:12px;font-weight:700;font-family:inherit;letter-spacing:0.08em;padding:4px 2px;display:flex;align-items:center;gap:1px\">" +
          "<span id=\"lang-display\">" + lang + "</span>" +
          "<span class=\"material-symbols-outlined\" style=\"font-size:13px;vertical-align:middle\">expand_more</span>" +
        "</button>" +
        "<div id=\"lang-dropdown\" style=\"display:none;position:absolute;top:calc(100% + 8px);right:0;z-index:500;width:190px;border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,0.2);background:var(--bg2);border:1px solid var(--border);overflow-y:auto;max-height:300px\">" +
          LANGUAGES.map(function(l) {
            return "<button onclick=\"translatePage(\'" + l.code + "\')\" style=\"display:block;width:100%;padding:9px 16px;text-align:left;background:none;border:none;cursor:pointer;font-size:13px;font-family:inherit;color:var(--text)\" onmouseover=\"this.style.background=\'rgba(0,102,204,0.07)'\" onmouseout=\"this.style.background=\'none'\">" + l.label + "</button>";
          }).join("") +
        "</div>" +
      "</div>" +
    "</div>";

  const bottom = document.getElementById("shared-bottom-nav");
  if (bottom) bottom.innerHTML =
    "<a href=\"/home\" style=\"color:" + (p==="/home"?"var(--accent)":"var(--text-muted)") + "\">" +
      "<span class=\"material-symbols-outlined\" style=\"font-size:22px\">home</span><span>Home</span>" +
    "</a>" +
    "<a href=\"/history-page\" style=\"color:" + (p==="/history-page"?"var(--accent)":"var(--text-muted)") + "\">" +
      "<span class=\"material-symbols-outlined\" style=\"font-size:22px\">database</span><span>History</span>" +
    "</a>" +
    "<a href=\"/import\" style=\"color:" + (p==="/import"?"var(--accent)":"var(--text-muted)") + "\">" +
      "<span class=\"material-symbols-outlined\" style=\"font-size:22px\">link</span><span>Import</span>" +
    "</a>" +
    "<a href=\"/profile\" style=\"color:" + (p==="/profile"?"var(--accent)":"var(--text-muted)") + "\">" +
      "<span class=\"material-symbols-outlined\" style=\"font-size:22px\">person</span><span>Profile</span>" +
    "</a>";

  updateThemeIcon();
}

document.addEventListener("DOMContentLoaded", renderNav);
