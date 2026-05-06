import type { ReactNode } from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import { primaryCtaClass, secondaryCtaClass } from '../../styles/cta';
import { useTheme } from '../../hooks/useTheme';
import { useI18n } from '../../hooks/useI18n';
import { isAbsoluteUrl, resolveThemeAssetUrl } from '../../utils/themeUrls';

function SpotlightPreview({
  imageSrc,
  imageAlt,
  featuredItemTitle,
  featuredItemUrl,
}: {
  imageSrc?: string;
  imageAlt?: string;
  featuredItemTitle: string;
  featuredItemUrl?: string;
}) {
  const content = (
    <div className="relative min-h-[220px] overflow-hidden bg-slate-900">
      {imageSrc ? (
        <img
          src={resolveThemeAssetUrl(imageSrc)}
          alt={imageAlt || featuredItemTitle}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <>
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,#1a5a73_0%,transparent_36%),radial-gradient(circle_at_80%_75%,#264f7b_0%,transparent_30%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(58,79,110,0.22)_1px,transparent_1px),linear-gradient(rgba(58,79,110,0.2)_1px,transparent_1px)] bg-[size:36px_36px]" />
        </>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-brand/90 px-4 py-3 shadow-md backdrop-blur-[1px]">
        <p className="text-sm font-semibold text-white">{featuredItemTitle}</p>
      </div>
    </div>
  );

  if (!featuredItemUrl) {
    return content;
  }

  if (!isAbsoluteUrl(featuredItemUrl) && featuredItemUrl.startsWith('/')) {
    return (
      <Link
        to={featuredItemUrl}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-active"
      >
        {content}
      </Link>
    );
  }

  return (
    <a
      href={featuredItemUrl}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-active"
    >
      {content}
    </a>
  );
}

function SpotlightLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  if (!isAbsoluteUrl(href) && href.startsWith('/')) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

export function HomepageFeaturedCollection() {
  const { theme } = useTheme();
  const { t, text } = useI18n();
  const spotlights = theme.homepage?.collection_spotlights || [];

  if (spotlights.length === 0) {
    return null;
  }

  return (
    <section className="theme-page-surface w-full px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="theme-text-strong text-2xl font-semibold sm:text-3xl">
            {t('common.featuredCollections')}
          </h2>
        </div>

        {spotlights.map((spotlight) => (
          <div
            key={`${text(spotlight.title)}-${spotlight.collection_url}`}
            className="theme-page-surface-muted theme-border mb-6 grid gap-6 border p-5 lg:grid-cols-5 lg:p-8"
          >
            <div
              className={`lg:col-span-3 ${
                spotlight.reverse ? 'lg:order-2' : ''
              }`}
            >
              <SpotlightPreview
                imageSrc={spotlight.image_src}
                imageAlt={text(spotlight.image_alt)}
                featuredItemTitle={text(spotlight.featured_item_title)}
                featuredItemUrl={spotlight.featured_item_url}
              />
            </div>
            <div
              className={`lg:col-span-2 flex flex-col justify-center ${
                spotlight.reverse ? 'lg:order-1' : ''
              }`}
            >
              <p className="theme-ui theme-text-muted text-xs font-semibold uppercase tracking-[0.16em]">
                {t('common.featuredCollections')}
              </p>
              <h2 className="theme-text-strong mt-2 text-2xl font-semibold sm:text-3xl">
                {text(spotlight.title)}
              </h2>
              <p className="theme-text-muted mt-3 max-w-xl text-sm sm:text-base">
                {text(spotlight.description)}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <SpotlightLink
                  href={spotlight.collection_url}
                  className={`${secondaryCtaClass} theme-ui uppercase tracking-[0.14em]`}
                >
                  {text(spotlight.collection_label) ||
                    t('common.viewCollectionRecord')}
                  <ExternalLink className="h-4 w-4" />
                </SpotlightLink>
                <SpotlightLink
                  href={spotlight.browse_url}
                  className={`${primaryCtaClass} theme-ui uppercase tracking-[0.14em]`}
                >
                  {text(spotlight.browse_label)}
                  <ArrowRight className="h-4 w-4" />
                </SpotlightLink>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
