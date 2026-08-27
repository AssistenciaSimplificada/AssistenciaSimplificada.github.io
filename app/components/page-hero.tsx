export function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <section className="as-secondary-hero"><div className="container"><span className="as-kicker">{eyebrow}</span><h1>{title}</h1><p>{description}</p><span className="as-secondary-signal" aria-hidden="true"><i /><i /><i /></span></div></section>;
}
