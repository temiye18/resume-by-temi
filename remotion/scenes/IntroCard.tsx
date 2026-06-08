import { type FC } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from '../lib/tokens';

export const IntroCard: FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const dotOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const dotPulse =
    0.65 +
    0.35 *
      Math.sin((frame / fps) * Math.PI * 1.4);

  const wordmarkSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const wordmarkY = interpolate(wordmarkSpring, [0, 1], [16, 0]);
  const wordmarkOpacity = interpolate(wordmarkSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 28,
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: 9999,
          background: COLORS.accent,
          opacity: dotOpacity * dotPulse,
          boxShadow: `0 0 32px ${COLORS.accent}, 0 0 64px ${COLORS.accent}`,
        }}
      />
      <div
        style={{
          opacity: wordmarkOpacity,
          transform: `translateY(${wordmarkY}px)`,
          fontFamily: FONTS.display,
          fontSize: 112,
          fontWeight: 480,
          letterSpacing: '-0.028em',
          color: COLORS.ink,
          lineHeight: 1,
        }}
      >
        Résum<span style={{ fontStyle: 'italic', fontWeight: 400, color: COLORS.inkSoft }}>é</span>
      </div>
      <div
        style={{
          opacity: wordmarkOpacity,
          transform: `translateY(${wordmarkY}px)`,
          fontFamily: FONTS.mono,
          fontSize: 24,
          color: COLORS.muted,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
        }}
      >
        by Temi
      </div>
    </AbsoluteFill>
  );
};
