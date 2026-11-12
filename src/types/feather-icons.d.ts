// feather-icons 4.29.2 ships no type declarations; this covers the API used by Icon.astro.
declare module 'feather-icons' {
  interface FeatherIcon {
    name: string;
    contents: string;
    toSvg(attrs?: Record<string, string | number>): string;
  }
  const feather: { icons: Record<string, FeatherIcon | undefined> };
  export default feather;
}
