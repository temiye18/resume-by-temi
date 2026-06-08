import { type FC } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, FONTS } from '../lib/tokens';

export const HookCaption: FC = () => {
  const frame = useCurrentFrame();

  const lineOneOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const lineOneY = interpolate(frame, [0, 18], [12, 0], { extrapolateRight: 'clamp' });

  const lineTwoOpacity = interpolate(frame, [18, 36], [0, 1], { extrapolateRight: 'clamp' });
  const lineTwoY = interpolate(frame, [18, 36], [12, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
        padding: '0 200px',
      }}
    >
      <div
        style={{
          opacity: lineOneOpacity,
          transform: `translateY(${lineOneY}px)`,
          fontFamily: FONTS.display,
          fontSize: 84,
          fontWeight: 470,
          letterSpacing: '-0.026em',
          color: COLORS.ink,
          lineHeight: 1.02,
          textAlign: 'center',
        }}
      >
        Hand in the résumé you have.
      </div>
      <div
        style={{
          opacity: lineTwoOpacity,
          transform: `translateY(${lineTwoY}px)`,
          fontFamily: FONTS.display,
          fontSize: 84,
          fontWeight: 400,
          fontStyle: 'italic',
          letterSpacing: '-0.026em',
          color: COLORS.inkSoft,
          lineHeight: 1.02,
          textAlign: 'center',
        }}
      >
        Open the one you can edit.
      </div>
    </AbsoluteFill>
  );
};
