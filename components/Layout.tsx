import Head from 'next/head';
import Link from 'next/link';
import { ReactNode } from 'react';

interface LayoutProps {
  title?: string;
  children: ReactNode;
}

export function Layout({ title, children }: LayoutProps) {
  const pageTitle = title ? `Лотосные стопы | ${title}` : 'Лотосные стопы';

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content="Интерактивное описание лотосных стоп божеств: Шьяма Сундара, Шримати Радхарани и Господь Гауранга."
        />
      </Head>
      <header className="bg-white/80 backdrop-blur border-b border-pink-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-semibold text-pink-900">
            Лотосные стопы
          </Link>
          <nav className="hidden gap-4 text-sm font-medium text-pink-800 sm:flex">
            <Link href="/shyama" className="hover:text-pink-900">
              Шьяма Сундара
            </Link>
            <Link href="/radharani" className="hover:text-pink-900">
              Шримати Радхарани
            </Link>
            <Link href="/gauranga" className="hover:text-pink-900">
              Господь Гауранга
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-gradient-to-b from-lotus-light via-white to-lotus-light">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">{children}</div>
      </main>
      <footer className="bg-white/70 backdrop-blur-sm border-t border-pink-100 py-6 text-center text-sm text-pink-800">
        Подготовлено для дальнейшего наполнения описаниями знаков на лотосных стопах.
      </footer>
    </div>
  );
}

export default Layout;
