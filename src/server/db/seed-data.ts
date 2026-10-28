// Данные каталога для сида. Состав подобран под требования: девять категорий по шесть товаров,
// цены от сотен рублей до сотен тысяч, несколько товаров нет в наличии, у части нет изображения.

export type SeedCategory = {
  slug: string;
  name: string;
};

export type SeedProduct = {
  slug: string;
  category: string;
  name: string;
  description: string;
  price: number;
  // false — товар без изображения, на витрине показывается заглушка.
  hasImage?: boolean;
  available?: boolean;
};

export type SeedPromo = {
  slug: string;
  product: string;
  title: string;
  text: string;
};

export const categories: SeedCategory[] = [
  { slug: "gpu", name: "Видеокарты" },
  { slug: "cpu", name: "Процессоры" },
  { slug: "motherboards", name: "Материнские платы" },
  { slug: "ram", name: "Оперативная память" },
  { slug: "storage", name: "Накопители" },
  { slug: "psu", name: "Блоки питания" },
  { slug: "cases", name: "Корпуса" },
  { slug: "cooling", name: "Охлаждение" },
  { slug: "peripherals", name: "Периферия" },
];

export const products: SeedProduct[] = [
  {
    slug: "gpu-rtx-4060-dual",
    category: "gpu",
    name: "Видеокарта Palit GeForce RTX 4060 Dual 8 ГБ",
    description:
      "Компактная видеокарта для игр в Full HD: DLSS 3, трассировка лучей, два вентилятора.",
    price: 32990,
  },
  {
    slug: "gpu-rtx-4070-super",
    category: "gpu",
    name: "Видеокарта MSI GeForce RTX 4070 Super Ventus 12 ГБ",
    description:
      "Уверенная производительность в 1440p, 12 ГБ памяти GDDR6X и тихая система охлаждения.",
    price: 68990,
  },
  {
    slug: "gpu-rtx-4090-suprim",
    category: "gpu",
    name: "Видеокарта MSI GeForce RTX 4090 Suprim X 24 ГБ",
    description: "Флагман для 4K и рендеринга: 24 ГБ GDDR6X, массивный радиатор и подсветка.",
    price: 249990,
  },
  {
    slug: "gpu-rx-7600",
    category: "gpu",
    name: "Видеокарта Sapphire Radeon RX 7600 Pulse 8 ГБ",
    description: "Доступная карта на архитектуре RDNA 3 для киберспортивных игр.",
    price: 27490,
  },
  {
    slug: "gpu-rx-7800-xt",
    category: "gpu",
    name: "Видеокарта PowerColor Radeon RX 7800 XT Hellhound 16 ГБ",
    description: "16 ГБ памяти для игр в высоком разрешении и запас на будущее.",
    price: 54990,
    available: false,
  },
  {
    slug: "gpu-arc-a750",
    category: "gpu",
    name: "Видеокарта Intel Arc A750 Limited Edition 8 ГБ",
    description: "Видеокарта Intel с аппаратным кодированием AV1 для стримеров.",
    price: 21990,
    hasImage: false,
  },
  {
    slug: "cpu-ryzen-5-7600",
    category: "cpu",
    name: "Процессор AMD Ryzen 5 7600 BOX",
    description: "Шесть ядер Zen 4 и кулер в комплекте — оптимальный старт на платформе AM5.",
    price: 18990,
  },
  {
    slug: "cpu-ryzen-7-7800x3d",
    category: "cpu",
    name: "Процессор AMD Ryzen 7 7800X3D OEM",
    description: "Игровой процессор с 3D V-Cache: максимум кадров в секунду в играх.",
    price: 39990,
  },
  {
    slug: "cpu-ryzen-9-7950x",
    category: "cpu",
    name: "Процессор AMD Ryzen 9 7950X OEM",
    description: "Шестнадцать ядер для рендеринга, компиляции и виртуализации.",
    price: 54990,
  },
  {
    slug: "cpu-core-i5-14400f",
    category: "cpu",
    name: "Процессор Intel Core i5-14400F BOX",
    description: "Десять ядер для игр и работы без встроенной графики.",
    price: 16490,
  },
  {
    slug: "cpu-core-i7-14700k",
    category: "cpu",
    name: "Процессор Intel Core i7-14700K OEM",
    description: "Двадцать ядер и разблокированный множитель для разгона.",
    price: 38990,
  },
  {
    slug: "cpu-core-i9-14900k",
    category: "cpu",
    name: "Процессор Intel Core i9-14900K OEM",
    description: "Флагман Intel с частотой до 6 ГГц для самых тяжёлых задач.",
    price: 57990,
    available: false,
  },
  {
    slug: "mb-b650-tomahawk",
    category: "motherboards",
    name: "Материнская плата MSI MAG B650 Tomahawk WiFi",
    description: "Плата AM5 с усиленным питанием, Wi-Fi 6E и тремя слотами M.2.",
    price: 21990,
  },
  {
    slug: "mb-x670e-hero",
    category: "motherboards",
    name: "Материнская плата ASUS ROG Crosshair X670E Hero",
    description: "Топовая плата AM5 с PCIe 5.0 для видеокарты и накопителей.",
    price: 64990,
  },
  {
    slug: "mb-b760m-ds3h",
    category: "motherboards",
    name: "Материнская плата Gigabyte B760M DS3H DDR4",
    description: "Компактная micro-ATX плата для процессоров Intel 12–14 поколений.",
    price: 10490,
  },
  {
    slug: "mb-z790-aorus-elite",
    category: "motherboards",
    name: "Материнская плата Gigabyte Z790 Aorus Elite AX",
    description: "Плата для разгона процессоров Intel с поддержкой DDR5.",
    price: 26990,
  },
  {
    slug: "mb-a620m-e",
    category: "motherboards",
    name: "Материнская плата ASUS Prime A620M-E",
    description: "Недорогая плата AM5 для офисных и домашних сборок.",
    price: 8990,
  },
  {
    slug: "mb-b550-gaming-plus",
    category: "motherboards",
    name: "Материнская плата MSI B550 Gaming Plus",
    description: "Проверенная плата AM4 с двумя слотами M.2 и хорошим питанием.",
    price: 11990,
  },
  {
    slug: "ram-fury-beast-16",
    category: "ram",
    name: "Оперативная память Kingston Fury Beast DDR4 16 ГБ (2×8 ГБ) 3200 МГц",
    description: "Комплект из двух модулей с радиаторами для платформ DDR4.",
    price: 3990,
  },
  {
    slug: "ram-vengeance-32",
    category: "ram",
    name: "Оперативная память Corsair Vengeance DDR5 32 ГБ (2×16 ГБ) 6000 МГц",
    description: "Быстрый комплект DDR5 с профилями EXPO и XMP.",
    price: 11490,
  },
  {
    slug: "ram-trident-z5-64",
    category: "ram",
    name: "Оперативная память G.Skill Trident Z5 RGB DDR5 64 ГБ (2×32 ГБ) 6400 МГц",
    description: "Большой объём для монтажа видео и виртуальных машин, RGB-подсветка.",
    price: 24990,
  },
  {
    slug: "ram-crucial-8",
    category: "ram",
    name: "Оперативная память Crucial DDR4 8 ГБ 3200 МГц",
    description: "Одиночный модуль для апгрейда офисного компьютера.",
    price: 1690,
  },
  {
    slug: "ram-adata-xpg-32",
    category: "ram",
    name: "Оперативная память ADATA XPG Lancer DDR5 32 ГБ (2×16 ГБ) 5600 МГц",
    description: "Комплект DDR5 с низким профилем радиаторов.",
    price: 9490,
    hasImage: false,
  },
  {
    slug: "ram-patriot-viper-16",
    category: "ram",
    name: "Оперативная память Patriot Viper Steel DDR4 16 ГБ (2×8 ГБ) 3600 МГц",
    description: "Разогнанный комплект DDR4 для игровых сборок.",
    price: 4490,
  },
  {
    slug: "ssd-samsung-990-pro-1tb",
    category: "storage",
    name: "SSD Samsung 990 Pro 1 ТБ M.2 NVMe",
    description: "Накопитель PCIe 4.0 со скоростью чтения до 7450 МБ/с.",
    price: 11990,
  },
  {
    slug: "ssd-wd-sn770-500gb",
    category: "storage",
    name: "SSD WD Blue SN770 500 ГБ M.2 NVMe",
    description: "Быстрый системный диск по доступной цене.",
    price: 4290,
  },
  {
    slug: "ssd-crucial-mx500-1tb",
    category: "storage",
    name: "SSD Crucial MX500 1 ТБ 2,5 дюйма SATA",
    description: "Надёжный SATA-накопитель для апгрейда старых компьютеров.",
    price: 6490,
  },
  {
    slug: "hdd-seagate-barracuda-2tb",
    category: "storage",
    name: "Жёсткий диск Seagate BarraCuda 2 ТБ 7200 об/мин",
    description: "Вместительный диск для хранения фото, видео и архивов.",
    price: 5990,
  },
  {
    slug: "hdd-wd-red-8tb",
    category: "storage",
    name: "Жёсткий диск WD Red Plus 8 ТБ для NAS",
    description: "Диск для сетевых хранилищ, рассчитанный на круглосуточную работу.",
    price: 21490,
  },
  {
    slug: "ssd-kingston-kc3000-2tb",
    category: "storage",
    name: "SSD Kingston KC3000 2 ТБ M.2 NVMe",
    description: "Ёмкий NVMe-накопитель с радиатором для игр и рабочих проектов.",
    price: 15990,
  },
  {
    slug: "psu-be-quiet-650",
    category: "psu",
    name: "Блок питания be quiet! Pure Power 12 M 650 Вт",
    description: "Тихий модульный блок питания с сертификатом 80 PLUS Gold.",
    price: 8990,
  },
  {
    slug: "psu-corsair-rm850x",
    category: "psu",
    name: "Блок питания Corsair RM850x 850 Вт",
    description: "Полностью модульный блок для мощных игровых систем.",
    price: 13990,
  },
  {
    slug: "psu-seasonic-1000",
    category: "psu",
    name: "Блок питания Seasonic Prime TX-1000 1000 Вт",
    description: "Блок с сертификатом 80 PLUS Titanium и гарантией 12 лет.",
    price: 32990,
  },
  {
    slug: "psu-deepcool-500",
    category: "psu",
    name: "Блок питания DeepCool PK500D 500 Вт",
    description: "Бюджетный блок питания с сертификатом 80 PLUS Bronze.",
    price: 3990,
  },
  {
    slug: "psu-chieftec-750",
    category: "psu",
    name: "Блок питания Chieftec Proton 750 Вт",
    description: "Надёжный блок для сборок средней мощности.",
    price: 7490,
  },
  {
    slug: "psu-msi-a1000g",
    category: "psu",
    name: "Блок питания MSI MPG A1000G 1000 Вт",
    description: "Блок с разъёмом 12VHPWR для современных видеокарт.",
    price: 17990,
    available: false,
  },
  {
    slug: "case-nzxt-h5-flow",
    category: "cases",
    name: "Корпус NZXT H5 Flow чёрный",
    description: "Корпус Mid-Tower с перфорированной передней панелью для хорошего продува.",
    price: 8990,
  },
  {
    slug: "case-lian-li-o11",
    category: "cases",
    name: "Корпус Lian Li O11 Dynamic EVO",
    description: "Корпус-аквариум с двумя стеклянными панелями для эффектных сборок.",
    price: 15990,
  },
  {
    slug: "case-fractal-north",
    category: "cases",
    name: "Корпус Fractal Design North с деревянной панелью",
    description: "Стильный корпус с ореховыми вставками и сетчатой панелью.",
    price: 13490,
  },
  {
    slug: "case-zalman-s2",
    category: "cases",
    name: "Корпус Zalman S2 чёрный",
    description: "Недорогой корпус с прозрачной боковой стенкой.",
    price: 2990,
  },
  {
    slug: "case-be-quiet-500dx",
    category: "cases",
    name: "Корпус be quiet! Pure Base 500DX",
    description: "Тихий корпус с тремя вентиляторами в комплекте.",
    price: 10990,
  },
  {
    slug: "case-cooler-master-nr200",
    category: "cases",
    name: "Корпус Cooler Master NR200P Mini-ITX",
    description: "Компактный корпус для маленьких, но мощных сборок.",
    price: 9490,
    hasImage: false,
  },
  {
    slug: "cooler-deepcool-ak400",
    category: "cooling",
    name: "Кулер для процессора DeepCool AK400",
    description: "Башенный кулер на четырёх тепловых трубках с тихим вентилятором.",
    price: 2690,
  },
  {
    slug: "cooler-noctua-nh-d15",
    category: "cooling",
    name: "Кулер для процессора Noctua NH-D15",
    description: "Легендарный двухбашенный кулер для топовых процессоров.",
    price: 11990,
  },
  {
    slug: "aio-arctic-lf3-360",
    category: "cooling",
    name: "Жидкостное охлаждение Arctic Liquid Freezer III 360",
    description: "Необслуживаемая СЖО с радиатором 360 мм.",
    price: 10490,
  },
  {
    slug: "fan-arctic-p12-5pack",
    category: "cooling",
    name: "Вентиляторы Arctic P12 PWM PST, 5 штук",
    description: "Набор тихих корпусных вентиляторов 120 мм.",
    price: 2490,
  },
  {
    slug: "paste-arctic-mx6",
    category: "cooling",
    name: "Термопаста Arctic MX-6, 4 г",
    description: "Термопаста с высокой теплопроводностью для процессоров и видеокарт.",
    price: 690,
  },
  {
    slug: "aio-nzxt-kraken-280",
    category: "cooling",
    name: "Жидкостное охлаждение NZXT Kraken 280 с дисплеем",
    description: "СЖО с LCD-экраном на помпе для вывода температуры.",
    price: 18990,
  },
  {
    slug: "kb-logitech-g-pro",
    category: "peripherals",
    name: "Клавиатура Logitech G Pro X TKL",
    description: "Беспроводная механическая клавиатура без цифрового блока.",
    price: 17990,
  },
  {
    slug: "mouse-razer-viper-v3",
    category: "peripherals",
    name: "Мышь Razer Viper V3 Pro",
    description: "Лёгкая беспроводная мышь для киберспорта.",
    price: 15990,
  },
  {
    slug: "monitor-lg-27gp850",
    category: "peripherals",
    name: "Монитор LG UltraGear 27GP850 27 дюймов 165 Гц",
    description: "IPS-монитор с разрешением 2560×1440 для игр.",
    price: 34990,
  },
  {
    slug: "headset-hyperx-cloud2",
    category: "peripherals",
    name: "Гарнитура HyperX Cloud II",
    description: "Удобная игровая гарнитура с виртуальным звуком 7.1.",
    price: 7990,
  },
  {
    slug: "mousepad-steelseries-qck",
    category: "peripherals",
    name: "Коврик для мыши SteelSeries QcK Medium",
    description: "Тканевый коврик с прорезиненным основанием.",
    price: 990,
  },
  {
    slug: "webcam-logitech-c920",
    category: "peripherals",
    name: "Веб-камера Logitech C920 HD Pro",
    description: "Камера Full HD для видеозвонков и стримов.",
    price: 6990,
    available: false,
  },
];

// Промо-блоки ведут только на доступные товары, и один товар — не больше чем в одном блоке.
export const promos: SeedPromo[] = [
  {
    slug: "promo-rtx-4070-super",
    product: "gpu-rtx-4070-super",
    title: "Игры в 1440p без компромиссов",
    text: "RTX 4070 Super тянет современные игры на высоких настройках и не шумит под нагрузкой.",
  },
  {
    slug: "promo-ryzen-7800x3d",
    product: "cpu-ryzen-7-7800x3d",
    title: "Лучший игровой процессор",
    text: "Ryzen 7 7800X3D с увеличенным кешем даёт прибавку кадров там, где другие упираются в процессор.",
  },
  {
    slug: "promo-samsung-990-pro",
    product: "ssd-samsung-990-pro-1tb",
    title: "Загрузки за секунды",
    text: "Samsung 990 Pro — быстрый NVMe-накопитель для системы и игр.",
  },
];
