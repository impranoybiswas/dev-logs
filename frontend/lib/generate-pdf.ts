import jsPDF from "jspdf";
import { ResumeData } from "@/components/ResumeBuilder";

export const generatePDF = async (values: ResumeData) => {
  const doc = new jsPDF();
  const templateId = values.templateId || "modern";

  switch (templateId) {
    case "classic":
      renderClassic(doc, values);
      break;
    case "minimalist":
      renderMinimalist(doc, values);
      break;
    case "professional":
      renderProfessional(doc, values);
      break;
    case "modern":
    default:
      renderModern(doc, values);
      break;
  }

  const fileName = values.personal.name
    ? values.personal.name.replace(/\s+/g, "_")
    : "Resume";
  doc.save(`${fileName}_Resume.pdf`);
};

const renderModern = (doc: jsPDF, values: ResumeData) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let currentY = 20;

  const addDivider = (y: number) => {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    return y + 5;
  };

  const addSectionHeader = (text: string, y: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text(text.toUpperCase(), margin, y);
    return addDivider(y + 2);
  };

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(17, 24, 39);
  doc.text(values.personal.name || "RESUME", pageWidth / 2, currentY, {
    align: "center",
  });

  currentY += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  const contact = [values.personal.email, values.personal.phone]
    .filter(Boolean)
    .join("  |  ");
  doc.text(contact, pageWidth / 2, currentY, { align: "center" });

  currentY += 15;

  if (values.personal.summary) {
    currentY = addSectionHeader("Professional Summary", currentY);
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    const lines = doc.splitTextToSize(values.personal.summary, contentWidth);
    doc.text(lines, margin, currentY);
    currentY += lines.length * 5 + 8;
  }

  if (values.experience?.length > 0) {
    currentY = addSectionHeader("Professional Experience", currentY);
    values.experience.forEach((exp) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(17, 24, 39);
      doc.text(exp.company, margin, currentY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.text(exp.duration || "", pageWidth - margin, currentY, {
        align: "right",
      });
      currentY += 5;
      doc.setFont("helvetica", "oblique");
      doc.setTextColor(55, 65, 81);
      doc.text(exp.position, margin, currentY);
      currentY += 6;
      if (exp.description) {
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(exp.description, contentWidth - 5);
        doc.text(lines, margin + 2, currentY);
        currentY += lines.length * 5 + 5;
      }
      currentY += 2;
    });
    currentY += 5;
  }

  if (values.projects?.length > 0) {
    currentY = addSectionHeader("Projects", currentY);
    values.projects.forEach((p) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(17, 24, 39);
      doc.text(p.title, margin, currentY);
      if (p.techStack) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(99, 102, 241);
        doc.text(
          `[ ${p.techStack} ]`,
          margin + doc.getTextWidth(p.title) + 5,
          currentY,
        );
      }
      currentY += 6;
      const details = [p.description1, p.description2, p.description3].filter(
        Boolean,
      );
      details.forEach((detail) => {
        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        doc.text("•", margin + 2, currentY);
        const lines = doc.splitTextToSize(detail, contentWidth - 8);
        doc.text(lines, margin + 7, currentY);
        currentY += lines.length * 5;
      });
      currentY += 4;
    });
    currentY += 5;
  }

  if (values.education?.length > 0) {
    currentY = addSectionHeader("Education", currentY);
    values.education.forEach((edu) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(17, 24, 39);
      doc.text(edu.school, margin, currentY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.text(edu.year || "", pageWidth - margin, currentY, {
        align: "right",
      });
      currentY += 5;
      doc.setTextColor(55, 65, 81);
      doc.text(edu.degree || "", margin, currentY);
      currentY += 8;
    });
    currentY += 5;
  }

  if (values.skills?.length > 0) {
    currentY = addSectionHeader("Technical Skills", currentY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    const list = values.skills.map((s) => s.name).join(", ");
    const lines = doc.splitTextToSize(list, contentWidth);
    doc.text(lines, margin, currentY);
  }
};

