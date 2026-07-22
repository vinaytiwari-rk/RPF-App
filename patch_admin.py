import re

with open('src/pages/AdminDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix settings useEffect
settings_regex = re.compile(r'useEffect\(\(\) => \{\n\s*if \(settings\) \{\n\s*setTollFree\(settings\.tollFree \|\| ""\);\n\s*setWebUrl\(settings\.webUrl \|\| ""\);\n\s*setEmail\(settings\.email \|\| ""\);\n\s*setFounderEn\(settings\.founderMessageEn \|\| ""\);\n\s*setFounderHi\(settings\.founderMessageHi \|\| ""\);\n\s*setFounderImgUrl\(settings\.founderImgUrl \|\| "/assets/founder\.png"\);\n\s*setAlertBannerEn\(settings\.alertBannerEn \|\| ""\);\n\s*setAlertBannerHi\(settings\.alertBannerHi \|\| ""\);\n\s*if \(settings\.carouselSlides\) setCmsSlides\(settings\.carouselSlides\);\n\s*if \(settings\.customServices\) setCustomServices\(settings\.customServices\);\n\s*\}\n\s*\}, \[settings\]\);')

new_settings_effect = """const [settingsLoaded, setSettingsLoaded] = useState(false);
  useEffect(() => {
    if (settings && !settingsLoaded) {
      setTollFree(settings.tollFree || "");
      setWebUrl(settings.webUrl || "");
      setEmail(settings.email || "");
      setFounderEn(settings.founderMessageEn || "");
      setFounderHi(settings.founderMessageHi || "");
      setFounderImgUrl(settings.founderImgUrl || "/assets/founder.png");
      setAlertBannerEn(settings.alertBannerEn || "");
      setAlertBannerHi(settings.alertBannerHi || "");
      if (settings.carouselSlides) setCmsSlides(settings.carouselSlides);
      if (settings.customServices) setCustomServices(settings.customServices);
      setSettingsLoaded(true);
    }
  }, [settings, settingsLoaded]);"""

content = settings_regex.sub(new_settings_effect, content)

# Fix cmsConfig useEffect
cms_regex = re.compile(r'useEffect\(\(\) => \{\n\s*if \(cmsConfig\) \{\n\s*if \(cmsConfig\.founderName\) setFounderName\(cmsConfig\.founderName\);\n\s*if \(cmsConfig\.founderDesignation\) setFounderDesignation\(cmsConfig\.founderDesignation\);\n\s*if \(cmsConfig\.aboutTextEn\) setAboutTextEn\(cmsConfig\.aboutTextEn\);\n\s*if \(cmsConfig\.aboutTextHi\) setAboutTextHi\(cmsConfig\.aboutTextHi\);\n\s*if \(cmsConfig\.logoImgUrl\) setLogoImgUrl\(cmsConfig\.logoImgUrl\);\n\s*\}\n\s*\}, \[cmsConfig\]\);')

new_cms_effect = """const [cmsLoaded, setCmsLoaded] = useState(false);
  useEffect(() => {
    if (cmsConfig && !cmsLoaded) {
      if (cmsConfig.founderName) setFounderName(cmsConfig.founderName);
      if (cmsConfig.founderDesignation) setFounderDesignation(cmsConfig.founderDesignation);
      if (cmsConfig.aboutTextEn) setAboutTextEn(cmsConfig.aboutTextEn);
      if (cmsConfig.aboutTextHi) setAboutTextHi(cmsConfig.aboutTextHi);
      if (cmsConfig.logoImgUrl) setLogoImgUrl(cmsConfig.logoImgUrl);
      setCmsLoaded(true);
    }
  }, [cmsConfig, cmsLoaded]);"""

content = cms_regex.sub(new_cms_effect, content)

# Write back
with open('src/pages/AdminDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched AdminDashboard.tsx")
