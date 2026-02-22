import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportToPdfOptions {
  filename: string;
  title?: string;
  subtitle?: string;
}

/**
 * Exports a DOM element to PDF with proper page handling
 * @param elementId - The ID of the element to export
 * @param options - PDF export options
 */
export async function exportToPdf(
  elementId: string,
  options: ExportToPdfOptions
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  try {
    // Create canvas from element with higher scale for better quality
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // PDF dimensions (A4 size in mm)
    const pdfWidth = 210;
    const pdfHeight = 297;
    const marginX = 10;
    const marginTop = 10;
    const marginBottom = 15; // Extra space for footer
    const contentWidth = pdfWidth - 2 * marginX;

    // Calculate header height
    let headerHeight = marginTop;
    if (options.title) {
      headerHeight += 15;
    }
    if (options.subtitle) {
      headerHeight += 10;
    }

    // Available height for content on first page and subsequent pages
    const firstPageContentHeight = pdfHeight - headerHeight - marginBottom;
    const otherPageContentHeight = pdfHeight - marginTop - marginBottom;

    // Scale image to fit content width while maintaining aspect ratio
    const scale = contentWidth / imgWidth;
    const scaledImgWidth = contentWidth;
    const scaledImgHeight = imgHeight * scale;

    // Determine if we need multiple pages
    const needsMultiplePages = scaledImgHeight > firstPageContentHeight;

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Function to add header to a page
    const addHeader = (pageNum: number) => {
      let yPos = marginTop;

      if (pageNum === 1) {
        if (options.title) {
          pdf.setFontSize(18);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(0, 0, 0);
          pdf.text(options.title, marginX, yPos + 10);
          yPos += 15;
        }

        if (options.subtitle) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(100, 100, 100);
          pdf.text(options.subtitle, marginX, yPos);
          yPos += 10;
          pdf.setTextColor(0, 0, 0);
        }

        // Add date
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        const date = new Date().toLocaleDateString('es-CL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        pdf.text(`Generado: ${date}`, pdfWidth - marginX - 50, marginTop + 5);
        pdf.setTextColor(0, 0, 0);
      }

      return yPos;
    };

    // Function to add footer to a page
    const addFooter = (pageNum: number, totalPages: number) => {
      pdf.setPage(pageNum);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `ContaCoop - Página ${pageNum} de ${totalPages}`,
        pdfWidth / 2,
        pdfHeight - 5,
        { align: 'center' }
      );
    };

    if (!needsMultiplePages) {
      // Single page - simple case
      const yStart = addHeader(1);
      pdf.addImage(
        imgData,
        'PNG',
        marginX,
        yStart,
        scaledImgWidth,
        scaledImgHeight
      );
      addFooter(1, 1);
    } else {
      // Multiple pages - need to slice the image
      const pixelsPerMm = imgWidth / contentWidth;

      // First page
      const firstPageYStart = addHeader(1);
      const firstPagePixelHeight = firstPageContentHeight * pixelsPerMm;

      // Create a temporary canvas to slice the image for first page
      const firstPageCanvas = document.createElement('canvas');
      firstPageCanvas.width = imgWidth;
      firstPageCanvas.height = Math.min(firstPagePixelHeight, imgHeight);
      const firstCtx = firstPageCanvas.getContext('2d');
      if (firstCtx) {
        firstCtx.drawImage(
          canvas,
          0,
          0,
          imgWidth,
          firstPageCanvas.height,
          0,
          0,
          imgWidth,
          firstPageCanvas.height
        );
        const firstPageImg = firstPageCanvas.toDataURL('image/png');
        const firstPageScaledHeight = firstPageCanvas.height * scale;
        pdf.addImage(
          firstPageImg,
          'PNG',
          marginX,
          firstPageYStart,
          scaledImgWidth,
          firstPageScaledHeight
        );
      }

      // Calculate remaining content and pages needed
      let remainingPixelHeight = imgHeight - firstPagePixelHeight;
      let currentPixelY = firstPagePixelHeight;
      let pageNum = 2;

      while (remainingPixelHeight > 0) {
        pdf.addPage();

        const pagePixelHeight = Math.min(
          otherPageContentHeight * pixelsPerMm,
          remainingPixelHeight
        );

        // Create canvas slice for this page
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidth;
        pageCanvas.height = pagePixelHeight;
        const pageCtx = pageCanvas.getContext('2d');

        if (pageCtx) {
          pageCtx.drawImage(
            canvas,
            0,
            currentPixelY,
            imgWidth,
            pagePixelHeight,
            0,
            0,
            imgWidth,
            pagePixelHeight
          );
          const pageImg = pageCanvas.toDataURL('image/png');
          const pageScaledHeight = pagePixelHeight * scale;
          pdf.addImage(
            pageImg,
            'PNG',
            marginX,
            marginTop,
            scaledImgWidth,
            pageScaledHeight
          );
        }

        currentPixelY += pagePixelHeight;
        remainingPixelHeight -= pagePixelHeight;
        pageNum++;
      }

      // Add footers to all pages
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        addFooter(i, totalPages);
      }
    }

    // Save PDF
    pdf.save(`${options.filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Simple PDF export that captures the current view with proper A4 formatting
 */
export async function exportViewToPdf(
  containerSelector: string,
  filename: string
): Promise<void> {
  const element = document.querySelector(containerSelector) as HTMLElement;
  if (!element) {
    throw new Error(`Element not found: ${containerSelector}`);
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const imgData = canvas.toDataURL('image/png');

  // Use A4 format with proper margins
  const pdfWidth = 210;
  const pdfHeight = 297;
  const margin = 10;
  const contentWidth = pdfWidth - 2 * margin;
  const contentHeight = pdfHeight - 2 * margin;

  // Determine orientation based on aspect ratio
  const aspectRatio = canvas.width / canvas.height;
  const isLandscape = aspectRatio > 1.2;

  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const effectivePdfWidth = isLandscape ? pdfHeight : pdfWidth;
  const effectivePdfHeight = isLandscape ? pdfWidth : pdfHeight;
  const effectiveContentWidth = effectivePdfWidth - 2 * margin;
  const effectiveContentHeight = effectivePdfHeight - 2 * margin;

  // Scale to fit width while maintaining aspect ratio
  const scale = effectiveContentWidth / canvas.width;
  const scaledWidth = effectiveContentWidth;
  const scaledHeight = canvas.height * scale;

  if (scaledHeight <= effectiveContentHeight) {
    // Fits on one page
    pdf.addImage(imgData, 'PNG', margin, margin, scaledWidth, scaledHeight);
  } else {
    // Multiple pages needed
    const pixelsPerMm = canvas.width / effectiveContentWidth;
    let remainingPixelHeight = canvas.height;
    let currentPixelY = 0;
    let isFirstPage = true;

    while (remainingPixelHeight > 0) {
      if (!isFirstPage) {
        pdf.addPage();
      }

      const pagePixelHeight = Math.min(
        effectiveContentHeight * pixelsPerMm,
        remainingPixelHeight
      );

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = pagePixelHeight;
      const pageCtx = pageCanvas.getContext('2d');

      if (pageCtx) {
        pageCtx.drawImage(
          canvas,
          0,
          currentPixelY,
          canvas.width,
          pagePixelHeight,
          0,
          0,
          canvas.width,
          pagePixelHeight
        );
        const pageImg = pageCanvas.toDataURL('image/png');
        const pageScaledHeight = pagePixelHeight * scale;
        pdf.addImage(pageImg, 'PNG', margin, margin, scaledWidth, pageScaledHeight);
      }

      currentPixelY += pagePixelHeight;
      remainingPixelHeight -= pagePixelHeight;
      isFirstPage = false;
    }
  }

  pdf.save(`${filename}.pdf`);
}
