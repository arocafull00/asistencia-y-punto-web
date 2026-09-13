export function ionIconToSvgMarkup(icon: string): string {
  if (!icon.startsWith("data:image/svg+xml")) {
    return icon;
  }

  const raw = decodeURIComponent(icon.replace(/^data:image\/svg\+xml;utf8,/, ""));

  return raw
    .replace(/ class='ionicon'/g, "")
    .replace(/ class="ionicon"/g, "")
    .replace(
      /class='ionicon-fill-none ionicon-stroke-width'/g,
      "fill='none' stroke='currentColor' stroke-width='32'",
    )
    .replace(
      /class="ionicon-fill-none ionicon-stroke-width"/g,
      'fill="none" stroke="currentColor" stroke-width="32"',
    )
    .replace(
      /class='ionicon-fill-none'/g,
      "fill='none' stroke='currentColor'",
    )
    .replace(
      /class="ionicon-fill-none"/g,
      'fill="none" stroke="currentColor"',
    )
    .replace(/<path(?![^>]*fill=)/g, "<path fill='currentColor'")
    .replace(/<circle(?![^>]*fill=)/g, "<circle fill='currentColor'")
    .replace(/<rect(?![^>]*fill=)/g, "<rect fill='currentColor'")
    .replace(/<svg([^>]*)>/, "<svg$1 width='100%' height='100%'>");
}
