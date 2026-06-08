import { type FC } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, FONTS } from '../lib/tokens';

export const PrivacyScene: FC = () => {
  const frame = useCurrentFrame();

  const ownerOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const ownerY = interpolate(frame, [0, 18], [12, 0], { extrapolateRight: 'clamp' });

  const stayOpacity = interpolate(frame, [16, 36], [0, 1], { extrapolateRight: 'clamp' });
  const stayY = interpolate(frame, [16, 36], [12, 0], { extrapolateRight: 'clamp' });

  const lineOpacity = interpolate(frame, [44, 70], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 24,
        padding: '0 240px',
      }}
    >
      <div
        style={{
          opacity: ownerOpacity,
          transform: `translateY(${ownerY}px)`,
          fontFamily: FONTS.display,
          fontSize: 96,
          fontWeight: 470,
          letterSpacing: '-0.028em',
          color: COLORS.ink,
          lineHeight: 1.02,
          textAlign: 'center',
        }}
      >
        The editor stays on{' '}
        <span style={{ fontStyle: 'italic', fontWeight: 400, color: COLORS.accent }}>
          your
        </span>{' '}
        machine.
      </div>
      <div
        style={{
          opacity: stayOpacity,
          transform: `translateY(${stayY}px)`,
          fontFamily: FONTS.body,
          fontSize: 24,
          color: COLORS.inkSoft,
          lineHeight: 1.45,
          textAlign: 'center',
          maxWidth: '60ch',
        }}
      >
        IndexedDB on your device. Nothing about the résumé content is sent
        anywhere unless you opt in to smart parse on import.
      </div>
      <div
        style={{
          opacity: lineOpacity,
          marginTop: 16,
          height: 1,
          width: 80,
          background: COLORS.borderStrong,
        }}
      />
    </AbsoluteFill>
  );
};
