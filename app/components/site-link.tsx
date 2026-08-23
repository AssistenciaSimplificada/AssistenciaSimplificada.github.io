import NextLink from "next/link";
import type { ComponentProps } from "react";

type SiteLinkProps = ComponentProps<typeof NextLink>;

/** Navegação interna sem o pré-carregamento incompatível do ambiente hospedado. */
export function SiteLink(props: SiteLinkProps) {
  return <NextLink {...props} prefetch={false} />;
}
