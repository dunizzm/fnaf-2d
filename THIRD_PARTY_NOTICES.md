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

## Phantom Balloon Boy — original FNAF 3 resources (Expanded 2.1.0)

`Textures/CustomNight/phantom-bb.png` and `PhantomBB-atlas.webp` use original FNAF 3 images archived in [Dwell888/FNAF3html5](https://github.com/Dwell888/FNAF3html5/blob/main/index.html), sprite target “BB Jumpscare”, costumes 226–667. The camera face uses costume 347. Frames are packed into a WebP atlas without generating or redesigning the artwork.

`Sounds/phantom-scream.ogg` is the FNAF 3 `scream3.ogg` audio obtained from [emilia-gomes2008/fnaf-jumpscare-extension](https://github.com/emilia-gomes2008/fnaf-jumpscare-extension/tree/main/jumpscare_sounds/fnaf3). The generated replacement previously used in 2.0.9 has been removed.

Original FNAF images, animations and sounds © Scott Cawthon; excluded from the code MIT license.
