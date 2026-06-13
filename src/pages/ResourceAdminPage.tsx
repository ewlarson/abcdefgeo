import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Seo } from '../components/Seo';
import { ErrorMessage } from '../components/ErrorMessage';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useApi } from '../context/ApiContext';
import { useI18n } from '../hooks/useI18n';
import { fetchResourceJson, type ResourceJsonResponse } from '../services/api';

export function ResourceAdminPage() {
  const { id } = useParams<{ id: string }>();
  const { setLastApiUrl } = useApi();
  const { t } = useI18n();
  const [resourceJson, setResourceJson] = useState<ResourceJsonResponse | null>(
    null
  );
  const [apiUrl, setApiUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const noResourceIdMessage = t('resourceAdmin.noResourceId');
  const fetchErrorMessage = t('resourceAdmin.fetchError');

  useEffect(() => {
    let isMounted = true;

    async function loadResourceJson() {
      if (!id) {
        setError(noResourceIdMessage);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setResourceJson(null);

      try {
        const json = await fetchResourceJson(id, (url) => {
          if (!isMounted) return;
          setApiUrl(url);
          setLastApiUrl(url);
        });

        if (isMounted) {
          setResourceJson(json);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : fetchErrorMessage);
          setIsLoading(false);
        }
      }
    }

    void loadResourceJson();

    return () => {
      isMounted = false;
    };
  }, [fetchErrorMessage, id, noResourceIdMessage, setLastApiUrl]);

  const title = resourceJson?.data?.attributes?.ogm?.dct_title_s;
  const pageTitle = title
    ? t('resourceAdmin.pageTitleWithTitle', { title })
    : t('resourceAdmin.pageTitle');
  const formattedJson = useMemo(
    () => JSON.stringify(resourceJson, null, 2),
    [resourceJson]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Seo title={pageTitle} description={t('resourceAdmin.pageDescription')} />
      <Header />

      <main className="flex-1 bg-gray-50 pt-4 pb-8">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Link
              to={id ? `/resources/${encodeURIComponent(id)}` : '/search'}
              className="inline-flex items-center gap-2 rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-700"
            >
              <ArrowLeft aria-hidden="true" size={18} />
              {t('resourceAdmin.backToResource')}
            </Link>

            {apiUrl && (
              <p className="max-w-full truncate text-sm text-gray-600">
                <span className="font-semibold text-gray-800">
                  {t('resourceAdmin.endpointLabel')}
                </span>{' '}
                <code className="break-all rounded-sm bg-white px-2 py-1 text-xs text-gray-800">
                  {apiUrl}
                </code>
              </p>
            )}
          </div>

          <section className="bg-white border border-gray-200 rounded-md shadow-sm">
            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                {t('resourceAdmin.eyebrow')}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-gray-900">
                {t('resourceAdmin.heading')}
              </h1>
              {title && <p className="mt-2 text-sm text-gray-600">{title}</p>}
            </div>

            {isLoading ? (
              <div className="px-4 py-10 text-sm text-gray-600 sm:px-6">
                {t('resourceAdmin.loading')}
              </div>
            ) : error ? (
              <div className="px-4 py-6 sm:px-6">
                <ErrorMessage message={error} />
              </div>
            ) : (
              <pre
                aria-label={t('resourceAdmin.jsonLabel')}
                tabIndex={0}
                className="max-h-[72vh] overflow-auto whitespace-pre-wrap break-words px-4 py-5 font-mono text-xs leading-6 text-gray-900 sm:px-6 sm:text-sm"
              >
                {formattedJson}
              </pre>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
