import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Coffee, LayoutDashboard } from 'lucide-react';
import { BRAND_NAME } from '@/lib/brand';
import { ADMIN_BASE, adminPath } from '@/admin/adminNav';
import { BouncingDigits } from '@/components/NotFound';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

/**
 * Admin 404 — rendered inside the authenticated shell so the sidebar and
 * session stay intact when a staff member mistypes an admin URL, instead of
 * bouncing them out to the public site.
 */
export function AdminNotFoundPage() {
  const location = useLocation();
  useDocumentTitle(`Page not found · ${BRAND_NAME} Admin`);

  return (
    <div className="ke-404 ke-404--inset">
      <span className="ke-404__grid" aria-hidden />

      <div className="ke-404__inner">
        <BouncingDigits />

        <span className="ke-404__badge">
          <Coffee size={14} strokeWidth={2.4} />
          Unknown admin page
        </span>

        <h1 className="ke-404__title">We couldn&apos;t find that page</h1>

        <p className="ke-404__text">
          <span className="ke-404__path">{location.pathname}</span> isn&apos;t part of the
          dashboard. Pick a section from the sidebar, or head back to the overview.
        </p>

        <div className="ke-404__actions">
          <Link to={ADMIN_BASE} className="ke-404__btn ke-404__btn--primary">
            <LayoutDashboard size={17} strokeWidth={2.4} />
            Go to Dashboard
          </Link>
          <Link to="/" className="ke-404__btn ke-404__btn--ghost">
            <ArrowLeft size={17} strokeWidth={2.4} />
            Public site
          </Link>
        </div>

        <div className="ke-404__links">
          <Link to={adminPath('orders')} className="ke-404__link">
            Orders
          </Link>
          <Link to={adminPath('menu')} className="ke-404__link">
            Menu
          </Link>
          <Link to={adminPath('branches')} className="ke-404__link">
            Branches
          </Link>
          <Link to={adminPath('customers')} className="ke-404__link">
            Users
          </Link>
        </div>
      </div>
    </div>
  );
}
