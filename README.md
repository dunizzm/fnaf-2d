# FNAF 2D — Expanded Edition

Отдельная расширенная версия в ветке `expanded-edition`. Классическая игра, её [ветка main](https://github.com/dunizzm/fnaf-2d/tree/main) и прежние релизы сохраняются.

Девятиминутные смены, деньги и премии, магазин восьми предметов, фигурки аниматроников с бонусами, включаемые точные часы, управляемый вентилятор, температура и аварийный заряд. Подробности: [EXPANDED.md](EXPANDED.md).

## Запуск

Скачайте **Expanded Linux x64** из [Releases](https://github.com/dunizzm/fnaf-2d/releases), распакуйте архив и запустите `FNAF-2D-Expanded` из полученной папки. Нужны графическая сессия Linux и системные библиотеки Chromium/Electron. Во время игры интернет не нужен.

Для разработки: Node.js 24, `npm ci`, затем `npm start`. Проверки: `npm test`. Сборка на Linux: `npm run build:desktop`; для автоматической проверки запуска нужен `xvfb-run`. Архив появится в `release/`.

Локальный браузерный просмотр: `python -m http.server 4318 --directory dist`, затем http://localhost:4318. Автономный HTML без сервера: `python bundle.py`; результат в `outputs/`. Исходники интерфейса и движка находятся в `dist/`.

## Прогресс

Покупки, деньги, установленные фигурки, точные часы и смены сохраняются локально. Данные Expanded отделены от классической игры. Новая кампания сохраняет имущество. Фигурки дают бонусы со следующей смены, когда поставлены на стол. Одновременно можно поставить все четыре фигурки.

## Contributors и благодарности

- **[dunizzm](https://github.com/dunizzm)** — идея, требования, тестирование и обратная связь.
- **ChatGPT / Codex (OpenAI)** — помощь с кодом, интерфейсом, звуком, проверками и сборкой.
- **Scott Cawthon / правообладатели FNAF** — оригинальная игра, персонажи, графика и исходные звуки.
- **[wellsousaaa](https://github.com/wellsousaaa/Five-Nights-at-Freddys-Web)** — источник файлов изображений и звуков.
- **Luc(as) de Groot и Microsoft Corporation** — дизайнер и правообладатель Consolas.
- **[MemeCrafters](https://github.com/MemeCrafters/meme-generator)** — источник файла шрифта.

Подробнее: [CONTRIBUTORS.md](CONTRIBUTORS.md).

## Лицензия

Самостоятельно написанный код и документация — [MIT](LICENSE). **Текстуры, исходные звуки FNAF, производные атласы и шрифт Consolas не входят в MIT.** См. [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
