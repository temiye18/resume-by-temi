import { type FC, useEffect } from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { loadFonts } from './lib/loadFonts';
import { IntroCard } from './scenes/IntroCard';
import { HookCaption } from './scenes/HookCaption';
import { SmartParseScene } from './scenes/SmartParseScene';
import { EditorScene } from './scenes/EditorScene';
import { AtsScene } from './scenes/AtsScene';
import { PrivacyScene } from './scenes/PrivacyScene';
import { ClosingCard } from './scenes/ClosingCard';

export const DemoVideo: FC = () => {
  useEffect(() => {
    loadFonts();
  }, []);

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Sequence from={0} durationInFrames={90}>
        <IntroCard />
      </Sequence>
      <Sequence from={90} durationInFrames={90}>
        <HookCaption />
      </Sequence>
      <Sequence from={180} durationInFrames={180}>
        <SmartParseScene />
      </Sequence>
      <Sequence from={360} durationInFrames={180}>
        <EditorScene />
      </Sequence>
      <Sequence from={540} durationInFrames={150}>
        <AtsScene />
      </Sequence>
      <Sequence from={690} durationInFrames={120}>
        <PrivacyScene />
      </Sequence>
      <Sequence from={810} durationInFrames={90}>
        <ClosingCard />
      </Sequence>
    </AbsoluteFill>
  );
};
