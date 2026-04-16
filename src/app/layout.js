import Script from 'next/script';
import './globals.css';
import BackToTop from '@/components/BackToTop';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata = {
  metadataBase: new URL('https://www.findfinancepros.com'),
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
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: 'FindFinancePros — Find Trusted Finance Professionals',
    description:
      'Directory of fractional CFOs, FP&A consultants, controllers, and bookkeeping firms across North America.',
    url: 'https://www.findfinancepros.com',
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
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        {children}
        <BackToTop />
      </body>
    </html>
  );
}
