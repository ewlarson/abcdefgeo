import { render, screen, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResourceAdminPage } from '../../pages/ResourceAdminPage';
import { ApiProvider } from '../../context/ApiContext';
import { fetchResourceJson } from '../../services/api';
import type { ResourceJsonResponse } from '../../services/api';

vi.mock('../../components/layout/Header', () => ({
  Header: () => <header data-testid="site-header" />,
}));

vi.mock('../../components/layout/Footer', () => ({
  Footer: () => <footer data-testid="site-footer" />,
}));

const mockResourceJson: ResourceJsonResponse = {
  jsonapi: { version: '1.1' },
  data: {
    id: 'resource-1',
    type: 'resource',
    attributes: {
      ogm: {
        id: 'resource-1',
        dct_title_s: 'Detailed Resource',
        dct_description_sm: ['A full metadata record'],
        gbl_resourceClass_sm: ['Dataset'],
      },
    },
    meta: {
      ui: {
        thumbnail_url: null,
      },
    },
  },
  meta: {
    requestId: 'request-1',
  },
};

function renderResourceAdminPage() {
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/resources/resource-1/admin']}>
        <ApiProvider>
          <Routes>
            <Route
              path="/resources/:id/admin"
              element={<ResourceAdminPage />}
            />
          </Routes>
        </ApiProvider>
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe('ResourceAdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchResourceJson).mockResolvedValue(mockResourceJson);
  });

  it('pretty prints the raw resource JSON response', async () => {
    renderResourceAdminPage();

    expect(
      await screen.findByRole('heading', { name: 'Aardvark Metadata' })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchResourceJson).toHaveBeenCalledWith(
        'resource-1',
        expect.any(Function)
      );
    });

    expect(
      screen.getByRole('link', { name: /back to resource/i })
    ).toHaveAttribute('href', '/resources/resource-1');

    const jsonBlock = await screen.findByLabelText('Complete resource JSON');
    expect(screen.getByText('Detailed Resource')).toBeInTheDocument();
    expect(jsonBlock.textContent).toBe(
      JSON.stringify(mockResourceJson, null, 2)
    );
  });
});
