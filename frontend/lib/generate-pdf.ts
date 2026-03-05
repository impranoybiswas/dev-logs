import jsPDF from "jspdf";
import { ResumeData } from "@/components/ResumeBuilder";

export const generatePDF = async (values: ResumeData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let currentY = 20;

  // Helper function for horizontal line
  const addDivider = (y: number) => {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    return y + 5;
  };

  // Helper function for sections
  const addSectionHeader = (text: string, y: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55); // Gray-800
    doc.text(text.toUpperCase(), margin, y);
    return addDivider(y + 2);
  };

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(17, 24, 39); // Gray-900
  doc.text(values.personal.name || "RESUME", pageWidth / 2, currentY, {
    align: "center",
  });

  currentY += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99); // Gray-600
  const contactInfo = [values.personal.email, values.personal.phone]
    .filter(Boolean)
    .join("  |  ");
  doc.text(contactInfo, pageWidth / 2, currentY, { align: "center" });

  currentY += 15;

  // Summary
  if (values.personal.summary) {
    currentY = addSectionHeader("Professional Summary", currentY);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81); // Gray-700
    const summaryLines = doc.splitTextToSize(
      values.personal.summary,
      contentWidth,
    );
    doc.text(summaryLines, margin, currentY);
    currentY += summaryLines.length * 5 + 8;
  }

  // Experience
  if (values.experience?.length > 0) {
    currentY = addSectionHeader("Professional Experience", currentY);
    values.experience.forEach((exp) => {
      // Company and Duration
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

      // Position
      doc.setFont("helvetica", "oblique");
      doc.setTextColor(55, 65, 81);
      doc.text(exp.position, margin, currentY);
      currentY += 6;

      // Description
      if (exp.description) {
        doc.setFont("helvetica", "normal");
        const descLines = doc.splitTextToSize(
          exp.description,
          contentWidth - 5,
        );
        doc.text(descLines, margin + 2, currentY);
        currentY += descLines.length * 5 + 5;
      }

      currentY += 2;
    });
    currentY += 5;
  }

  // Projects
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
        doc.setTextColor(99, 102, 241); // Indigo-500
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
        const detailLines = doc.splitTextToSize(detail, contentWidth - 8);
        doc.text(detailLines, margin + 7, currentY);
        currentY += detailLines.length * 5;
      });

      currentY += 4;
    });
    currentY += 5;
  }

  // Education
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

  // Skills
  if (values.skills?.length > 0) {
    currentY = addSectionHeader("Technical Skills", currentY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    const skillsList = values.skills.map((s) => s.name).join(", ");
    const skillsLines = doc.splitTextToSize(skillsList, contentWidth);
    doc.text(skillsLines, margin, currentY);
  }

  // Save PDF
  const fileName = values.personal.name
    ? values.personal.name.replace(/\s+/g, "_")
    : "Resume";
  doc.save(`${fileName}_Resume.pdf`);
};
