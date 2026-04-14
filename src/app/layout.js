import './globals.css';
import BackToTop from '@/components/BackToTop';

export const metadata = {
  title: {
    default: 'FindFinancePros — Find Trusted Finance Professionals',
    template: '%s | FindFinancePros',
  },
  description:
    'Find fractional CFOs, FP&A consultants, controllers, and bookkeeping firms across Canada and the United States. Get matched with the right finance professional for your business.',
  keywords: [
    'fractional CFO',
    'FP&A consultant',
    'controller',
    'bookkeeper',
    'finance professional',
    'Canada',
    'United States',
  ],
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: 'FindFinancePros — Find Trusted Finance Professionals',
    description:
      'Directory of fractional CFOs, FP&A consultants, controllers, and bookkeeping firms across North America.',
    url: 'https://findfinancepros.com',
    siteName: 'FindFinancePros',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <BackToTop />
      </body>
    </html>
  );
}
