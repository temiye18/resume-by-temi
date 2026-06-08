import type { ResumeVariant } from '@/types/resume-variant-type';
import type { IResumeThemeOverrides } from '@/interfaces/i-resume-theme-overrides';

// react-pdf's Style is a deeply-constrained union that fights TypeScript;
// the runtime accepts plain objects, so we relax the static type here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Style = any;

export interface IPdfTemplateStyle {
  page: Style;
  name: Style;
  label: Style;
  contact: Style;
  sectionHeading: Style;
  summary: Style;
  entryRow: Style;
  entryHeader: Style;
  entryRole: Style;
  entryCompany: Style;
  entryDates: Style;
  bullet: Style;
  bulletText: Style;
  skillsLine: Style;
  skillsLabel: Style;
  skillsText: Style;
  centerHeader: boolean;
  accentColor: string;
}

const composePage = (theme: IResumeThemeOverrides) => ({
  padding: 40 * (theme.typeScale ?? 1),
  fontSize: 10 * (theme.typeScale ?? 1),
  lineHeight: theme.lineHeight ?? 1.3,
  color: '#111111',
});

export const buildTemplateStyle = (
  variant: ResumeVariant,
  theme: IResumeThemeOverrides,
): IPdfTemplateStyle => {
  const scale = theme.typeScale ?? 1;
  const accent = theme.accentColor ?? '#1f2937';

  switch (variant) {
    case 'modern-minimal': {
      const body = theme.bodyFont || 'Inter';
      const heading = theme.headingFont || body;
      return {
        page: { ...composePage(theme), fontFamily: body },
        name: {
          fontSize: 22 * scale,
          fontWeight: 700,
          letterSpacing: -0.3,
          marginBottom: 4,
          lineHeight: 1.1,
          fontFamily: heading,
        },
        label: {
          fontSize: 10.5 * scale,
          color: '#555',
          marginBottom: 8,
          lineHeight: 1.25,
          fontFamily: body,
        },
        contact: { fontSize: 8.5 * scale, color: '#555', marginBottom: 14, fontFamily: body },
        sectionHeading: {
          fontSize: 8.5 * scale,
          fontWeight: 700,
          letterSpacing: 1.4,
          textTransform: 'uppercase',
          marginTop: 14,
          marginBottom: 6,
          fontFamily: heading,
        },
        summary: { fontSize: 10 * scale, marginBottom: 4, fontFamily: body },
        entryRow: { marginBottom: 8 },
        entryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
        entryRole: { fontSize: 10.5 * scale, fontWeight: 700, fontFamily: heading },
        entryCompany: { fontSize: 10 * scale, color: '#444', fontFamily: body },
        entryDates: { fontSize: 9 * scale, color: '#666', fontFamily: body },
        bullet: { flexDirection: 'row', marginTop: 2, paddingLeft: 12 },
        bulletText: { flex: 1, fontSize: 10 * scale, fontFamily: body },
        skillsLine: { flexDirection: 'row', marginBottom: 2 },
        skillsLabel: { fontSize: 9.5 * scale, fontWeight: 700, fontFamily: heading, marginRight: 4 },
        skillsText: { flex: 1, fontSize: 9.5 * scale, fontFamily: body },
        centerHeader: false,
        accentColor: accent,
      };
    }
    case 'classic-serif': {
      const body = theme.bodyFont || 'EB Garamond';
      const heading = theme.headingFont || 'Source Serif 4';
      return {
        page: { ...composePage(theme), fontFamily: body },
        name: {
          fontSize: 24 * scale,
          fontWeight: 700,
          letterSpacing: -0.2,
          textAlign: 'center',
          marginBottom: 4,
          lineHeight: 1.1,
          fontFamily: heading,
        },
        label: {
          fontSize: 10.5 * scale,
          fontStyle: 'italic',
          color: '#444',
          textAlign: 'center',
          marginBottom: 6,
          lineHeight: 1.25,
          fontFamily: heading,
        },
        contact: {
          fontSize: 9 * scale,
          color: '#555',
          textAlign: 'center',
          marginBottom: 14,
          fontFamily: body,
        },
        sectionHeading: {
          fontSize: 10 * scale,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: 'uppercase',
          paddingBottom: 2,
          marginTop: 14,
          marginBottom: 6,
          borderBottomWidth: 0.5,
          borderBottomColor: '#888',
          borderBottomStyle: 'solid',
          fontFamily: heading,
        },
        summary: { fontSize: 10 * scale, marginBottom: 4, fontFamily: body },
        entryRow: { marginBottom: 8 },
        entryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
        entryRole: { fontSize: 11 * scale, fontWeight: 700, fontFamily: heading },
        entryCompany: { fontSize: 10 * scale, fontStyle: 'italic', color: '#444', fontFamily: body },
        entryDates: { fontSize: 9 * scale, color: '#666', fontFamily: body },
        bullet: { flexDirection: 'row', marginTop: 2, paddingLeft: 12 },
        bulletText: { flex: 1, fontSize: 10 * scale, fontFamily: body },
        skillsLine: { flexDirection: 'row', marginBottom: 2 },
        skillsLabel: { fontSize: 10 * scale, fontStyle: 'italic', fontFamily: body, marginRight: 4 },
        skillsText: { flex: 1, fontSize: 10 * scale, fontFamily: body },
        centerHeader: true,
        accentColor: accent,
      };
    }
    case 'tech-sans': {
      const body = theme.bodyFont || 'Inter';
      const heading = theme.headingFont || 'Inter';
      const mono = 'JetBrains Mono';
      return {
        page: { ...composePage(theme), fontFamily: body },
        name: {
          fontSize: 22 * scale,
          fontWeight: 700,
          letterSpacing: -0.3,
          marginBottom: 4,
          lineHeight: 1.1,
          fontFamily: heading,
        },
        label: {
          fontSize: 10.5 * scale,
          color: accent,
          marginBottom: 8,
          lineHeight: 1.25,
          fontFamily: body,
        },
        contact: {
          fontSize: 8.5 * scale,
          color: '#555',
          marginBottom: 14,
          fontFamily: mono,
        },
        sectionHeading: {
          fontSize: 9.5 * scale,
          fontWeight: 700,
          marginTop: 14,
          marginBottom: 6,
          paddingBottom: 2,
          borderBottomWidth: 0.5,
          borderBottomColor: accent,
          borderBottomStyle: 'solid',
          fontFamily: heading,
        },
        summary: { fontSize: 10 * scale, marginBottom: 4, fontFamily: body },
        entryRow: { marginBottom: 8 },
        entryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
        entryRole: { fontSize: 10.5 * scale, fontWeight: 700, fontFamily: heading },
        entryCompany: { fontSize: 10 * scale, color: '#444', fontFamily: body },
        entryDates: { fontSize: 9 * scale, color: '#666', fontFamily: mono },
        bullet: { flexDirection: 'row', marginTop: 2, paddingLeft: 12 },
        bulletText: { flex: 1, fontSize: 10 * scale, fontFamily: body },
        skillsLine: { flexDirection: 'row', marginBottom: 2 },
        skillsLabel: { fontSize: 9.5 * scale, fontWeight: 700, fontFamily: heading, marginRight: 4 },
        skillsText: { flex: 1, fontSize: 9.5 * scale, fontFamily: mono },
        centerHeader: false,
        accentColor: accent,
      };
    }
    case 'executive': {
      const body = theme.bodyFont || 'Source Serif 4';
      const heading = theme.headingFont || 'Inter';
      return {
        page: { ...composePage(theme), fontFamily: body },
        name: {
          fontSize: 28 * scale,
          fontWeight: 700,
          letterSpacing: -0.4,
          marginBottom: 5,
          lineHeight: 1.05,
          fontFamily: body,
        },
        label: {
          fontSize: 11 * scale,
          color: '#444',
          marginBottom: 8,
          lineHeight: 1.25,
          fontFamily: body,
        },
        contact: { fontSize: 9 * scale, color: '#555', marginBottom: 14, fontFamily: heading },
        sectionHeading: {
          fontSize: 10 * scale,
          fontWeight: 700,
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          marginTop: 12,
          marginBottom: 5,
          paddingBottom: 2,
          borderBottomWidth: 0.8,
          borderBottomColor: '#111',
          borderBottomStyle: 'solid',
          fontFamily: heading,
        },
        summary: { fontSize: 10.5 * scale, marginBottom: 4, fontFamily: body },
        entryRow: { marginBottom: 7 },
        entryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
        entryRole: { fontSize: 11 * scale, fontWeight: 700, fontFamily: body },
        entryCompany: { fontSize: 10 * scale, color: '#444', fontFamily: body },
        entryDates: { fontSize: 9 * scale, color: '#666', fontFamily: heading },
        bullet: { flexDirection: 'row', marginTop: 2, paddingLeft: 12 },
        bulletText: { flex: 1, fontSize: 10 * scale, fontFamily: body },
        skillsLine: { flexDirection: 'row', marginBottom: 2 },
        skillsLabel: { fontSize: 9.5 * scale, fontWeight: 700, fontFamily: heading, marginRight: 4 },
        skillsText: { flex: 1, fontSize: 10 * scale, fontFamily: body },
        centerHeader: false,
        accentColor: accent,
      };
    }
    case 'compact': {
      const body = theme.bodyFont || 'Lato';
      const heading = theme.headingFont || 'Lato';
      return {
        page: { ...composePage(theme), padding: 36 * scale, fontFamily: body, fontSize: 9.5 * scale },
        name: {
          fontSize: 20 * scale,
          fontWeight: 700,
          letterSpacing: -0.3,
          marginBottom: 3,
          lineHeight: 1.1,
          fontFamily: heading,
        },
        label: {
          fontSize: 9.5 * scale,
          color: '#444',
          marginBottom: 6,
          lineHeight: 1.25,
          fontFamily: body,
        },
        contact: { fontSize: 8 * scale, color: '#555', marginBottom: 10, fontFamily: body },
        sectionHeading: {
          fontSize: 8.5 * scale,
          fontWeight: 700,
          letterSpacing: 1.4,
          textTransform: 'uppercase',
          marginTop: 9,
          marginBottom: 4,
          fontFamily: heading,
        },
        summary: { fontSize: 9.5 * scale, marginBottom: 3, fontFamily: body },
        entryRow: { marginBottom: 5 },
        entryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
        entryRole: { fontSize: 10 * scale, fontWeight: 700, fontFamily: heading },
        entryCompany: { fontSize: 9 * scale, color: '#444', fontFamily: body },
        entryDates: { fontSize: 8 * scale, color: '#666', fontFamily: body },
        bullet: { flexDirection: 'row', marginTop: 1, paddingLeft: 10 },
        bulletText: { flex: 1, fontSize: 9.5 * scale, fontFamily: body },
        skillsLine: { flexDirection: 'row', marginBottom: 1.5 },
        skillsLabel: { fontSize: 9 * scale, fontWeight: 700, fontFamily: heading, marginRight: 4 },
        skillsText: { flex: 1, fontSize: 9.5 * scale, fontFamily: body },
        centerHeader: false,
        accentColor: accent,
      };
    }
    case 'editorial': {
      const body = theme.bodyFont || 'Lora';
      const heading = theme.headingFont || 'Inter';
      return {
        page: { ...composePage(theme), fontFamily: body },
        name: {
          fontSize: 26 * scale,
          fontWeight: 700,
          letterSpacing: -0.4,
          marginBottom: 6,
          lineHeight: 1.05,
          fontFamily: body,
        },
        label: {
          fontSize: 11 * scale,
          fontStyle: 'italic',
          color: '#444',
          marginBottom: 10,
          lineHeight: 1.3,
          fontFamily: body,
        },
        contact: { fontSize: 9 * scale, color: '#555', marginBottom: 14, fontFamily: heading },
        sectionHeading: {
          fontSize: 12 * scale,
          fontWeight: 700,
          marginTop: 14,
          marginBottom: 6,
          paddingLeft: 8,
          borderLeftWidth: 1.2,
          borderLeftColor: accent,
          borderLeftStyle: 'solid',
          fontFamily: body,
        },
        summary: { fontSize: 10.5 * scale, marginBottom: 4, fontFamily: body },
        entryRow: { marginBottom: 8 },
        entryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
        entryRole: { fontSize: 11 * scale, fontWeight: 700, fontFamily: body },
        entryCompany: { fontSize: 10 * scale, fontStyle: 'italic', color: '#444', fontFamily: body },
        entryDates: { fontSize: 9 * scale, color: '#666', fontFamily: heading },
        bullet: { flexDirection: 'row', marginTop: 2, paddingLeft: 12 },
        bulletText: { flex: 1, fontSize: 10.5 * scale, fontFamily: body },
        skillsLine: { flexDirection: 'row', marginBottom: 2 },
        skillsLabel: { fontSize: 10 * scale, fontWeight: 700, fontFamily: body, marginRight: 4 },
        skillsText: { flex: 1, fontSize: 10 * scale, fontFamily: body },
        centerHeader: false,
        accentColor: accent,
      };
    }
  }
};
