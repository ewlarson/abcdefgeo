import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  Map,
  RotateCcw,
  Search,
} from 'lucide-react';
import { Seo } from '../components/Seo';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useI18n } from '../hooks/useI18n';

type StatusErrorKind = 'notFound' | 'resourceNotFound' | 'serverError';

interface StatusErrorPageProps {
  kind: StatusErrorKind;
  statusCode?: number;
  resourceId?: string;
  details?: string;
  backTo?: string;
  onRetry?: () => void;
}

interface ErrorAction {
  label: string;
  Icon: LucideIcon;
  to?: string;
  onClick?: () => void;
  primary?: boolean;
}

const primaryActionStyle = {
  backgroundColor: 'rgb(var(--color-primary))',
  color: '#fff',
} satisfies CSSProperties;

const mapGridStyle = {
  backgroundImage:
    'linear-gradient(to right, color-mix(in srgb, var(--color-border) 65%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--color-border) 65%, transparent) 1px, transparent 1px)',
  backgroundSize: '32px 32px',
} satisfies CSSProperties;

function getErrorContent(
  kind: StatusErrorKind,
  statusCode: number,
  resourceId: string | undefined,
  t: ReturnType<typeof useI18n>['t']
) {
  if (kind === 'resourceNotFound') {
    return {
      title: t('errorPages.resourceNotFoundTitle'),
      description: resourceId
        ? t('errorPages.resourceNotFoundDescription', { resourceId })
        : t('errorPages.resourceNotFoundDescriptionNoId'),
      steps: [
        t('errorPages.resourceNotFoundStepSearch'),
        t('errorPages.resourceNotFoundStepScope'),
      ],
    };
  }

  if (kind === 'serverError') {
    return {
      title: t('errorPages.serverErrorTitle'),
      description: t('errorPages.serverErrorDescription'),
      steps: [
        t('errorPages.serverErrorStepRetry'),
        t('errorPages.serverErrorStepSearch'),
      ],
    };
  }

  return {
    title: t('errorPages.notFoundTitle'),
    description: t('errorPages.notFoundDescription', { statusCode }),
    steps: [
      t('errorPages.notFoundStepSearch'),
      t('errorPages.notFoundStepCheckUrl'),
    ],
  };
}

function ActionLink({ action }: { action: ErrorAction }) {
  const Icon = action.Icon;
  const className = action.primary
    ? 'theme-ui inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-active focus-visible:ring-offset-2'
    : 'theme-ui theme-facet-button inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-active focus-visible:ring-offset-2';

  const content = (
    <>
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
      <span>{action.label}</span>
    </>
  );

  if (action.to) {
    return (
      <Link
        to={action.to}
        className={className}
        style={action.primary ? primaryActionStyle : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={action.onClick}
      className={className}
      style={action.primary ? primaryActionStyle : undefined}
    >
      {content}
    </button>
  );
}

export function StatusErrorPage({
  kind,
  statusCode = kind === 'serverError' ? 500 : 404,
  resourceId,
  details,
  backTo,
  onRetry,
}: StatusErrorPageProps) {
  const { t } = useI18n();
  const { title, description, steps } = getErrorContent(
    kind,
    statusCode,
    resourceId,
    t
  );
  const actions: ErrorAction[] = [];

  if (backTo) {
    actions.push({
      label: t('errorPages.backToResults'),
      Icon: ArrowLeft,
      to: backTo,
      primary: true,
    });
  }

  if (kind === 'serverError' && onRetry) {
    actions.push({
      label: t('common.tryAgain'),
      Icon: RotateCcw,
      onClick: onRetry,
      primary: actions.length === 0,
    });
  }

  actions.push(
    {
      label: t('errorPages.searchResources'),
      Icon: Search,
      to: '/search?q=',
      primary: actions.length === 0,
    },
    {
      label: t('common.goHome'),
      Icon: Home,
      to: '/',
    }
  );

  return (
    <div className="theme-shell flex min-h-screen flex-col">
      <Seo title={title} description={description} />
      <Header />

      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <p className="theme-ui mb-4 text-sm font-semibold uppercase tracking-[0.14em] theme-kicker">
              {t('errorPages.statusLabel', { statusCode })}
            </p>
            <h1 className="text-4xl font-bold leading-tight theme-text-strong sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 text-lg leading-8 theme-text-muted">
              {description}
            </p>

            {details && kind === 'serverError' ? (
              <details className="theme-page-surface theme-border mt-6 rounded-md border p-4 text-sm theme-text-muted">
                <summary className="cursor-pointer font-semibold theme-text-strong">
                  {t('errorPages.technicalDetails')}
                </summary>
                <p className="mt-3 break-words">{details}</p>
              </details>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              {actions.map((action) => (
                <ActionLink
                  key={`${action.label}-${action.to || 'button'}`}
                  action={action}
                />
              ))}
            </div>
          </div>

          <aside className="theme-page-surface theme-border rounded-lg border p-5">
            <div className="theme-page-surface-muted theme-border relative h-56 overflow-hidden rounded-md border">
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={mapGridStyle}
              />
              <div
                aria-hidden="true"
                className="absolute left-8 top-7 h-20 w-28 rotate-[-8deg] rounded-sm border-2 opacity-80"
                style={{ borderColor: 'rgb(var(--color-primary))' }}
              />
              <div
                aria-hidden="true"
                className="absolute bottom-8 right-8 h-20 w-24 rotate-12 rounded-sm border-2 opacity-60"
                style={{ borderColor: 'rgb(var(--color-active))' }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <Map
                  aria-hidden="true"
                  className="mb-3 h-8 w-8 theme-text-muted"
                />
                <span className="text-6xl font-bold leading-none theme-text-strong">
                  {statusCode}
                </span>
              </div>
            </div>

            <h2 className="mt-6 text-base font-semibold theme-text-strong">
              {t('errorPages.nextStepsTitle')}
            </h2>
            <ul className="mt-3 space-y-3 text-sm leading-6 theme-text-muted">
              {steps.map((step) => (
                <li key={step} className="flex gap-3">
                  <AlertTriangle
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 theme-kicker"
                  />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
}
