import { type FC, Fragment } from 'react';
import { Document, Page, Text, View, Link } from '@react-pdf/renderer';
import type { Resume } from '@/schema/resume';
import type { ResumeVariant } from '@/types/resume-variant-type';
import type { IResumeThemeOverrides } from '@/interfaces/i-resume-theme-overrides';
import { buildTemplateStyle } from './templateStyles';
import { formatPdfDateRange } from './format-date-range';
import { displayProfileText } from '@/helpers';
import MarkdownRuns from './MarkdownRuns';
import MarkdownBlocksPdf from './MarkdownBlocksPdf';

interface IResumeDocumentProps {
  resume: Resume;
  templateId: ResumeVariant;
  theme: IResumeThemeOverrides;
  title?: string;
}

const composeLocation = (loc?: { city?: string; region?: string }): string => {
  if (!loc) return '';
  return [loc.city, loc.region].filter(Boolean).join(', ');
};

interface IContactPart {
  key: string;
  text: string;
  href?: string;
}

const buildContactParts = (resume: Resume): IContactPart[] => {
  const parts: IContactPart[] = [];
  const loc = composeLocation(resume.basics.location);
  if (loc) parts.push({ key: 'loc', text: loc });
  if (resume.basics.email) {
    parts.push({ key: 'email', text: resume.basics.email, href: `mailto:${resume.basics.email}` });
  }
  if (resume.basics.phone) {
    const telDigits = resume.basics.phone.replace(/[^+\d]/g, '');
    parts.push({ key: 'phone', text: resume.basics.phone, href: `tel:${telDigits}` });
  }
  resume.basics.profiles.forEach((p, i) => {
    parts.push({ key: `p-${i}`, text: displayProfileText(p), href: p.url });
  });
  return parts;
};