const renderClassic = (doc: jsPDF, values: ResumeData) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let currentY = 20;

  // Header - Left Aligned
  doc.setFont("times", "bold");
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  doc.text(values.personal.name || "RESUME", margin, currentY);
  currentY += 8;
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.text(
    `${values.personal.email} | ${values.personal.phone}`,
    margin,
    currentY,
  );
  currentY += 10;
  doc.setLineWidth(1);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;

  const addClassicHeader = (text: string, y: number) => {
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text(text.toUpperCase(), margin, y);
    doc.setLineWidth(0.3);
    doc.line(margin, y + 1, pageWidth - margin, y + 1);
    return y + 6;
  };

  if (values.personal.summary) {
    currentY = addClassicHeader("Summary", currentY);
    doc.setFont("times", "normal");
    const lines = doc.splitTextToSize(values.personal.summary, contentWidth);
    doc.text(lines, margin, currentY);
    currentY += lines.length * 5 + 8;
  }

  if (values.experience?.length > 0) {
    currentY = addClassicHeader("Experience", currentY);
    values.experience.forEach((exp) => {
      doc.setFont("times", "bold");
      doc.text(exp.company, margin, currentY);
      doc.setFont("times", "normal");
      doc.text(exp.duration || "", pageWidth - margin, currentY, {
        align: "right",
      });
      currentY += 5;
      doc.setFont("times", "italic");
      doc.text(exp.position, margin, currentY);
      currentY += 6;
      if (exp.description) {
        doc.setFont("times", "normal");
        const lines = doc.splitTextToSize(exp.description, contentWidth - 5);
        doc.text(lines, margin + 5, currentY);
        currentY += lines.length * 5 + 4;
      }
    });
    currentY += 4;
  }

  if (values.projects?.length > 0) {
    currentY = addClassicHeader("Projects", currentY);
    values.projects.forEach((p) => {
      doc.setFont("times", "bold");
      doc.text(p.title, margin, currentY);
      currentY += 5;
      const details = [p.description1, p.description2, p.description3].filter(
        Boolean,
      );
      details.forEach((detail) => {
        doc.setFont("times", "normal");
        doc.text("-", margin + 2, currentY);
        const lines = doc.splitTextToSize(detail, contentWidth - 10);
        doc.text(lines, margin + 7, currentY);
        currentY += lines.length * 5;
      });
      currentY += 2;
    });
    currentY += 4;
  }

  if (values.education?.length > 0) {
    currentY = addClassicHeader("Education", currentY);
    values.education.forEach((edu) => {
      doc.setFont("times", "bold");
      doc.text(edu.school, margin, currentY);
      doc.setFont("times", "normal");
      doc.text(edu.year || "", pageWidth - margin, currentY, {
        align: "right",
      });
      currentY += 5;
      doc.text(edu.degree || "", margin, currentY);
      currentY += 8;
    });
  }

  if (values.skills?.length > 0) {
    currentY = addClassicHeader("Skills", currentY);
    const list = values.skills.map((s) => s.name).join(", ");
    doc.text(doc.splitTextToSize(list, contentWidth), margin, currentY);
  }
};

