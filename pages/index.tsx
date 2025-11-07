import Link from 'next/link';
import Layout from '../components/Layout';
import { deityList } from '../lib/deities';

export default function HomePage() {
  return (
    <Layout>
      <section className="text-center">
        <h1 className="text-3xl font-bold text-pink-950 sm:text-4xl">Лотосные стопы</h1>
        <p className="mt-4 text-base text-pink-800 sm:text-lg">
          Выберите божество, чтобы изучить знаки на его лотосных стопах. После добавления изображений и описаний
          информация появится автоматически.
        </p>
      </section>

      <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {deityList.map((deity) => (
          <Link
            key={deity.slug}
            href={`/${deity.slug}`}
            className="group flex flex-col justify-between rounded-3xl border border-pink-100 bg-white/80 p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div>
              <h2 className="text-xl font-semibold text-pink-900 group-hover:text-pink-950">{deity.headline}</h2>
              <p className="mt-3 text-sm text-pink-800">{deity.description}</p>
            </div>
            <span className="mt-6 inline-flex items-center justify-center rounded-full bg-pink-100 px-4 py-2 text-sm font-medium text-pink-900 group-hover:bg-pink-200">
              Перейти
            </span>
          </Link>
        ))}
      </section>
    </Layout>
  );
}
