import { GetStaticPaths, GetStaticProps } from 'next';
import { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { deities, DeityInfo, DeitySlug } from '../lib/deities';
import { loadSigns, imageExists } from '../lib/loadSigns';
import { FootSign } from '../lib/signs';

interface DeityPageProps {
  deity: DeityInfo;
  signs: FootSign[];
  dataPath: string;
  hasImage: boolean;
}

export default function DeityPage({ deity, signs, dataPath, hasImage }: DeityPageProps) {
  const [activeSignId, setActiveSignId] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  const activeSign = useMemo(() => signs.find((sign) => sign.id === activeSignId) ?? null, [activeSignId, signs]);

  return (
    <Layout title={deity.name}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="space-y-6">
          <header>
            <p className="text-sm uppercase tracking-wider text-pink-700">Интерактивная схема</p>
            <h1 className="mt-2 text-3xl font-semibold text-pink-950 sm:text-4xl">{deity.headline}</h1>
            <p className="mt-4 max-w-2xl text-base text-pink-800">{deity.description}</p>
          </header>

          <div className="relative rounded-3xl border border-pink-100 bg-white/70 p-4 shadow-inner">
            {hasImage ? (
              <div className="relative mx-auto max-w-2xl">
                <img
                  src={deity.image}
                  alt={deity.headline}
                  className="h-auto w-full rounded-2xl border border-pink-100 object-contain shadow"
                  onLoad={(event) =>
                    setImageSize({
                      width: event.currentTarget.naturalWidth,
                      height: event.currentTarget.naturalHeight
                    })
                  }
                />
                {imageSize && signs.length > 0 && (
                  <div className="pointer-events-none absolute inset-0">
                    {signs.map((sign) => {
                      const left = (sign.x / imageSize.width) * 100;
                      const top = (sign.y / imageSize.height) * 100;
                      return (
                        <button
                          key={sign.id}
                          type="button"
                          className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink-300 bg-pink-100 px-2 py-1 text-xs font-medium text-pink-900 shadow transition-transform duration-200 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-400 ${
                            activeSignId === sign.id ? 'bg-pink-300' : ''
                          }`}
                          style={{ left: `${left}%`, top: `${top}%` }}
                          onMouseEnter={() => setActiveSignId(sign.id)}
                          onMouseLeave={() => setActiveSignId((current) => (current === sign.id ? null : current))}
                          onFocus={() => setActiveSignId(sign.id)}
                          onBlur={() => setActiveSignId((current) => (current === sign.id ? null : current))}
                          onClick={() => setActiveSignId((current) => (current === sign.id ? null : sign.id))}
                        >
                          {sign.title}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-pink-200 bg-white/60 p-8 text-center text-pink-800">
                <p className="text-lg font-medium">Изображение пока не добавлено</p>
                <p className="text-sm">
                  Поместите файл изображения по пути <code className="rounded bg-pink-50 px-2 py-1">public{deity.image}</code>.
                  После этого он автоматически появится здесь.
                </p>
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-pink-100 bg-white/80 p-6 shadow">
            <h2 className="text-xl font-semibold text-pink-950">Знаки на стопах</h2>
            <p className="mt-3 text-sm text-pink-800">
              Добавьте файл с описанием по пути{' '}
              <code className="rounded bg-pink-50 px-2 py-1">{dataPath}</code>. Каждый знак появится как интерактивный маркер.
            </p>
            {signs.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-pink-50 p-4 text-sm text-pink-900">
                Пока что список знаков пуст. Добавьте данные в JSON-файл, чтобы увидеть всплывающие подсказки.
              </p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm text-pink-900">
                {signs.map((sign) => (
                  <li key={sign.id} className="rounded-xl border border-pink-100 bg-white/90 p-3 shadow-sm">
                    <p className="font-medium">{sign.title}</p>
                    <p className="mt-1 text-pink-800">{sign.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {activeSign && (
            <div className="rounded-3xl border border-pink-200 bg-pink-50 p-6 shadow-inner">
              <h3 className="text-lg font-semibold text-pink-950">{activeSign.title}</h3>
              <p className="mt-2 text-sm text-pink-800">{activeSign.description}</p>
            </div>
          )}
        </aside>
      </div>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = Object.keys(deities).map((slug) => ({ params: { deity: slug } }));

  return {
    paths,
    fallback: false
  };
};

export const getStaticProps: GetStaticProps<DeityPageProps> = async ({ params }) => {
  const slug = params?.deity as DeitySlug;
  const deity = deities[slug];

  if (!deity) {
    return { notFound: true };
  }

  const { signs, dataPath } = await loadSigns(slug);
  const hasImage = await imageExists(deity.image);

  return {
    props: {
      deity,
      signs,
      dataPath,
      hasImage
    }
  };
};
