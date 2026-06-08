import { type FC } from 'react';
import { Composition } from 'remotion';
import { DemoVideo } from './DemoVideo';

export const RemotionRoot: FC = () => {
  return (
    <>
      <Composition
        id="demo"
        component={DemoVideo}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
