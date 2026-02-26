/**
 *  ╔═══════════════════════════════════════════════════════════╗
 *  ║  Carousel – Voiceflow Response Extension                  ║
 *  ║  VERSION 5.0 - COMPACT CARD MODE (SaaS Tools)            ║
 *  ║                                                           ║
 *  ║  • Logo inline 36px à côté du titre (plus d'image large) ║
 *  ║  • 2 boutons : Découvrir (lien+interact) + Info (interact)║
 *  ║  • Description étendue (plus d'espace vertical)          ║
 *  ║  • Choix auto showcase (1-2) / gallery (3+)              ║
 *  ║  • Support 2, 3 ou 4 cartes côte à côte (gallery)       ║
 *  ║  • Thème clair ou sombre configurable                    ║
 *  ║  • Détection widget Voiceflow (1 carte forcée)           ║
 *  ║  • Affichage mobile optimisé (1 carte plein écran)       ║
 *  ╚═══════════════════════════════════════════════════════════╝
 */
export const CarouselExtension = {
  name: 'Carousel',
  type: 'response',
  match: ({ trace }) => trace.type === 'ext_carousel' || trace.payload?.name === 'ext_carousel',
  render: ({ trace, element }) => {
    try {
      const {
        items = [],
        title = null,
        brandColor = '#C3002F',
        brandColor2 = null,
        backgroundImage = null,
        autoplay = false,
        autoplayDelay = 3000,
        maxDescriptionLength = 250,
        instanceId = null,
        userMessageText = null,
        displayMode = null,
        cardsPerView = null,
        theme = 'light',
        // ✅ v5.0: Nouveau — bouton 2
        button2Text = '🤔 Pourquoi cet outil ?',
        button2MessageTemplate = 'Pourquoi {title} ?'
      } = trace.payload;

      // Validation
      if (!items.length || items.length > 10) {
        console.error('❌ Carousel: 1-10 items requis');
        return;
      }

      // ✅ DÉTECTION WIDGET VOICEFLOW
      const isInWidget = () => {
        if (window.self !== window.top) return true;
        const parentWidth = element.parentElement?.offsetWidth || window.innerWidth;
        return parentWidth < 500;
      };

      // ✅ CHOIX AUTOMATIQUE DU MODE selon le contexte
      let mode = displayMode;
      let slidesPerView = cardsPerView;

      if (!mode || !slidesPerView) {
        if (isInWidget()) {
          mode = 'showcase';
          slidesPerView = 1;
        } else if (items.length <= 2) {
          mode = 'showcase';
          slidesPerView = 1;
        } else if (items.length <= 3) {
          mode = 'gallery';
          slidesPerView = 2;
        } else if (items.length <= 5) {
          mode = 'gallery';
          slidesPerView = 3;
        } else {
          mode = 'gallery';
          slidesPerView = 4;
        }
      }

      // Validation du mode
      const validModes = ['showcase', 'gallery'];
      mode = validModes.includes(mode) ? mode : 'showcase';
      slidesPerView = mode === 'gallery' ? Math.min(4, Math.max(2, slidesPerView)) : 1;

      // ✅ FORCER showcase dans le widget
      if (isInWidget()) {
        mode = 'showcase';
        slidesPerView = 1;
        console.log('🔧 Widget détecté - Forçage mode showcase (1 carte)');
      }

      // Identifiant unique
      const uniqueId = instanceId || `carousel_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Utilitaires couleur
      const hexToRgb = (hex) => {
        const num = parseInt(hex.replace('#', ''), 16);
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
      };
      const lightenColor = (hex, percent) => {
        const { r, g, b } = hexToRgb(hex);
        const nR = Math.min(255, Math.floor(r + (255 - r) * percent));
        const nG = Math.min(255, Math.floor(g + (255 - g) * percent));
        const nB = Math.min(255, Math.floor(b + (255 - b) * percent));
        return `#${nR.toString(16).padStart(2,'0')}${nG.toString(16).padStart(2,'0')}${nB.toString(16).padStart(2,'0')}`;
      };
      const darkenColor = (hex, percent) => {
        const { r, g, b } = hexToRgb(hex);
        const nR = Math.floor(r * (1 - percent));
        const nG = Math.floor(g * (1 - percent));
        const nB = Math.floor(b * (1 - percent));
        return `#${nR.toString(16).padStart(2,'0')}${nG.toString(16).padStart(2,'0')}${nB.toString(16).padStart(2,'0')}`;
      };

      // Fix URL Imgur
      const fixImgurUrl = (url) => {
        if (!url) return url;
        return url.replace(/^https?:\/\/imgur\.com\/([a-zA-Z0-9]+\.[a-zA-Z]+)$/, 'https://i.imgur.com/$1');
      };

      // Couleurs
      const color1 = brandColor;
      const color2 = brandColor2 || darkenColor(brandColor, 0.3);
      const { r: r1, g: g1, b: b1 } = hexToRgb(color1);
      const { r: r2, g: g2, b: b2 } = hexToRgb(color2);
      const lightColor = lightenColor(color1, 0.3);
      const darkColor = darkenColor(color1, 0.2);

      // ✅ VARIABLES DE THÈME
      const themeVars = theme === 'light' ? {
        containerBg: 'rgba(255, 255, 255, 0.98)',
        containerBorder: 'rgba(0, 0, 0, 0.08)',
        containerShadow: '0 15px 50px rgba(0, 0, 0, 0.08)',
        overlayBg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 100%)',
        backgroundOpacity: '0.15',
        backgroundBrightness: '1.1',
        imageBackgroundOpacity: '0.3',
        titleBg: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1a1a1a',
        titleBorder: 'rgba(0, 0, 0, 0.1)',
        titleShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        titleTextShadow: 'none',
        navBtnBg: 'rgba(255, 255, 255, 0.95)',
        navBtnBorder: 'rgba(0, 0, 0, 0.15)',
        navBtnColor: color1,
        navBtnHoverBg: color1,
        navBtnHoverColor: '#ffffff',
        navBtnShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        dotBg: 'rgba(0, 0, 0, 0.2)',
        dotBorder: 'rgba(0, 0, 0, 0.3)',
        dotHoverBg: 'rgba(0, 0, 0, 0.4)',
        dotActiveBg: color1,
        dotActiveBorder: color1,
        dotGlow: `0 0 15px rgba(${r1}, ${g1}, ${b1}, 0.5)`
      } : {
        containerBg: 'rgba(0, 0, 0, 0.3)',
        containerBorder: 'rgba(255, 255, 255, 0.1)',
        containerShadow: '0 15px 50px rgba(0, 0, 0, 0.3)',
        overlayBg: 'linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.3) 100%)',
        backgroundOpacity: '1',
        backgroundBrightness: '0.7',
        imageBackgroundOpacity: '0.9',
        titleBg: 'rgba(0, 0, 0, 0.7)',
        titleColor: '#ffffff',
        titleBorder: 'rgba(255, 255, 255, 0.2)',
        titleShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
        titleTextShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
        navBtnBg: 'rgba(0, 0, 0, 0.6)',
        navBtnBorder: 'rgba(255, 255, 255, 0.8)',
        navBtnColor: '#fff',
        navBtnHoverBg: 'rgba(255, 255, 255, 0.9)',
        navBtnHoverColor: color1,
        navBtnShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
        dotBg: 'rgba(255, 255, 255, 0.3)',
        dotBorder: 'rgba(255, 255, 255, 0.6)',
        dotHoverBg: 'rgba(255, 255, 255, 0.6)',
        dotActiveBg: 'rgba(255, 255, 255, 0.95)',
        dotActiveBorder: 'rgba(255, 255, 255, 1)',
        dotGlow: '0 0 15px rgba(255, 255, 255, 0.5)'
      };

      // Container principal
      const container = document.createElement('div');
      container.className = 'vf-carousel-container';
      container.id = uniqueId;
      container.setAttribute('data-items-count', items.length);
      container.setAttribute('data-has-background', backgroundImage ? 'true' : 'false');
      container.setAttribute('data-display-mode', mode);
      container.setAttribute('data-cards-per-view', slidesPerView);
      container.setAttribute('data-theme', theme);
      container.setAttribute('data-in-widget', isInWidget() ? 'true' : 'false');

      // CSS
      const styleEl = document.createElement('style');
      styleEl.textContent = `
/* ═══════════════════════════════════════════════════════════ */
/* CONTENEUR PARENT VOICEFLOW                                  */
/* ═══════════════════════════════════════════════════════════ */
.vfrc-message--extension-Carousel {
  padding: 0 !important;
  margin: 12px 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  overflow: visible !important;
  box-sizing: border-box !important;
  position: relative !important;
  display: block !important;
}
.vfrc-message--extension-Carousel > span {
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  overflow: visible !important;
  position: relative !important;
}
/* ═══════════════════════════════════════════════════════════ */
/* VARIABLES CSS                                               */
/* ═══════════════════════════════════════════════════════════ */
.vf-carousel-container {
  --color-1: ${color1};
  --color-2: ${color2};
  --rgb-1: ${r1}, ${g1}, ${b1};
  --rgb-2: ${r2}, ${g2}, ${b2};
  --color-light: ${lightColor};
  --color-dark: ${darkColor};
  --border-radius: 20px;
  --card-radius: 16px;
  --transition-smooth: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-bounce: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  --shadow-soft: 0 10px 40px rgba(0, 0, 0, 0.15);
  --shadow-strong: 0 20px 60px rgba(0, 0, 0, 0.3);
  --glow-color: rgba(var(--rgb-1), 0.5);
}
/* ═══════════════════════════════════════════════════════════ */
/* CONTAINER PRINCIPAL                                         */
/* ═══════════════════════════════════════════════════════════ */
.vf-carousel-container {
  position: relative !important;
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 20px !important;
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  border-radius: var(--border-radius);
  overflow: visible !important;
  box-sizing: border-box !important;
  display: block !important;
  z-index: 1 !important;
  box-shadow: ${themeVars.containerShadow}, 0 0 0 1px ${themeVars.containerBorder};
}
.vf-carousel-container[data-in-widget="true"] {
  padding: 16px !important;
  border-radius: 16px;
}
@media (max-width: 768px) {
  .vf-carousel-container {
    padding: 12px !important;
    border-radius: 16px;
  }
}
/* Fond dégradé (pas d'image) */
.vf-carousel-container[data-has-background="false"]::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: var(--border-radius);
  background: linear-gradient(135deg, var(--color-1) 0%, var(--color-2) 100%);
  z-index: -2;
  opacity: ${themeVars.backgroundOpacity};
}
/* Fond image */
.vf-carousel-container[data-has-background="true"]::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: var(--border-radius);
  background-image: url('${backgroundImage}');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(12px) brightness(${themeVars.backgroundBrightness});
  transform: scale(1.1);
  z-index: -2;
  opacity: ${themeVars.imageBackgroundOpacity};
}
/* Overlay */
.vf-carousel-container::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: var(--border-radius);
  background: ${themeVars.overlayBg};
  z-index: -1;
}
.vf-carousel-container[data-in-widget="true"]::before,
.vf-carousel-container[data-in-widget="true"]::after {
  border-radius: 16px;
}
@media (max-width: 768px) {
  .vf-carousel-container[data-has-background="false"]::before,
  .vf-carousel-container[data-has-background="true"]::before,
  .vf-carousel-container::after {
    border-radius: 16px;
  }
}
/* ═══════════════════════════════════════════════════════════ */
/* TITRE                                                       */
/* ═══════════════════════════════════════════════════════════ */
.vf-carousel-title {
  position: relative;
  z-index: 2;
  text-align: center;
  margin: 0 0 20px 0;
  padding: 16px 24px;
  font-size: 22px;
  font-weight: 900;
  color: ${themeVars.titleColor};
  letter-spacing: -0.3px;
  line-height: 1.2;
  background: ${themeVars.titleBg};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 2px solid ${themeVars.titleBorder};
  box-shadow: ${themeVars.titleShadow}, inset 0 1px 0 rgba(255,255,255,0.1);
  text-shadow: ${themeVars.titleTextShadow};
}
.vf-carousel-container[data-in-widget="true"] .vf-carousel-title {
  font-size: 18px;
  padding: 12px 16px;
  margin-bottom: 16px;
  border-radius: 10px;
}
@media (max-width: 768px) {
  .vf-carousel-title {
    font-size: 16px;
    padding: 12px 16px;
    margin-bottom: 12px;
    border-radius: 10px;
  }
}
/* ═══════════════════════════════════════════════════════════ */
/* VIEWPORT & TRACK                                            */
/* ═══════════════════════════════════════════════════════════ */
.vf-carousel-viewport {
  position: relative;
  overflow: hidden;
  border-radius: var(--card-radius);
  margin-bottom: 16px;
  width: 100%;
  box-sizing: border-box;
}
@media (max-width: 768px) {
  .vf-carousel-viewport {
    border-radius: 12px;
    margin-bottom: 12px;
  }
}
.vf-carousel-container[data-in-widget="true"] .vf-carousel-viewport {
  border-radius: 12px;
  margin-bottom: 12px;
}
.vf-carousel-track {
  display: flex;
  gap: 16px;
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
  width: 100%;
  box-sizing: border-box;
}
.vf-carousel-container[data-in-widget="true"] .vf-carousel-track {
  gap: 0;
}
@media (max-width: 768px) {
  .vf-carousel-track {
    gap: 12px;
  }
}
/* ═══════════════════════════════════════════════════════════ */
/* CARTES - SIZING PAR MODE                                    */
/* ═══════════════════════════════════════════════════════════ */
/* Showcase: 1 carte pleine largeur */
.vf-carousel-container[data-display-mode="showcase"] .vf-carousel-card {
  flex: 0 0 100% !important;
  min-width: 100% !important;
  max-width: 100% !important;
}
/* Gallery 2 cartes */
.vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="2"] .vf-carousel-card {
  flex: 0 0 calc((100% - 16px) / 2) !important;
  min-width: calc((100% - 16px) / 2) !important;
  max-width: calc((100% - 16px) / 2) !important;
}
/* Gallery 3 cartes */
.vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="3"] .vf-carousel-card {
  flex: 0 0 calc((100% - 32px) / 3) !important;
  min-width: calc((100% - 32px) / 3) !important;
  max-width: calc((100% - 32px) / 3) !important;
}
/* Gallery 4 cartes */
.vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="4"] .vf-carousel-card {
  flex: 0 0 calc((100% - 48px) / 4) !important;
  min-width: calc((100% - 48px) / 4) !important;
  max-width: calc((100% - 48px) / 4) !important;
}
/* Widget: toujours 1 carte */
.vf-carousel-container[data-in-widget="true"] .vf-carousel-card {
  flex: 0 0 100% !important;
  min-width: 100% !important;
  max-width: 100% !important;
}
/* Mobile: toujours 1 carte */
@media (max-width: 768px) {
  .vf-carousel-container[data-display-mode="showcase"] .vf-carousel-card,
  .vf-carousel-container[data-display-mode="gallery"] .vf-carousel-card,
  .vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="2"] .vf-carousel-card,
  .vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="3"] .vf-carousel-card,
  .vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="4"] .vf-carousel-card,
  .vf-carousel-card {
    flex: 0 0 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
  }
}
/* ═══════════════════════════════════════════════════════════ */
/* ✅ v5.0 : CARTES COMPACTES (SANS IMAGE LARGE)              */
/* ═══════════════════════════════════════════════════════════ */
.vf-carousel-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: var(--card-radius);
  border: 2px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: var(--transition-bounce);
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.08),
    0 2px 6px rgba(0, 0, 0, 0.04);
}
/* ✅ Force equal height across all cards in a row */
.vf-carousel-track {
  align-items: stretch;
}
@media (max-width: 768px) {
  .vf-carousel-card {
    border-radius: 12px;
  }
}
.vf-carousel-container[data-in-widget="true"] .vf-carousel-card {
  border-radius: 12px;
}
@media (min-width: 769px) {
  .vf-carousel-card:hover {
    transform: translateY(-4px);
    border-color: rgba(var(--rgb-1), 0.3);
    box-shadow:
      0 12px 32px rgba(0, 0, 0, 0.12),
      0 4px 12px rgba(0, 0, 0, 0.06);
  }
  .vf-carousel-container[data-in-widget="true"] .vf-carousel-card:hover {
    transform: none;
  }
}
/* ═══════════════════════════════════════════════════════════ */
/* ✅ v5.0 : HEADER = LOGO INLINE + TITRE                     */
/* ═══════════════════════════════════════════════════════════ */
.vf-carousel-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 16px 0 16px;
}
.vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="3"] .vf-carousel-card-header,
.vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="4"] .vf-carousel-card-header {
  gap: 10px;
  padding: 14px 14px 0 14px;
}
.vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="4"] .vf-carousel-card-header {
  padding: 12px 12px 0 12px;
}
.vf-carousel-card-logo {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 10px;
  object-fit: contain;
  background: #f5f5f5;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 4px;
  box-sizing: border-box;
}
.vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="4"] .vf-carousel-card-logo {
  width: 30px;
  height: 30px;
  min-width: 30px;
  border-radius: 8px;
  padding: 3px;
}
.vf-carousel-card-logo-fallback {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--color-1), var(--color-2));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  color: white;
  box-sizing: border-box;
}
.vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="4"] .vf-carousel-card-logo-fallback {
  width: 30px;
  height: 30px;
  min-width: 30px;
  border-radius: 8px;
  font-size: 13px;
}
.vf-carousel-card-title {
  font-size: 17px;
  font-weight: 800;
  color: #1a1a1a;
  line-height: 1.3;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
.vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="2"] .vf-carousel-card-title {
  font-size: 16px;
}
.vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="3"] .vf-carousel-card-title {
  font-size: 14px;
}
.vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="4"] .vf-carousel-card-title {
  font-size: 13px;
  -webkit-line-clamp: 1;
}
.vf-carousel-container[data-in-widget="true"] .vf-carousel-card-title {
  font-size: 16px;
}
@media (max-width: 768px) {
  .vf-carousel-card-title {
    font-size: 16px;
  }
}
/* ═══════════════════════════════════════════════════════════ */
/* ✅ v5.0 : CONTENU (description + boutons)                   */
/* ═══════════════════════════════════════════════════════════ */
.vf-carousel-content {
  padding: 12px 16px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}
.vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="3"] .vf-carousel-content {
  padding: 10px 14px 14px 14px;
  gap: 10px;
}
.vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="4"] .vf-carousel-content {
  padding: 8px 12px 12px 12px;
  gap: 8px;
}
.vf-carousel-container[data-in-widget="true"] .vf-carousel-content {
  padding: 12px 16px 16px 16px;
  gap: 10px;
}
@media (max-width: 768px) {
  .vf-carousel-content {
    padding: 12px 16px 16px 16px;
    gap: 10px;
  }
}
/* ═══════════════════════════════════════════════════════════ */
/* ✅ v5.0 : DESCRIPTION STRUCTURÉE (split par •)             */
/* ═══════════════════════════════════════════════════════════ */
.vf-carousel-description {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
  flex: 1;
}
.vf-carousel-desc-line {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 12.5px;
  color: #444;
  line-height: 1.4;
}
.vf-carousel-desc-line:first-child {
  font-weight: 700;
  color: var(--color-1);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.vf-carousel-desc-line:nth-child(2) {
  font-weight: 700;
  color: #1a1a1a;
  font-size: 13px;
}
.vf-carousel-desc-dot {
  width: 5px;
  height: 5px;
  min-width: 5px;
  border-radius: 50%;
  background: var(--color-1);
  opacity: 0.4;
  margin-top: 2px;
}
.vf-carousel-desc-line:first-child .vf-carousel-desc-dot,
.vf-carousel-desc-line:nth-child(2) .vf-carousel-desc-dot {
  display: none;
}
.vf-carousel-desc-freemium {
  display: inline-block;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white !important;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  margin-top: 2px;
}
/* Showcase */
.vf-carousel-container[data-display-mode="showcase"] .vf-carousel-desc-line {
  font-size: 14px;
}
.vf-carousel-container[data-display-mode="showcase"] .vf-carousel-desc-line:first-child {
  font-size: 12px;
}
/* Gallery 2 */
.vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="2"] .vf-carousel-desc-line {
  font-size: 12.5px;
}
/* Gallery 3 */
.vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="3"] .vf-carousel-desc-line {
  font-size: 11.5px;
}
.vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="3"] .vf-carousel-desc-line:first-child {
  font-size: 10px;
}
/* Gallery 4 */
.vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="4"] .vf-carousel-desc-line {
  font-size: 11px;
  gap: 4px;
}
.vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="4"] .vf-carousel-desc-line:first-child {
  font-size: 9.5px;
}
.vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="4"] .vf-carousel-desc-dot {
  width: 4px;
  height: 4px;
  min-width: 4px;
}
.vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="4"] .vf-carousel-description {
  gap: 3px;
}
/* Widget */
.vf-carousel-container[data-in-widget="true"] .vf-carousel-desc-line {
  font-size: 13px !important;
}
@media (max-width: 768px) {
  .vf-carousel-desc-line {
    font-size: 13px;
  }
}
/* ═══════════════════════════════════════════════════════════ */
/* ✅ v5.0 : CONTENEUR 2 BOUTONS                              */
/* ═══════════════════════════════════════════════════════════ */
.vf-carousel-buttons {
  display: flex;
  gap: 8px;
  margin-top: auto;
}
.vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="4"] .vf-carousel-buttons {
  flex-direction: column;
  gap: 6px;
}
@media (max-width: 768px) {
  .vf-carousel-buttons {
    flex-direction: row;
    gap: 8px;
  }
}
.vf-carousel-container[data-in-widget="true"] .vf-carousel-buttons {
  flex-direction: row;
  gap: 8px;
}

/* ═══════════════════════════════════════════════════════════ */
/* BOUTON PRIMAIRE (Découvrir — lien + interact)               */
/* ═══════════════════════════════════════════════════════════ */
.vf-carousel-btn-primary {
  flex: 1;
  background: linear-gradient(135deg, var(--color-1), var(--color-2));
  color: white !important;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  transition: var(--transition-smooth);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 3px 12px rgba(var(--rgb-1), 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 40px;
  white-space: nowrap;
}
@media (min-width: 769px) {
  .vf-carousel-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(var(--rgb-1), 0.5);
  }
  .vf-carousel-container[data-in-widget="true"] .vf-carousel-btn-primary:hover {
    transform: none;
  }
}
.vf-carousel-btn-primary:active {
  transform: translateY(0);
}
.vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="4"] .vf-carousel-btn-primary {
  padding: 8px 10px;
  font-size: 10px;
  min-height: 34px;
  letter-spacing: 0.3px;
}
.vf-carousel-container[data-in-widget="true"] .vf-carousel-btn-primary {
  padding: 10px 14px;
  font-size: 12px;
  min-height: 40px;
}
@media (max-width: 768px) {
  .vf-carousel-btn-primary {
    padding: 10px 14px;
    font-size: 12px;
    min-height: 42px;
    border-radius: 10px;
  }
}

/* ═══════════════════════════════════════════════════════════ */
/* ✅ v5.0 : BOUTON SECONDAIRE (Pourquoi — interact only)     */
/* ═══════════════════════════════════════════════════════════ */
.vf-carousel-btn-secondary {
  flex: 1;
  background: transparent;
  color: var(--color-1) !important;
  border: 2px solid var(--color-1);
  padding: 10px 14px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 11px;
  cursor: pointer;
  transition: var(--transition-smooth);
  letter-spacing: 0.2px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 40px;
  white-space: nowrap;
}
@media (min-width: 769px) {
  .vf-carousel-btn-secondary:hover {
    background: var(--color-1);
    color: white !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(var(--rgb-1), 0.35);
  }
  .vf-carousel-container[data-in-widget="true"] .vf-carousel-btn-secondary:hover {
    transform: none;
  }
}
.vf-carousel-btn-secondary:active {
  transform: translateY(0);
}
.vf-carousel-container[data-display-mode="gallery"][data-cards-per-view="4"] .vf-carousel-btn-secondary {
  padding: 8px 10px;
  font-size: 10px;
  min-height: 34px;
  border-width: 1.5px;
}
.vf-carousel-container[data-in-widget="true"] .vf-carousel-btn-secondary {
  padding: 10px 14px;
  font-size: 11px;
  min-height: 40px;
}
@media (max-width: 768px) {
  .vf-carousel-btn-secondary {
    padding: 10px 14px;
    font-size: 11px;
    min-height: 42px;
    border-radius: 10px;
  }
}

/* ═══════════════════════════════════════════════════════════ */
/* CONTRÔLES NAVIGATION                                        */
/* ═══════════════════════════════════════════════════════════ */
.vf-carousel-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  position: relative;
  z-index: 3;
  gap: 16px;
}
@media (max-width: 768px) {
  .vf-carousel-controls {
    margin-top: 12px;
    gap: 12px;
  }
}
.vf-carousel-container[data-in-widget="true"] .vf-carousel-controls {
  margin-top: 12px;
  gap: 12px;
}
/* Masquer si pas nécessaire */
.vf-carousel-container[data-display-mode="showcase"][data-items-count="1"] .vf-carousel-controls,
.vf-carousel-container[data-display-mode="gallery"][data-items-count="2"][data-cards-per-view="2"] .vf-carousel-controls,
.vf-carousel-container[data-display-mode="gallery"][data-items-count="3"][data-cards-per-view="3"] .vf-carousel-controls,
.vf-carousel-container[data-display-mode="gallery"][data-items-count="4"][data-cards-per-view="4"] .vf-carousel-controls {
  display: none;
}
.vf-carousel-container[data-in-widget="true"][data-items-count="1"] .vf-carousel-controls {
  display: none !important;
}
.vf-carousel-container[data-in-widget="true"]:not([data-items-count="1"]) .vf-carousel-controls {
  display: flex !important;
}
@media (max-width: 768px) {
  .vf-carousel-container[data-items-count="1"] .vf-carousel-controls {
    display: none !important;
  }
  .vf-carousel-container:not([data-items-count="1"]) .vf-carousel-controls {
    display: flex !important;
  }
}
.vf-carousel-nav-button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid ${themeVars.navBtnBorder};
  background: ${themeVars.navBtnBg};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: ${themeVars.navBtnColor};
  cursor: pointer;
  transition: var(--transition-smooth);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  box-shadow: ${themeVars.navBtnShadow};
}
@media (min-width: 769px) {
  .vf-carousel-nav-button:hover:not(:disabled) {
    background: ${themeVars.navBtnHoverBg};
    color: ${themeVars.navBtnHoverColor};
    border-color: ${themeVars.navBtnHoverBg};
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }
}
.vf-carousel-nav-button:active:not(:disabled) {
  transform: scale(1);
}
.vf-carousel-nav-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
}
.vf-carousel-container[data-in-widget="true"] .vf-carousel-nav-button {
  width: 38px;
  height: 38px;
  font-size: 18px;
}
@media (max-width: 768px) {
  .vf-carousel-nav-button {
    width: 42px;
    height: 42px;
    font-size: 20px;
  }
}
/* ═══════════════════════════════════════════════════════════ */
/* DOTS                                                        */
/* ═══════════════════════════════════════════════════════════ */
.vf-carousel-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  flex: 1;
}
@media (max-width: 768px) {
  .vf-carousel-dots { gap: 10px; }
}
.vf-carousel-container[data-in-widget="true"] .vf-carousel-dots {
  gap: 8px;
}
.vf-carousel-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid ${themeVars.dotBorder};
  background: ${themeVars.dotBg};
  cursor: pointer;
  transition: var(--transition-smooth);
}
@media (max-width: 768px) {
  .vf-carousel-dot { width: 11px; height: 11px; }
}
.vf-carousel-container[data-in-widget="true"] .vf-carousel-dot {
  width: 9px; height: 9px;
}
.vf-carousel-dot:hover {
  background: ${themeVars.dotHoverBg};
  transform: scale(1.2);
}
.vf-carousel-dot.active {
  background: ${themeVars.dotActiveBg};
  border-color: ${themeVars.dotActiveBorder};
  transform: scale(1.3);
  box-shadow: ${themeVars.dotGlow};
}
@media (max-width: 768px) {
  .vf-carousel-dot.active { transform: scale(1.4); }
}
.vf-carousel-container[data-in-widget="true"] .vf-carousel-dot.active {
  transform: scale(1.3);
}
/* ═══════════════════════════════════════════════════════════ */
/* ANIMATIONS                                                  */
/* ═══════════════════════════════════════════════════════════ */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.vf-carousel-container {
  animation: fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
      `;
      container.appendChild(styleEl);

      // ═══════════════════════════════════════════════════════
      // ÉTAT & UTILITAIRES
      // ═══════════════════════════════════════════════════════
      let currentIndex = 0;
      let autoplayInterval = null;
      let touchStartX = 0;
      let touchEndX = 0;

      const truncateText = (text, maxLength) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
      };

      const isMobile = () => window.innerWidth <= 768;

      const getSlidesPerView = () => {
        if (isInWidget() || isMobile()) return 1;
        return slidesPerView;
      };

      const getMaxIndex = () => Math.max(0, items.length - getSlidesPerView());

      // Position du carousel
      const updateCarouselPosition = () => {
        const track = container.querySelector('.vf-carousel-track');
        const currentSlidesPerView = getSlidesPerView();

        if (mode === 'showcase' || isInWidget() || isMobile()) {
          track.style.transform = `translateX(${-(currentIndex * 100)}%)`;
        } else {
          const cardWidthPercent = 100 / currentSlidesPerView;
          track.style.transform = `translateX(${-(currentIndex * cardWidthPercent)}%)`;
        }

        container.querySelectorAll('.vf-carousel-dot').forEach((dot, index) => {
          dot.classList.toggle('active', index === currentIndex);
        });

        const prevBtn = container.querySelector('.vf-carousel-prev');
        const nextBtn = container.querySelector('.vf-carousel-next');
        if (prevBtn) prevBtn.disabled = currentIndex === 0;
        if (nextBtn) nextBtn.disabled = currentIndex >= getMaxIndex();
      };

      const goToSlide = (index) => {
        currentIndex = Math.max(0, Math.min(index, getMaxIndex()));
        updateCarouselPosition();
      };

      const nextSlide = () => {
        if (currentIndex < getMaxIndex()) {
          goToSlide(currentIndex + 1);
        } else if (autoplay) {
          goToSlide(0);
        }
      };

      const prevSlide = () => {
        goToSlide(currentIndex - 1);
      };

      const startAutoplay = () => {
        if (autoplay === true && items.length > getSlidesPerView()) {
          autoplayInterval = setInterval(nextSlide, autoplayDelay);
        }
      };

      const stopAutoplay = () => {
        if (autoplayInterval) {
          clearInterval(autoplayInterval);
          autoplayInterval = null;
        }
      };

      // ═══════════════════════════════════════════════════════
      // ✅ v5.0 : GESTION DES CLICS — 2 BOUTONS
      // ═══════════════════════════════════════════════════════

      // Bouton 1 : Découvrir (lien + interact) — comportement original
      const handlePrimaryAction = (item, index) => {
        stopAutoplay();

        if (window.voiceflow?.chat?.interact) {
          let messageText = '';
          if (item.userMessageText) {
            messageText = item.userMessageText;
          } else if (userMessageText) {
            messageText = userMessageText.replace('{title}', item.title || 'Item').replace('{index}', index + 1);
          } else {
            messageText = item.title || item.buttonText || `Item ${index + 1}`;
          }

          window.voiceflow.chat.interact({
            type: 'text',
            payload: messageText
          });
          console.log(`✅ Bouton primaire: "${messageText}"`);
        }

        if (item.url) {
          setTimeout(() => {
            window.open(item.url, '_blank', 'noopener,noreferrer');
          }, 500);
        }
      };

      // Bouton 2 : Pourquoi cet outil (interact only, pas de lien)
      const handleSecondaryAction = (item, index) => {
        stopAutoplay();

        if (window.voiceflow?.chat?.interact) {
          const messageText = button2MessageTemplate
            .replace('{title}', item.title || 'cet outil')
            .replace('{index}', index + 1);

          window.voiceflow.chat.interact({
            type: 'text',
            payload: messageText
          });
          console.log(`✅ Bouton secondaire: "${messageText}"`);
        }
      };

      // ═══════════════════════════════════════════════════════
      // CONSTRUCTION DU HTML
      // ═══════════════════════════════════════════════════════

      // Titre
      if (title) {
        const titleElement = document.createElement('h1');
        titleElement.className = 'vf-carousel-title';
        titleElement.textContent = title;
        container.appendChild(titleElement);
      }

      const viewport = document.createElement('div');
      viewport.className = 'vf-carousel-viewport';

      const track = document.createElement('div');
      track.className = 'vf-carousel-track';

      // Création des cartes
      items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'vf-carousel-card';
        card.setAttribute('data-index', index);

        // ✅ v5.0 : HEADER = logo inline + titre
        const header = document.createElement('div');
        header.className = 'vf-carousel-card-header';

        if (item.image) {
          const fixedUrl = fixImgurUrl(item.image);
          const logo = document.createElement('img');
          logo.className = 'vf-carousel-card-logo';
          logo.src = fixedUrl;
          logo.alt = item.title || '';
          logo.loading = 'lazy';
          logo.onerror = () => {
            // Fallback: première lettre en rond coloré
            const fallback = document.createElement('div');
            fallback.className = 'vf-carousel-card-logo-fallback';
            fallback.textContent = (item.title || '?').charAt(0).toUpperCase();
            logo.replaceWith(fallback);
          };
          header.appendChild(logo);
        } else {
          const fallback = document.createElement('div');
          fallback.className = 'vf-carousel-card-logo-fallback';
          fallback.textContent = (item.title || '?').charAt(0).toUpperCase();
          header.appendChild(fallback);
        }

        if (item.title) {
          const cardTitle = document.createElement('h3');
          cardTitle.className = 'vf-carousel-card-title';
          cardTitle.textContent = item.title;
          header.appendChild(cardTitle);
        }

        card.appendChild(header);

        // CONTENU (description + boutons)
        const content = document.createElement('div');
        content.className = 'vf-carousel-content';

        if (item.description) {
          const descContainer = document.createElement('div');
          descContainer.className = 'vf-carousel-description';

          // ✅ v5.0 : Split par "•" et rendu structuré
          const segments = item.description.split('•').map(s => s.trim()).filter(Boolean);

          segments.forEach((segment, segIndex) => {
            // Détecte le tag Freemium
            if (segment.includes('✅') || segment.toLowerCase().includes('freemium')) {
              const badge = document.createElement('span');
              badge.className = 'vf-carousel-desc-freemium';
              badge.textContent = '✅ Freemium';
              descContainer.appendChild(badge);
              return;
            }

            const line = document.createElement('div');
            line.className = 'vf-carousel-desc-line';

            // Dot (masqué en CSS pour les 2 premières lignes)
            const dot = document.createElement('span');
            dot.className = 'vf-carousel-desc-dot';
            line.appendChild(dot);

            const text = document.createElement('span');
            text.textContent = segment;
            line.appendChild(text);

            descContainer.appendChild(line);
          });

          content.appendChild(descContainer);
        }

        // ✅ v5.0 : Container 2 boutons
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'vf-carousel-buttons';

        // Bouton 1 : Découvrir
        const btn1 = document.createElement('button');
        btn1.className = 'vf-carousel-btn-primary';
        btn1.textContent = item.buttonText || '🔗 Découvrir';
        btn1.addEventListener('click', (e) => {
          e.stopPropagation();
          handlePrimaryAction(item, index);
        });
        buttonsContainer.appendChild(btn1);

        // Bouton 2 : Pourquoi cet outil
        const btn2 = document.createElement('button');
        btn2.className = 'vf-carousel-btn-secondary';
        btn2.textContent = button2Text;
        btn2.addEventListener('click', (e) => {
          e.stopPropagation();
          handleSecondaryAction(item, index);
        });
        buttonsContainer.appendChild(btn2);

        content.appendChild(buttonsContainer);
        card.appendChild(content);

        track.appendChild(card);
      });

      viewport.appendChild(track);
      container.appendChild(viewport);

      // ═══════════════════════════════════════════════════════
      // CONTRÔLES NAVIGATION
      // ═══════════════════════════════════════════════════════
      const controls = document.createElement('div');
      controls.className = 'vf-carousel-controls';

      const prevBtn = document.createElement('button');
      prevBtn.className = 'vf-carousel-nav-button vf-carousel-prev';
      prevBtn.innerHTML = '‹';
      prevBtn.addEventListener('click', prevSlide);

      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'vf-carousel-dots';

      const calculateDots = () => {
        const currentSlidesPerView = getSlidesPerView();
        return isInWidget() || isMobile() || mode === 'showcase'
          ? items.length
          : Math.ceil(items.length / currentSlidesPerView);
      };

      const totalDots = calculateDots();
      for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement('button');
        dot.className = 'vf-carousel-dot';
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      }

      const nextBtn = document.createElement('button');
      nextBtn.className = 'vf-carousel-nav-button vf-carousel-next';
      nextBtn.innerHTML = '›';
      nextBtn.addEventListener('click', nextSlide);

      controls.appendChild(prevBtn);
      controls.appendChild(dotsContainer);
      controls.appendChild(nextBtn);
      container.appendChild(controls);

      // ═══════════════════════════════════════════════════════
      // EVENT HANDLERS
      // ═══════════════════════════════════════════════════════

      // Resize
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          currentIndex = 0;
          updateCarouselPosition();
          const newTotalDots = calculateDots();
          if (newTotalDots !== dotsContainer.children.length) {
            dotsContainer.innerHTML = '';
            for (let i = 0; i < newTotalDots; i++) {
              const dot = document.createElement('button');
              dot.className = 'vf-carousel-dot';
              dot.addEventListener('click', () => goToSlide(i));
              dotsContainer.appendChild(dot);
            }
            updateCarouselPosition();
          }
        }, 300);
      });

      // Trackpad
      let wheelTimeout;
      container.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 10) {
          e.preventDefault();
          stopAutoplay();
          clearTimeout(wheelTimeout);
          if (e.deltaX > 10) nextSlide();
          else if (e.deltaX < -10) prevSlide();
          if (autoplay === true) {
            wheelTimeout = setTimeout(startAutoplay, 2000);
          }
        }
      }, { passive: false });

      // Touch
      let isDragging = false;

      track.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        stopAutoplay();
      }, { passive: true });

      track.addEventListener('touchmove', (e) => {
        if (!touchStartX) return;
        touchEndX = e.touches[0].clientX;
        isDragging = true;
      }, { passive: true });

      track.addEventListener('touchend', () => {
        if (!isDragging) return;
        const touchDiff = touchStartX - touchEndX;
        if (Math.abs(touchDiff) > 50) {
          if (touchDiff > 0) nextSlide();
          else prevSlide();
        }
        touchStartX = 0;
        touchEndX = 0;
        isDragging = false;
        if (autoplay === true) setTimeout(startAutoplay, 2000);
      });

      // Clavier
      container.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
      });

      // Autoplay hover pause
      if (autoplay === true) {
        container.addEventListener('mouseenter', stopAutoplay);
        container.addEventListener('mouseleave', startAutoplay);
      }

      // Init
      updateCarouselPosition();
      if (autoplay === true) setTimeout(startAutoplay, 1000);

      element.appendChild(container);

      console.log(`✅ Carousel v5.0 COMPACT ${mode.toUpperCase()} - Theme: ${theme.toUpperCase()} (ID: ${uniqueId}) - ${items.length} items - ${slidesPerView} cardsPerView - Widget: ${isInWidget()} - Mobile: ${isMobile()} - Btn2: "${button2Text}"`);

      // Cleanup
      return () => {
        stopAutoplay();
        window.removeEventListener('resize', resizeTimeout);
      };

    } catch (error) {
      console.error('❌ Carousel Error:', error);
      element.innerHTML = `<div style="color: #ff4444; padding: 20px; text-align: center;">❌ Erreur Carousel: ${error.message}</div>`;
    }
  }
};
export default CarouselExtension;