const ResumeDocument: FC<IResumeDocumentProps> = ({ resume, templateId, theme, title }) => {
  const style = buildTemplateStyle(templateId, theme);
  const paperSize = resume['x-builder'].paperSize;
  const visibleSections = new Set(resume['x-builder'].visibleSections);
  const hasSummary = !!resume.basics.summary;
  const hasWork = resume.work.length > 0;
  const hasEducation = resume.education.length > 0;
  const hasSkills = resume.skills.length > 0;
  const hasProjects = resume.projects.length > 0;
  const hasCertificates = resume.certificates.length > 0;
  const hasLanguages = resume.languages.length > 0;
  const hasAwards = resume.awards.length > 0;
  const hasPublications = resume.publications.length > 0;
  const hasVolunteer = resume.volunteer.length > 0;

  return (
    <Document
      title={title ?? `${resume.basics.name} Resume`}
      author={resume.basics.name}
    >
      <Page size={paperSize === 'A4' ? 'A4' : 'LETTER'} style={style.page}>
        <View>
          <Text style={style.name}>{resume.basics.name}</Text>
          {resume.basics.label ? <Text style={style.label}>{resume.basics.label}</Text> : null}
          <Text style={style.contact}>
            {buildContactParts(resume).map((part, i) => (
              <Fragment key={part.key}>
                {i > 0 ? <Text>{' · '}</Text> : null}
                {part.href ? (
                  <Link src={part.href} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {part.text}
                  </Link>
                ) : (
                  <Text>{part.text}</Text>
                )}
              </Fragment>
            ))}
          </Text>
        </View>

        {hasSummary && visibleSections.has('summary') ? (
          <View wrap={false}>
            <Text style={style.sectionHeading}>Summary</Text>
            <MarkdownBlocksPdf
              source={resume.basics.summary ?? ''}
              baseStyle={style.summary}
              accentColor={style.accentColor}
            />
          </View>
        ) : null}

        {hasWork && visibleSections.has('work') ? (
          <View>
            <Text style={style.sectionHeading}>Experience</Text>
            {resume.work.map((entry) => (
              <View key={entry.id} style={style.entryRow} wrap={false}>
                <View style={style.entryHeader}>
                  <Text>
                    <Text style={style.entryRole}>{entry.position}</Text>
                    <Text style={style.entryCompany}>{' · '}{entry.name}</Text>
                  </Text>
                  <Text style={style.entryDates}>
                    {formatPdfDateRange(entry.startDate, entry.endDate)}
                  </Text>
                </View>
                {entry.highlights.map((h, i) => (
                  <View key={i} style={style.bullet}>
                    <Text>{'• '}</Text>
                    <Text style={style.bulletText}>
                      <MarkdownRuns source={h} accentColor={style.accentColor} />
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {hasEducation && visibleSections.has('education') ? (
          <View>
            <Text style={style.sectionHeading}>Education</Text>
            {resume.education.map((entry) => (
              <View key={entry.id} style={style.entryRow} wrap={false}>
                <View style={style.entryHeader}>
                  <Text>
                    <Text style={style.entryRole}>{entry.institution}</Text>
                    <Text style={style.entryCompany}>
                      {' · '}
                      {[entry.studyType, entry.area].filter(Boolean).join(' ')}
                    </Text>
                  </Text>
                  <Text style={style.entryDates}>{entry.endDate ?? ''}</Text>
                </View>
                {entry.highlights.map((h, i) => (
                  <View key={i} style={style.bullet}>
                    <Text>{'• '}</Text>
                    <Text style={style.bulletText}>
                      <MarkdownRuns source={h} accentColor={style.accentColor} />
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {hasSkills && visibleSections.has('skills') ? (
          <View>
            <Text style={style.sectionHeading}>Skills</Text>
            {resume.skills.map((group) => (
              <View key={group.id} style={style.skillsLine}>
                <Text style={style.skillsLabel}>{group.name}: </Text>
                <Text style={style.skillsText}>{group.keywords.join(', ')}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {hasProjects && visibleSections.has('projects') ? (
          <View>
            <Text style={style.sectionHeading}>Projects</Text>
            {resume.projects.map((entry) => (
              <View key={entry.id} style={style.entryRow} wrap={false}>
                <View style={style.entryHeader}>
                  <Text style={style.entryRole}>{entry.name}</Text>
                  <Text style={style.entryDates}>
                    {formatPdfDateRange(entry.startDate, entry.endDate)}
                  </Text>
                </View>
                {entry.description ? <Text style={style.summary}>{entry.description}</Text> : null}
                {entry.highlights.map((h, i) => (
                  <View key={i} style={style.bullet}>
                    <Text>{'• '}</Text>
                    <Text style={style.bulletText}>
                      <MarkdownRuns source={h} accentColor={style.accentColor} />
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {hasCertificates && visibleSections.has('certificates') ? (
          <View>
            <Text style={style.sectionHeading}>Certifications</Text>
            {resume.certificates.map((entry) => (
              <View key={entry.id} style={style.skillsLine}>
                <Text style={style.skillsLabel}>{entry.name}</Text>
                <Text style={style.skillsText}>
                  {[entry.issuer, entry.date].filter(Boolean).join(' · ')}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {hasLanguages && visibleSections.has('languages') ? (
          <View>
            <Text style={style.sectionHeading}>Languages</Text>
            {resume.languages.map((entry) => (
              <View key={entry.id} style={style.skillsLine}>
                <Text style={style.skillsLabel}>{entry.language}</Text>
                {entry.fluency ? (
                  <Text style={style.skillsText}>{entry.fluency}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {hasAwards && visibleSections.has('awards') ? (
          <View>
            <Text style={style.sectionHeading}>Awards</Text>
            {resume.awards.map((entry) => (
              <View key={entry.id} style={style.entryRow} wrap={false}>
                <View style={style.entryHeader}>
                  <Text style={style.entryRole}>{entry.title}</Text>
                  <Text style={style.entryDates}>{entry.date ?? ''}</Text>
                </View>
                {entry.summary ? <Text style={style.summary}>{entry.summary}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {hasPublications && visibleSections.has('publications') ? (
          <View>
            <Text style={style.sectionHeading}>Publications</Text>
            {resume.publications.map((entry) => (
              <View key={entry.id} style={style.entryRow} wrap={false}>
                <View style={style.entryHeader}>
                  <Text style={style.entryRole}>{entry.name}</Text>
                  <Text style={style.entryDates}>{entry.releaseDate ?? ''}</Text>
                </View>
                {entry.publisher ? <Text style={style.entryCompany}>{entry.publisher}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {hasVolunteer && visibleSections.has('volunteer') ? (
          <View>
            <Text style={style.sectionHeading}>Volunteer Experience</Text>
            {resume.volunteer.map((entry) => (
              <View key={entry.id} style={style.entryRow} wrap={false}>
                <View style={style.entryHeader}>
                  <Text>
                    <Text style={style.entryRole}>{entry.position}</Text>
                    <Text style={style.entryCompany}>{' · '}{entry.organization}</Text>
                  </Text>
                  <Text style={style.entryDates}>
                    {formatPdfDateRange(entry.startDate, entry.endDate)}
                  </Text>
                </View>
                {entry.highlights.map((h, i) => (
                  <View key={i} style={style.bullet}>
                    <Text>{'• '}</Text>
                    <Text style={style.bulletText}>
                      <MarkdownRuns source={h} accentColor={style.accentColor} />
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
};

export default ResumeDocument;
