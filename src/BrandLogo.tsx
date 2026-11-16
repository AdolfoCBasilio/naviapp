/** Render the official artwork with its dark backdrop made transparent. */
export function BrandLogo() {
 return <svg className="brand-logo" viewBox="367 291 938 342" role="img" aria-label="NAVI · Materiales y Acabados">
  <defs>
   <filter id="navi-remove-backdrop" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
    <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  4 0 0 0 -0.6"/>
   </filter>
  </defs>
  <image href="/images/logo.png" width="1672" height="941" filter="url(#navi-remove-backdrop)"/>
 </svg>;
}
