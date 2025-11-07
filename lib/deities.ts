export type DeitySlug = 'shyama' | 'radharani' | 'gauranga';

export interface DeityInfo {
  slug: DeitySlug;
  name: string;
  headline: string;
  description: string;
  image: string;
}

export const deities: Record<DeitySlug, DeityInfo> = {
  shyama: {
    slug: 'shyama',
    name: 'Шьяма Сундара',
    headline: 'Лотосные стопы Шьяма Сундары',
    description:
      'Созерцайте знаки на лотосных стопах Кришны. Данные будут автоматически отображены после добавления файлов.',
    image: '/images/shyama.png'
  },
  radharani: {
    slug: 'radharani',
    name: 'Шримати Радхарани',
    headline: 'Лотосные стопы Шримати Радхарани',
    description:
      'Добавьте изображение и описания знаков, чтобы раскрыть скрытые символы лотосных стоп Шримати Радхарани.',
    image: '/images/radharani.png'
  },
  gauranga: {
    slug: 'gauranga',
    name: 'Господь Гауранга',
    headline: 'Лотосные стопы Господа Гауранги',
    description:
      'После добавления файлов данные о знаках появятся поверх изображения стоп Господа Гауранги.',
    image: '/images/gauranga.png'
  }
};

export const deityList = Object.values(deities);
