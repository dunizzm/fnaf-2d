# Сторонние материалы

MIT License в корне репозитория распространяется только на самостоятельно написанный код и документацию этого проекта: `dist/engine.js`, `dist/game.js`, `dist/career.js`, `dist/expanded.js`, `dist/style.css`, `dist/index.html`, тесты, `bundle.py`, `desktop/`, исходники оболочки в `ios/App/`, конфигурация iOS и `scripts/`.

Она не предоставляет прав на перечисленные ниже сторонние материалы. Их включение в репозиторий не означает, что они находятся под MIT или что правообладатели одобрили этот проект.

## Five Nights at Freddy’s

Персонажи, исходные изображения и исходные звуки принадлежат Scott Cawthon / соответствующим правообладателям FNAF. Эти материалы не лицензируются автором данного проекта.

К этой категории относятся изображения и звуки в `dist/assets/Textures/` и `dist/assets/Sounds/`, а также производные атласы `dist/assets/*-atlas.webp` и изображение `dist/assets/hero.webp`. Иконка в `ios/Assets.xcassets/AppIcon.appiconset/AppIcon.png` также производна от исходного изображения FNAF и исключена из MIT. Перекодирование, извлечение кадров или обрезка не меняют их статус.

Источник файлов: [wellsousaaa/Five-Nights-at-Freddys-Web — src/media](https://github.com/wellsousaaa/Five-Nights-at-Freddys-Web/tree/main/src/media).

## Consolas

`dist/assets/Consolas.ttf` — шрифт Microsoft. Дизайнер — Luc(as) de Groot; производитель и правообладатель — Microsoft Corporation (по метаданным файла). Он исключён из MIT License проекта. Право использования определяется условиями правообладателя; наличие файла здесь не предоставляет отдельной лицензии на его распространение.

Источник файла: [MemeCrafters/meme-generator — consola.ttf](https://github.com/MemeCrafters/meme-generator/blob/main/resources/fonts/consola.ttf).

## Синтезируемые звуки

Металлические шаги и писк носа создаются программно в `dist/game.js`. Код их синтеза входит в MIT License проекта.

## Настольная оболочка

Дистрибутивы включают Electron, Chromium и их зависимости под собственными лицензиями. Сборка сохраняет файлы `LICENSE` и `LICENSES.chromium.html`, предоставленные Electron. Подробности: https://github.com/electron/electron/blob/main/LICENSE . Эти зависимости не становятся собственностью автора игры.

## Endo-01 (Expanded)

Endo-01 is drawn directly from the original `Textures/Cams/Backstage.webp` pixels with a runtime polygon mask; its head is enlarged for the jumpscare. No external fan render is included. The original FNAF artwork remains © Scott Cawthon, excluded from MIT, and comes from the texture repository credited above.
