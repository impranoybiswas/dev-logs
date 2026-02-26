import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePDF = async (values: any) => {
  const doc = new jsPDF();

  const infoStartY = 45;
  const infoStartX = 14;
  const infoStartX2 = 42;

  // Centered Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Resume", 105, infoStartY, { align: "center" });
  doc.text(values.personal.name, 105, infoStartY + 10, { align: "center" });

  autoTable(doc, {
    startY: infoStartY + 55,
    head: [["name", "price"]],
    body: [
      ["phone", 400],
      ["address", 500],
    ],
  });

  // Save PDF
  doc.save(`resume.pdf`);
};
