import { Font } from '@react-pdf/renderer';

import InterRegular from '@fontsource/inter/files/inter-latin-400-normal.woff?url';
import InterBold from '@fontsource/inter/files/inter-latin-700-normal.woff?url';
import InterItalic from '@fontsource/inter/files/inter-latin-400-italic.woff?url';
import InterBoldItalic from '@fontsource/inter/files/inter-latin-700-italic.woff?url';

import SourceSerif4Regular from '@fontsource/source-serif-4/files/source-serif-4-latin-400-normal.woff?url';
import SourceSerif4Bold from '@fontsource/source-serif-4/files/source-serif-4-latin-700-normal.woff?url';
import SourceSerif4Italic from '@fontsource/source-serif-4/files/source-serif-4-latin-400-italic.woff?url';
import SourceSerif4BoldItalic from '@fontsource/source-serif-4/files/source-serif-4-latin-700-italic.woff?url';

import EBGaramondRegular from '@fontsource/eb-garamond/files/eb-garamond-latin-400-normal.woff?url';
import EBGaramondBold from '@fontsource/eb-garamond/files/eb-garamond-latin-700-normal.woff?url';
import EBGaramondItalic from '@fontsource/eb-garamond/files/eb-garamond-latin-400-italic.woff?url';
import EBGaramondBoldItalic from '@fontsource/eb-garamond/files/eb-garamond-latin-700-italic.woff?url';

import IBMPlexSansRegular from '@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff?url';
import IBMPlexSansBold from '@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-700-normal.woff?url';
import IBMPlexSansItalic from '@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-italic.woff?url';
import IBMPlexSansBoldItalic from '@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-700-italic.woff?url';

import JetBrainsMonoRegular from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff?url';
import JetBrainsMonoBold from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff?url';

import LatoRegular from '@fontsource/lato/files/lato-latin-400-normal.woff?url';
import LatoBold from '@fontsource/lato/files/lato-latin-700-normal.woff?url';
import LatoItalic from '@fontsource/lato/files/lato-latin-400-italic.woff?url';
import LatoBoldItalic from '@fontsource/lato/files/lato-latin-700-italic.woff?url';

import LoraRegular from '@fontsource/lora/files/lora-latin-400-normal.woff?url';
import LoraBold from '@fontsource/lora/files/lora-latin-700-normal.woff?url';
import LoraItalic from '@fontsource/lora/files/lora-latin-400-italic.woff?url';
import LoraBoldItalic from '@fontsource/lora/files/lora-latin-700-italic.woff?url';

import SourceSans3Regular from '@fontsource/source-sans-3/files/source-sans-3-latin-400-normal.woff?url';
import SourceSans3Bold from '@fontsource/source-sans-3/files/source-sans-3-latin-700-normal.woff?url';
import SourceSans3Italic from '@fontsource/source-sans-3/files/source-sans-3-latin-400-italic.woff?url';
import SourceSans3BoldItalic from '@fontsource/source-sans-3/files/source-sans-3-latin-700-italic.woff?url';

import OpenSansRegular from '@fontsource/open-sans/files/open-sans-latin-400-normal.woff?url';
import OpenSansBold from '@fontsource/open-sans/files/open-sans-latin-700-normal.woff?url';
import OpenSansItalic from '@fontsource/open-sans/files/open-sans-latin-400-italic.woff?url';
import OpenSansBoldItalic from '@fontsource/open-sans/files/open-sans-latin-700-italic.woff?url';

import MerriweatherRegular from '@fontsource/merriweather/files/merriweather-latin-400-normal.woff?url';
import MerriweatherBold from '@fontsource/merriweather/files/merriweather-latin-700-normal.woff?url';
import MerriweatherItalic from '@fontsource/merriweather/files/merriweather-latin-400-italic.woff?url';
import MerriweatherBoldItalic from '@fontsource/merriweather/files/merriweather-latin-700-italic.woff?url';

