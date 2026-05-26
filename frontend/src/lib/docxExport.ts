// src/lib/docxExport.ts
// Generates a proper .docx (Office Open XML) file using JSZip.
// No server needed — runs entirely in the browser.

import JSZip from 'jszip';

export interface GeneratedResume {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  location: string;
  summary: string;
  skills: { category: string; items: string[] }[];
  experience: {
    company: string;
    role: string;
    duration: string;
    location: string;
    bullets: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    year: string;
    cgpa?: string;
  }[];
  projects: {
    name: string;
    tech: string;
    description: string;
    bullets: string[];
    link?: string;
  }[];
  achievements: string[];
  certifications: string[];
  companyInsight: string;
}

// ----- XML helpers -----
const esc = (s: string) =>
  String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function run(text: string, bold = false, size = 20) {
  return `<w:r><w:rPr>${bold ? '<w:b/>' : ''}<w:sz w:val="${size}"/><w:szCs w:val="${size}"/><w:color w:val="1e293b"/></w:rPr><w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;
}

function paragraph(content: string, spacing = 80, indent = 0): string {
  return `<w:p><w:pPr><w:spacing w:after="${spacing}"/>${indent ? `<w:ind w:left="${indent}"/>` : ''}</w:pPr>${content}</w:p>`;
}

function heading(text: string): string {
  const rule = `<w:p><w:pPr><w:spacing w:after="40"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="0056b3"/></w:pBdr></w:pPr>${run(text.toUpperCase(), true, 22)}</w:p>`;
  return rule;
}

function bullet(text: string): string {
  return paragraph(run(`• ${text}`, false, 19), 40, 360);
}

function contactBar(resume: GeneratedResume): string {
  const parts: string[] = [];
  if (resume.email) parts.push(resume.email);
  if (resume.phone) parts.push(resume.phone);
  if (resume.location) parts.push(resume.location);
  if (resume.linkedin) parts.push(resume.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, ''));
  if (resume.github) parts.push(resume.github.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, ''));
  return paragraph(run(parts.join('  |  '), false, 18), 40);
}

function buildDocumentXml(resume: GeneratedResume): string {
  const paragraphs: string[] = [];

  // ---- Name ----
  paragraphs.push(paragraph(run(resume.name || 'Your Name', true, 36), 20));
  paragraphs.push(contactBar(resume));

  // ---- Summary ----
  if (resume.summary) {
    paragraphs.push(heading('Professional Summary'));
    paragraphs.push(paragraph(run(resume.summary, false, 19), 80));
  }

  // ---- Skills ----
  if (resume.skills?.length) {
    paragraphs.push(heading('Technical Skills'));
    for (const group of resume.skills) {
      paragraphs.push(
        paragraph(
          run(`${group.category}: `, true, 19) + run(group.items.join(', '), false, 19),
          40
        )
      );
    }
  }

  // ---- Experience ----
  if (resume.experience?.length) {
    paragraphs.push(heading('Work Experience'));
    for (const exp of resume.experience) {
      paragraphs.push(
        paragraph(
          run(exp.role, true, 20) + run(`  —  ${exp.company}`, false, 20) + run(`  |  ${exp.duration}${exp.location ? `  ·  ${exp.location}` : ''}`, false, 18),
          20
        )
      );
      for (const b of exp.bullets) paragraphs.push(bullet(b));
      paragraphs.push(paragraph('', 60));
    }
  }

  // ---- Projects ----
  if (resume.projects?.length) {
    paragraphs.push(heading('Projects'));
    for (const proj of resume.projects) {
      paragraphs.push(
        paragraph(
          run(proj.name, true, 20) + run(`  |  ${proj.tech}`, false, 18),
          20
        )
      );
      if (proj.description) paragraphs.push(paragraph(run(proj.description, false, 18), 20));
      for (const b of proj.bullets) paragraphs.push(bullet(b));
      paragraphs.push(paragraph('', 60));
    }
  }

  // ---- Education ----
  if (resume.education?.length) {
    paragraphs.push(heading('Education'));
    for (const edu of resume.education) {
      paragraphs.push(
        paragraph(
          run(edu.institution, true, 20) + run(`  —  ${edu.degree}  |  ${edu.year}${edu.cgpa ? `  ·  CGPA: ${edu.cgpa}` : ''}`, false, 19),
          40
        )
      );
    }
  }

  // ---- Achievements ----
  if (resume.achievements?.length) {
    paragraphs.push(heading('Achievements'));
    for (const a of resume.achievements) paragraphs.push(bullet(a));
  }

  // ---- Certifications ----
  if (resume.certifications?.length) {
    paragraphs.push(heading('Certifications'));
    for (const c of resume.certifications) paragraphs.push(bullet(c));
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document
  xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="720" w:right="900" w:bottom="720" w:left="900" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
    ${paragraphs.join('\n    ')}
  </w:body>
</w:document>`;
}

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

const DOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const WORD_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        <w:sz w:val="20"/>
        <w:szCs w:val="20"/>
        <w:color w:val="1e293b"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
</w:styles>`;

export async function exportResumeAsDocx(resume: GeneratedResume, filename = 'resume.docx'): Promise<void> {
  const zip = new JSZip();

  zip.file('[Content_Types].xml', CONTENT_TYPES);
  zip.folder('_rels')!.file('.rels', DOT_RELS);
  const wordFolder = zip.folder('word')!;
  wordFolder.file('document.xml', buildDocumentXml(resume));
  wordFolder.file('styles.xml', STYLES);
  wordFolder.folder('_rels')!.file('document.xml.rels', WORD_RELS);

  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
