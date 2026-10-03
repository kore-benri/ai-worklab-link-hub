import './globals.css';

export const metadata = {
  title: 'AI WorkLab Link Hub',
  description: 'Affiliate link tracking and growth dashboard for AI WorkLab',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
