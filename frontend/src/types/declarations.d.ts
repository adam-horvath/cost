// src/types/declarations.d.ts

// SVG deklaráció
declare module '*.svg' {
  const content: string;
  export default content;
}
  
// SCSS deklaráció
declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}