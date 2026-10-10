// Keep the successful build's class names and family variables unchanged.
// Font faces and byte-identical binaries are now owned by app/fonts.css.
export const poppins = { className: '__className_cf84ab', variable: '__variable_cf84ab' };
export const epilogue = { className: '__className_ce71e5', variable: '__variable_ce71e5' };
export const sectionPoppins = { className: '__className_c51512' };
export const expertEpilogue = { className: '__className_ae80e8' };
export const inter = { className: '__className_69d019' };

// Only Latin subsets are preloaded, matching the former next/font selection.
export const latinFontPreloads = [
  '/fonts/eafabf029ad39a43-s.p.woff2', // Poppins 400
  '/fonts/8888a3826f4a3af4-s.p.woff2', // Poppins 500
  '/fonts/0484562807a97172-s.p.woff2', // Poppins 600
  '/fonts/b957ea75a84b6ea7-s.p.woff2', // Poppins 700
  '/fonts/5c9b804ec7dd51d9-s.p.woff2', // Epilogue variable face
  '/fonts/e4af272ccee01ff0-s.p.woff2', // Inter variable face
] as const;
