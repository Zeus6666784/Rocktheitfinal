const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Generates a certificate PDF and writes it to /certificates/<certificateId>.pdf
// Returns the relative file path to store on the Certificate document.
function generateCertificatePdf({ certificateId, studentName, courseTitle, issuedAt }) {
  return new Promise((resolve, reject) => {
    const dir = path.join(__dirname, "..", "certificates");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `${certificateId}.pdf`);
    const doc = new PDFDocument({ layout: "landscape", size: "A4", margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Border
    doc.lineWidth(3).rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke("#1c3d5a");
    doc.lineWidth(1).rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke("#1c3d5a");

    doc.fontSize(36).fillColor("#1c3d5a").text("RockTheIT", 0, 90, { align: "center" });
    doc.fontSize(16).fillColor("#555").text("Certificate of Completion", { align: "center" });

    doc.moveDown(2);
    doc.fontSize(14).fillColor("#333").text("This certifies that", { align: "center" });

    doc.moveDown(0.5);
    doc.fontSize(28).fillColor("#111").text(studentName, { align: "center" });

    doc.moveDown(0.5);
    doc.fontSize(14).fillColor("#333").text("has successfully completed all lectures of the course", { align: "center" });

    doc.moveDown(0.5);
    doc.fontSize(20).fillColor("#1c3d5a").text(courseTitle, { align: "center" });

    doc.moveDown(2);
    doc.fontSize(11).fillColor("#555").text(`Issued on ${new Date(issuedAt).toDateString()}`, { align: "center" });
    doc.fontSize(10).fillColor("#888").text(`Certificate ID: ${certificateId}`, { align: "center" });

    doc.end();

    stream.on("finish", () => resolve(`/certificates/${certificateId}.pdf`));
    stream.on("error", reject);
  });
}

module.exports = generateCertificatePdf;
