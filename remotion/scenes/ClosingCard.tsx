import { type FC } from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from '../lib/tokens';

export const ClosingCard: FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enterSpring = spring({ frame, fps, config: { damping: 16, stiffness: 90 } });
  const enterOpacity = interpolate(enterSpring, [0, 1], [0, 1]);
  const enterY = interpolate(enterSpring, [0, 1], [12, 0]);

  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 18, durationInFrames - 2],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const opacity = enterOpacity * exitOpacity;

  const dotPulse = 0.65 + 0.35 * Math.sin((frame / fps) * Math.PI * 1.6);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 32,
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${enterY}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 14,
            height: 14,
            borderRadius: 9999,
            background: COLORS.accent,
            opacity: dotPulse,
            boxShadow: `0 0 16px ${COLORS.accent}, 0 0 32px ${COLORS.accent}`,
          }}
        />
        <span
          style={{
            fontFamily: FONTS.display,
            fontSize: 88,
            fontWeight: 470,
            letterSpacing: '-0.028em',
            color: COLORS.ink,
            lineHeight: 1,
          }}
        >
          Résum<span style={{ fontStyle: 'italic', fontWeight: 400, color: COLORS.inkSoft }}>é</span>
        </span>
      </div>
      <div
        style={{
          opacity,
          transform: `translateY(${enterY}px)`,
          fontFamily: FONTS.mono,
          fontSize: 22,
          color: COLORS.muted,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
        }}
      >
        resume-by-temi
      </div>
    </AbsoluteFill>
  );
};
