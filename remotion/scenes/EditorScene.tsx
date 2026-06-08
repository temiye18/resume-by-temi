import { type FC } from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from '../lib/tokens';

const BULLETS = [
  'Led data-pipeline rewrite that reduced infra cost by 32%.',
  'Mentored 4 engineers; both now leading their own projects.',
  'Shipped customer onboarding flow used by 18,000 accounts.',
];

const useTypewriter = (text: string, startFrame: number, charsPerFrame: number): string => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const charCount = Math.min(text.length, Math.floor(elapsed * charsPerFrame));
  return text.slice(0, charCount);
};

export const EditorScene: FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const captionOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const captionY = interpolate(frame, [0, 18], [12, 0], { extrapolateRight: 'clamp' });

  const paperLift = spring({ frame: frame - 12, fps, config: { damping: 18, stiffness: 90 } });
  const paperY = interpolate(paperLift, [0, 1], [40, 0]);
  const paperOpacity = interpolate(paperLift, [0, 1], [0, 1]);

  const nameVisible = useTypewriter('Akinyemi Olamilekan', 30, 0.4);
  const titleVisible = useTypewriter('Senior Software Engineer', 54, 0.5);
  const contactVisible = useTypewriter('Lagos · temi@example.com · github.com/akinyemitemiye18', 80, 0.6);

  const sectionFade = interpolate(frame, [108, 132], [0, 1], { extrapolateRight: 'clamp' });
  const bulletFade = (i: number) =>
    interpolate(frame, [120 + i * 14, 144 + i * 14], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 40,
        padding: '0 180px',
      }}
    >
      <div
        style={{
          opacity: captionOpacity,
          transform: `translateY(${captionY}px)`,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
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
          Editor
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
          That respects the document.
        </h2>
      </div>

      <div
        style={{
          opacity: paperOpacity,
          transform: `translateY(${paperY}px)`,
          width: 720,
          minHeight: 460,
          padding: 56,
          borderRadius: 6,
          background: COLORS.paper,
          color: COLORS.paperInk,
          fontFamily: FONTS.body,
          boxShadow:
            '0 24px 48px -16px rgba(0,0,0,0.5), 0 8px 16px -4px rgba(0,0,0,0.3)',
        }}
      >
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 36,
            fontWeight: 600,
            letterSpacing: '-0.024em',
            color: COLORS.paperInk,
            minHeight: 44,
          }}
        >
          {nameVisible}
        </div>
        <div
          style={{
            fontSize: 17,
            color: COLORS.paperMuted,
            marginTop: 4,
            minHeight: 24,
          }}
        >
          {titleVisible}
        </div>
        <div
          style={{
            fontSize: 14,
            color: COLORS.paperMuted,
            marginTop: 12,
            minHeight: 20,
          }}
        >
          {contactVisible}
        </div>

        <div
          style={{
            opacity: sectionFade,
            marginTop: 32,
            fontFamily: FONTS.body,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.18em',
            color: COLORS.paperInk,
            textTransform: 'uppercase',
            borderBottom: `1px solid ${COLORS.paperRule}`,
            paddingBottom: 4,
          }}
        >
          Experience
        </div>

        <div
          style={{
            opacity: sectionFade,
            marginTop: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 16,
          }}
        >
          <div style={{ fontSize: 16 }}>
            <span style={{ fontWeight: 700 }}>Senior Software Engineer</span>
            <span style={{ color: COLORS.paperMuted }}> · Acme Corp</span>
          </div>
          <div style={{ fontSize: 13, color: COLORS.paperMuted }}>
            Jan 2023 — Present
          </div>
        </div>

        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '12px 0 0 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {BULLETS.map((bullet, i) => (
            <li
              key={i}
              style={{
                opacity: bulletFade(i),
                display: 'flex',
                gap: 12,
                fontSize: 15,
                lineHeight: 1.45,
                color: COLORS.paperInk,
              }}
            >
              <span aria-hidden>•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </AbsoluteFill>
  );
};
