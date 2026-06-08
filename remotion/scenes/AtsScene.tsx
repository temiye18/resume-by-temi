import { type FC } from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from '../lib/tokens';

const RULES = [
  { name: 'Selectable text', detail: 'Real vector glyphs, fonts embedded.', delay: 24 },
  { name: 'Single-column layout', detail: 'Linear reading order across pages.', delay: 38 },
  { name: 'Standard headings', detail: 'Summary · Experience · Education · Skills.', delay: 52 },
  { name: 'Round-trip per field', detail: 'Every role, school, skill appears in the text layer.', delay: 66 },
  { name: 'Action verbs', detail: 'Led · Built · Shipped · Engineered.', delay: 80 },
];

export const AtsScene: FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headSpring = spring({ frame, fps, config: { damping: 16, stiffness: 100 } });
  const headOpacity = interpolate(headSpring, [0, 1], [0, 1]);
  const headY = interpolate(headSpring, [0, 1], [16, 0]);

  const scoreProgress = interpolate(frame, [10, 90], [0, 92], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const score = Math.round(scoreProgress);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 36,
        padding: '0 200px',
      }}
    >
      <div
        style={{
          opacity: headOpacity,
          transform: `translateY(${headY}px)`,
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
          ATS check · 24 rules
        </p>
        <h2
          style={{
            fontFamily: FONTS.display,
            fontSize: 64,
            fontWeight: 470,
            letterSpacing: '-0.024em',
            color: COLORS.ink,
            margin: 0,
            lineHeight: 1.04,
          }}
        >
          Passes every ATS, every time.
        </h2>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 64,
          marginTop: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
            minWidth: 260,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 220,
              fontWeight: 600,
              color: COLORS.success,
              lineHeight: 1,
              fontFeatureSettings: '"tnum"',
              textShadow: `0 0 64px color-mix(in oklch, ${COLORS.success} 30%, transparent)`,
            }}
          >
            {String(score).padStart(2, '0')}
          </div>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 18,
              color: COLORS.muted,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginTop: 4,
            }}
          >
            Score
          </div>
        </div>

        <div style={{ width: 1, background: COLORS.border }} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            minWidth: 480,
            justifyContent: 'center',
          }}
        >
          {RULES.map((rule, i) => {
            const ruleOpacity = interpolate(
              frame,
              [rule.delay, rule.delay + 12],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
            );
            const ruleX = interpolate(
              frame,
              [rule.delay, rule.delay + 12],
              [12, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
            );
            return (
              <div
                key={i}
                style={{
                  opacity: ruleOpacity,
                  transform: `translateX(${ruleX}px)`,
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    marginTop: 6,
                    width: 8,
                    height: 8,
                    borderRadius: 9999,
                    background: COLORS.success,
                    boxShadow: `0 0 8px ${COLORS.success}`,
                  }}
                />
                <div>
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 22,
                      fontWeight: 500,
                      color: COLORS.ink,
                      lineHeight: 1.1,
                    }}
                  >
                    {rule.name}
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: 15,
                      color: COLORS.inkSoft,
                      marginTop: 2,
                    }}
                  >
                    {rule.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
