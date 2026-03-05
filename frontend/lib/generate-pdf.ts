import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ResumeData } from "@/components/ResumeBuilder";

export const generatePDF = async (values: ResumeData) => {
  const doc = new jsPDF();

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(values.personal.name, 105, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${values.personal.email} | ${values.personal.phone}`, 105, 30, {
    align: "center",
  });

  let currentY = 40;

  // Summary
  if (values.personal.summary) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Professional Summary", 14, currentY);
    currentY += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(values.personal.summary, 180);
    doc.text(summaryLines, 14, currentY);
    currentY += summaryLines.length * 5 + 5;
  }

  // Experience
  if (values.experience?.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Experience", 14, currentY);
    currentY += 5;

    autoTable(doc, {
      startY: currentY,
      head: [["Company", "Position", "Duration", "Description"]],
      body: values.experience.map((exp) => [
        exp.company,
        exp.position,
        exp.duration,
        exp.description,
      ]),
      theme: "striped",
      headStyles: { fillColor: [99, 102, 241] },
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Projects
  if (values.projects?.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Projects", 14, currentY);
    currentY += 5;

    autoTable(doc, {
      startY: currentY,
      head: [["Title", "Tech Stack", "Details"]],
      body: values.projects.map((p) => [
        p.title,
        p.techStack,
        [p.description1, p.description2, p.description3]
          .filter((d) => d)
          .join("\n"),
      ]),
      theme: "striped",
      headStyles: { fillColor: [99, 102, 241] },
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Education
  if (values.education?.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Education", 14, currentY);
    currentY += 5;

    autoTable(doc, {
      startY: currentY,
      head: [["School", "Degree", "Year"]],
      body: values.education.map((edu) => [edu.school, edu.degree, edu.year]),
      theme: "striped",
      headStyles: { fillColor: [99, 102, 241] },
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Skills
  if (values.skills?.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Skills", 14, currentY);
    currentY += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const skillsList = values.skills.map((s) => s.name).join(", ");
    const skillsLines = doc.splitTextToSize(skillsList, 180);
    doc.text(skillsLines, 14, currentY);
  }

  // Save PDF
  doc.save(`${values.personal.name.replace(/\s+/g, "_")}_Resume.pdf`);
};
