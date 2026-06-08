import { type FC } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from '../lib/tokens';

interface IField {
  label: string;
  top: number;
  height: number;
  detectAt: number;
}

const FIELDS: IField[] = [
  { label: 'NAME', top: 8, height: 12, detectAt: 0.1 },
  { label: 'TITLE', top: 24, height: 8, detectAt: 0.2 },
  { label: 'CONTACT', top: 36, height: 8, detectAt: 0.3 },
  { label: 'SUMMARY', top: 48, height: 14, detectAt: 0.42 },
  { label: 'EXPERIENCE', top: 66, height: 22, detectAt: 0.62 },
  { label: 'EDUCATION', top: 90, height: 12, detectAt: 0.82 },
];

const TEXT_LINES: { top: number; width: number }[] = [
  { top: 10, width: 60 }, { top: 14, width: 40 }, { top: 25, width: 48 },
  { top: 38, width: 70 }, { top: 49, width: 88 }, { top: 53, width: 82 },
  { top: 57, width: 70 }, { top: 67, width: 30 }, { top: 70, width: 76 },
  { top: 73, width: 64 }, { top: 76, width: 80 }, { top: 79, width: 50 },
  { top: 82, width: 72 }, { top: 85, width: 56 }, { top: 91, width: 32 },
  { top: 94, width: 70 }, { top: 97, width: 58 },
];

export const SmartParseScene: FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = Math.min(frame / (durationInFrames - 12), 1);
  const scanTop = progress * 100;

  const captionOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const captionY = interpolate(frame, [0, 18], [12, 0], { extrapolateRight: 'clamp' });

  const cardScale = interpolate(frame, [0, 24], [0.96, 1], { extrapolateRight: 'clamp' });
  const cardOpacity = interpolate(frame, [0, 24], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 48,
        padding: '0 200px',
      }}
    >
      <div
        style={{
          opacity: captionOpacity,
          transform: `translateY(${captionY}px)`,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <p
          style={{
            fontFamily: FONTS.mono,
            fontSize: 18,
            color: COLORS.muted,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          <span style={{
            display: 'inline-block',
            width: 8, height: 8, borderRadius: 9999,
            background: COLORS.accent, marginRight: 12,
            boxShadow: `0 0 8px ${COLORS.accent}, 0 0 16px ${COLORS.accent}`,
            verticalAlign: 'middle',
          }} />
          Smart parse · Gemini 2.5 Flash
        </p>
        <h2
          style={{
            fontFamily: FONTS.display,
            fontSize: 68,
            fontWeight: 470,
            letterSpacing: '-0.024em',
            color: COLORS.ink,
            margin: 0,
            lineHeight: 1.04,
          }}
        >
          Reading your résumé.
        </h2>
      </div>

      <div
        style={{
          opacity: cardOpacity,
          transform: `scale(${cardScale})`,
          position: 'relative',
          width: 480,
          height: 680,
          borderRadius: 6,
          border: `1px solid ${COLORS.border}`,
          background: `color-mix(in oklch, ${COLORS.surfaceSunk} 70%, ${COLORS.bg})`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(to right, ${COLORS.ink} 1px, transparent 1px), linear-gradient(to bottom, ${COLORS.ink} 1px, transparent 1px)`,
            backgroundSize: '12.5% 8.33%',
            opacity: 0.06,
          }}
        />
        {TEXT_LINES.map((line, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: '6%',
              top: `${line.top}%`,
              width: `${line.width}%`,
              height: 2,
              borderRadius: 9999,
              background: `color-mix(in oklch, ${COLORS.ink} 12%, transparent)`,
            }}
          />
        ))}
        {FIELDS.map((field) => {
          const detected = progress >= field.detectAt;
          const detectionOpacity = detected
            ? Math.min(1, (progress - field.detectAt) * 8)
            : 0;
          return (
            <div
              key={field.label}
              style={{
                position: 'absolute',
                left: '4%',
                right: '4%',
                top: `${field.top}%`,
                height: `${field.height}%`,
                borderRadius: 3,
                border: `1px solid ${COLORS.accent}`,
                background: `color-mix(in oklch, ${COLORS.accent} 12%, transparent)`,
                opacity: detectionOpacity,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: -2,
                  right: 4,
                  transform: 'translateY(-100%)',
                  background: COLORS.accent,
                  color: COLORS.accentOn,
                  fontFamily: FONTS.mono,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  padding: '2px 6px',
                  borderRadius: '3px 3px 0 0',
                  lineHeight: 1,
                }}
              >
                {field.label}
              </span>
            </div>
          );
        })}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${scanTop}%`,
            height: 2,
            background: COLORS.accent,
            boxShadow: `0 -16px 32px -8px ${COLORS.accent}, 0 0 16px ${COLORS.accent}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
