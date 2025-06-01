import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useCanvasStore } from '../../store/canvasStore';

interface PDFExportProps {
  stageRef: React.RefObject<any>;
}

export const PDFExport: React.FC<PDFExportProps> = ({ stageRef }) => {
  const { canvasSize } = useCanvasStore();

  const handleExport = async () => {
    if (!stageRef.current) return;

    try {
      // Get the stage container
      const container = stageRef.current.container();
      
      // Create canvas from stage
      const canvas = await html2canvas(container, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add title
      pdf.setFontSize(16);
      pdf.text('Event Floor Plan', 105, 15, { align: 'center' });
      
      // Add floor plan image
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        0,
        25,
        imgWidth,
        imgHeight
      );
      
      // Add QR code
      const qrCodeUrl = window.location.href;
      const qrCanvas = document.createElement('canvas');
      const qrSize = 30; // Size in mm
      
      // Create QR code
      new QRCodeSVG({
        value: qrCodeUrl,
        size: qrSize * 3.78, // Convert mm to pixels (96dpi)
      }).toCanvas(qrCanvas);
      
      // Add QR code to bottom right
      pdf.addImage(
        qrCanvas.toDataURL(),
        'PNG',
        imgWidth - qrSize - 10,
        imgHeight + 35,
        qrSize,
        qrSize
      );
      
      // Add scan instructions
      pdf.setFontSize(10);
      pdf.text(
        'Scan to view interactive version',
        imgWidth - qrSize - 10,
        imgHeight + 35 + qrSize + 5
      );

      // Save the PDF
      pdf.save('floor-plan.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm flex items-center space-x-2"
    >
      <span>Export PDF</span>
    </button>
  );
};