const renderMinimalist = (doc: jsPDF, values: ResumeData) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 25;
  const contentWidth = pageWidth - 2 * margin;
  let currentY = 30;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text(values.personal.name || "RESUME", margin, currentY);
  currentY += 10;
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `${values.personal.email}  /  ${values.personal.phone}`,
    margin,
    currentY,
  );
  currentY += 20;

  const addMinHeader = (text: string, y: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(text.toUpperCase(), margin, y);
    return y + 8;
  };

  if (values.personal.summary) {
    currentY = addMinHeader("About", currentY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(values.personal.summary, contentWidth);
    doc.text(lines, margin, currentY);
    currentY += lines.length * 5 + 12;
  }

  if (values.experience?.length > 0) {
    currentY = addMinHeader("Experience", currentY);
    values.experience.forEach((exp) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(exp.company, margin, currentY);
      currentY += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text(`${exp.position}  |  ${exp.duration}`, margin, currentY);
      currentY += 10;
    });
  }

  if (values.projects?.length > 0) {
    currentY = addMinHeader("Projects", currentY);
    values.projects.forEach((p) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(p.title, margin, currentY);
      currentY += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      const details = [p.description1, p.description2, p.description3]
        .filter(Boolean)
        .join(". ");
      const lines = doc.splitTextToSize(details, contentWidth);
      doc.text(lines, margin, currentY);
      currentY += lines.length * 5 + 6;
    });
  }

  if (values.education?.length > 0) {
    currentY = addMinHeader("Education", currentY);
    values.education.forEach((edu) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text(`${edu.school}, ${edu.degree}`, margin, currentY);
      currentY += 5;
      doc.setTextColor(150, 150, 150);
      doc.text(edu.year || "", margin, currentY);
      currentY += 10;
    });
  }

  if (values.skills?.length > 0) {
    currentY = addMinHeader("Skills", currentY);
    const list = values.skills.map((s) => s.name).join(". ");
    doc.text(doc.splitTextToSize(list, contentWidth), margin, currentY);
  }
};

const renderProfessional = (doc: jsPDF, values: ResumeData) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let currentY = 15;

  // Header with colored box
  doc.setFillColor(31, 41, 55);
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text(values.personal.name || "RESUME", margin, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${values.personal.email}   •   ${values.personal.phone}`,
    margin,
    35,
  );

  currentY = 60;

  const addProfHeader = (text: string, y: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(31, 41, 55);
    doc.text(text, margin, y);
    doc.setDrawColor(31, 41, 55);
    doc.setLineWidth(0.8);
    doc.line(margin, y + 2, margin + 20, y + 2);
    return y + 10;
  };

  if (values.personal.summary) {
    currentY = addProfHeader("Executive Summary", currentY);
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    const lines = doc.splitTextToSize(values.personal.summary, contentWidth);
    doc.text(lines, margin, currentY);
    currentY += lines.length * 5 + 10;
  }

  if (values.experience?.length > 0) {
    currentY = addProfHeader("Experience", currentY);
    values.experience.forEach((exp) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(17, 24, 39);
      doc.text(exp.company, margin, currentY);
      doc.text(exp.duration || "", pageWidth - margin, currentY, {
        align: "right",
      });
      currentY += 5;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(55, 65, 81);
      doc.text(exp.position, margin, currentY);
      currentY += 6;
      if (exp.description) {
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(exp.description, contentWidth);
        doc.text(lines, margin, currentY);
        currentY += lines.length * 5 + 6;
      }
    });
  }

  if (values.projects?.length > 0) {
    currentY = addProfHeader("Key Projects", currentY);
    values.projects.forEach((p) => {
      doc.setFont("helvetica", "bold");
      doc.text(p.title, margin, currentY);
      currentY += 5;
      const details = [p.description1, p.description2, p.description3].filter(
        Boolean,
      );
      details.forEach((detail) => {
        doc.setFont("helvetica", "normal");
        doc.text(">", margin, currentY);
        const lines = doc.splitTextToSize(detail, contentWidth - 5);
        doc.text(lines, margin + 5, currentY);
        currentY += lines.length * 5;
      });
      currentY += 4;
    });
  }

  if (values.education?.length > 0) {
    currentY = addProfHeader("Education", currentY);
    values.education.forEach((edu) => {
      doc.setFont("helvetica", "bold");
      doc.text(edu.school, margin, currentY);
      doc.text(edu.year || "", pageWidth - margin, currentY, {
        align: "right",
      });
      currentY += 5;
      doc.setFont("helvetica", "normal");
      doc.text(edu.degree || "", margin, currentY);
      currentY += 8;
    });
  }

  if (values.skills?.length > 0) {
    currentY = addProfHeader("Expertise", currentY);
    const list = values.skills.map((s) => s.name).join(" | ");
    doc.text(doc.splitTextToSize(list, contentWidth), margin, currentY);
  }
};