let registered = false;

export const ensureFontsRegistered = (): void => {
  if (registered) return;
  registered = true;

  Font.register({
    family: 'Inter',
    fonts: [
      { src: InterRegular, fontWeight: 400 },
      { src: InterBold, fontWeight: 700 },
      { src: InterItalic, fontWeight: 400, fontStyle: 'italic' },
      { src: InterBoldItalic, fontWeight: 700, fontStyle: 'italic' },
    ],
  });

  Font.register({
    family: 'Source Serif 4',
    fonts: [
      { src: SourceSerif4Regular, fontWeight: 400 },
      { src: SourceSerif4Bold, fontWeight: 700 },
      { src: SourceSerif4Italic, fontWeight: 400, fontStyle: 'italic' },
      { src: SourceSerif4BoldItalic, fontWeight: 700, fontStyle: 'italic' },
    ],
  });

  Font.register({
    family: 'EB Garamond',
    fonts: [
      { src: EBGaramondRegular, fontWeight: 400 },
      { src: EBGaramondBold, fontWeight: 700 },
      { src: EBGaramondItalic, fontWeight: 400, fontStyle: 'italic' },
      { src: EBGaramondBoldItalic, fontWeight: 700, fontStyle: 'italic' },
    ],
  });

  Font.register({
    family: 'IBM Plex Sans',
    fonts: [
      { src: IBMPlexSansRegular, fontWeight: 400 },
      { src: IBMPlexSansBold, fontWeight: 700 },
      { src: IBMPlexSansItalic, fontWeight: 400, fontStyle: 'italic' },
      { src: IBMPlexSansBoldItalic, fontWeight: 700, fontStyle: 'italic' },
    ],
  });

  Font.register({
    family: 'JetBrains Mono',
    fonts: [
      { src: JetBrainsMonoRegular, fontWeight: 400 },
      { src: JetBrainsMonoBold, fontWeight: 700 },
    ],
  });

  Font.register({
    family: 'Lato',
    fonts: [
      { src: LatoRegular, fontWeight: 400 },
      { src: LatoBold, fontWeight: 700 },
      { src: LatoItalic, fontWeight: 400, fontStyle: 'italic' },
      { src: LatoBoldItalic, fontWeight: 700, fontStyle: 'italic' },
    ],
  });

  Font.register({
    family: 'Lora',
    fonts: [
      { src: LoraRegular, fontWeight: 400 },
      { src: LoraBold, fontWeight: 700 },
      { src: LoraItalic, fontWeight: 400, fontStyle: 'italic' },
      { src: LoraBoldItalic, fontWeight: 700, fontStyle: 'italic' },
    ],
  });

  Font.register({
    family: 'Source Sans 3',
    fonts: [
      { src: SourceSans3Regular, fontWeight: 400 },
      { src: SourceSans3Bold, fontWeight: 700 },
      { src: SourceSans3Italic, fontWeight: 400, fontStyle: 'italic' },
      { src: SourceSans3BoldItalic, fontWeight: 700, fontStyle: 'italic' },
    ],
  });

  Font.register({
    family: 'Open Sans',
    fonts: [
      { src: OpenSansRegular, fontWeight: 400 },
      { src: OpenSansBold, fontWeight: 700 },
      { src: OpenSansItalic, fontWeight: 400, fontStyle: 'italic' },
      { src: OpenSansBoldItalic, fontWeight: 700, fontStyle: 'italic' },
    ],
  });

  Font.register({
    family: 'Merriweather',
    fonts: [
      { src: MerriweatherRegular, fontWeight: 400 },
      { src: MerriweatherBold, fontWeight: 700 },
      { src: MerriweatherItalic, fontWeight: 400, fontStyle: 'italic' },
      { src: MerriweatherBoldItalic, fontWeight: 700, fontStyle: 'italic' },
    ],
  });

  Font.registerHyphenationCallback((word) => [word]);
};
