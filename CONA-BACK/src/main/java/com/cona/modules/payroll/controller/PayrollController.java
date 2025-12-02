package com.cona.modules.payroll.controller;

import com.cona.kernel.response.ApiResponse;
import com.cona.kernel.response.FileDownloadResponse;
import com.cona.modules.payroll.dto.PayrollDetailDto;
import com.cona.modules.payroll.entity.Payroll;
import com.cona.modules.payroll.service.PayrollService;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/payroll")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Validated
public class PayrollController {

    private final PayrollService payrollService;

    private LocalDate[] calculateLastCompleteBiweeklyPeriod() {
        LocalDate today = LocalDate.now();
        LocalDate currentMonday = today.with(java.time.temporal.TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate referenceDate = LocalDate.of(2024, 1, 1); // Lunes de referencia
        long weeksSinceReference = ChronoUnit.WEEKS.between(referenceDate, currentMonday);
        long biweeklyPeriods = weeksSinceReference / 2;
        if (biweeklyPeriods <= 0) {
            return new LocalDate[]{referenceDate, referenceDate.plusDays(13)};
        }
        LocalDate lastPeriodStart = referenceDate.plusWeeks((biweeklyPeriods - 1) * 2);
        LocalDate lastPeriodEnd = lastPeriodStart.plusDays(13); // 14 días (incluye domingo)
        return new LocalDate[]{lastPeriodStart, lastPeriodEnd};
    }

    @PostMapping("/calculate/{employeeId}")
    public ApiResponse<Payroll> calculatePayroll(
            @PathVariable @Positive(message = "El ID debe ser positivo") Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodEnd) {
        return ApiResponse.success("Nómina calculada exitosamente", payrollService.calculatePayroll(employeeId, periodStart, periodEnd));
    }

    @GetMapping("/detail/{employeeId}")
    public ApiResponse<PayrollDetailDto> getPayrollDetail(
            @PathVariable @Positive(message = "El ID debe ser positivo") Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodEnd) {
        return ApiResponse.success("Detalle de nómina obtenido", payrollService.getPayrollDetail(employeeId, periodStart, periodEnd));
    }

    @GetMapping("/employee/{employeeId}")
    public ApiResponse<List<Payroll>> getEmployeePayrolls(@PathVariable @Positive(message = "El ID debe ser positivo") Long employeeId) {
        return ApiResponse.success("Nóminas del empleado obtenidas", payrollService.getEmployeePayrolls(employeeId));
    }

    @GetMapping("/employee/{employeeId}/latest")
    public ApiResponse<PayrollDetailDto> getLatestPayroll(@PathVariable @Positive(message = "El ID debe ser positivo") Long employeeId) {
        LocalDate[] period = calculateLastCompleteBiweeklyPeriod();
        LocalDate startDate = period[0];
        LocalDate endDate = period[1];
        payrollService.calculatePayroll(employeeId, startDate, endDate);
        PayrollDetailDto detail = payrollService.getPayrollDetail(employeeId, startDate, endDate);
        return ApiResponse.success("Última nómina completa calculada", detail);
    }

    @GetMapping("/employee/{employeeId}/latest/pdf")
    public ApiResponse<FileDownloadResponse> downloadLatestPayrollPdf(@PathVariable @Positive(message = "El ID debe ser positivo") Long employeeId) {
        LocalDate[] period = calculateLastCompleteBiweeklyPeriod();
        LocalDate startDate = period[0];
        LocalDate endDate = period[1];
        PayrollDetailDto detail = payrollService.getPayrollDetail(employeeId, startDate, endDate);
        byte[] pdfBytes = PayrollPdfGenerator.generate(detail);
        String fileName = String.format("nomina_%s_a_%s.pdf", startDate, endDate);
        String base64 = Base64.getEncoder().encodeToString(pdfBytes);
        FileDownloadResponse file = new FileDownloadResponse(fileName, "application/pdf", base64, pdfBytes.length);
        return ApiResponse.success("PDF generado", file);
    }

    static class PayrollPdfGenerator {
        static byte[] generate(PayrollDetailDto d) {
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            com.lowagie.text.Document document = new com.lowagie.text.Document(com.lowagie.text.PageSize.A4);
            try {
                com.lowagie.text.pdf.PdfWriter.getInstance(document, baos);
                document.open();
                com.lowagie.text.Font titleFont = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 16);
                com.lowagie.text.Font sectionFont = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 12);
                com.lowagie.text.Font normalFont = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA, 11);
                com.lowagie.text.Paragraph title = new com.lowagie.text.Paragraph("Recibo de Nómina", titleFont);
                title.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
                title.setSpacingAfter(12f);
                document.add(title);
                com.lowagie.text.Paragraph period = new com.lowagie.text.Paragraph(
                        String.format("Periodo: %s a %s", d.getPeriodStart(), d.getPeriodEnd()), normalFont);
                period.setSpacingAfter(10f);
                document.add(period);
                com.lowagie.text.pdf.PdfPTable table = new com.lowagie.text.pdf.PdfPTable(2);
                table.setWidthPercentage(100);
                table.setSpacingBefore(8f);
                table.setSpacingAfter(8f);
                addRow(table, "Días Laborados", String.valueOf(d.getNormalDaysWorked()), sectionFont, normalFont);
                addRow(table, "Retardos", String.valueOf(d.getLateDays()), sectionFont, normalFont);
                addRow(table, "Faltas", String.valueOf(d.getAbsentDays()), sectionFont, normalFont);
                addRow(table, "Vacaciones", String.valueOf(d.getVacationDays()), sectionFont, normalFont);
                document.add(table);
                java.util.Locale mx = java.util.Locale.forLanguageTag("es-MX");
                java.text.NumberFormat cf = java.text.NumberFormat.getCurrencyInstance(mx);
                com.lowagie.text.Paragraph amountsHeader = new com.lowagie.text.Paragraph("Importes", sectionFont);
                amountsHeader.setSpacingBefore(4f);
                amountsHeader.setSpacingAfter(6f);
                document.add(amountsHeader);
                com.lowagie.text.pdf.PdfPTable amounts = new com.lowagie.text.pdf.PdfPTable(2);
                amounts.setWidthPercentage(100);
                java.math.BigDecimal percepciones = d.getBaseSalary().add(d.getBonus() != null ? d.getBonus() : java.math.BigDecimal.ZERO);
                addRow(amounts, "Sueldo Base", cf.format(d.getBaseSalary()), normalFont, normalFont);
                addRow(amounts, "Bono", cf.format(d.getBonus() != null ? d.getBonus() : java.math.BigDecimal.ZERO), normalFont, normalFont);
                addRow(amounts, "Descuento por Retardos", cf.format(d.getLatePenaltyDeduction() != null ? d.getLatePenaltyDeduction() : java.math.BigDecimal.ZERO), normalFont, normalFont);
                addRow(amounts, "ISR", cf.format(d.getIsrDeduction() != null ? d.getIsrDeduction() : java.math.BigDecimal.ZERO), normalFont, normalFont);
                addRow(amounts, "IMSS", cf.format(d.getImssDeduction() != null ? d.getImssDeduction() : java.math.BigDecimal.ZERO), normalFont, normalFont);
                addRow(amounts, "Percepciones", cf.format(percepciones), sectionFont, normalFont);
                addRow(amounts, "Deducciones", cf.format(d.getTotalDeductions() != null ? d.getTotalDeductions() : java.math.BigDecimal.ZERO), sectionFont, normalFont);
                addRow(amounts, "Pago Neto", cf.format(d.getTotalSalary() != null ? d.getTotalSalary() : java.math.BigDecimal.ZERO), sectionFont, normalFont);
                document.add(amounts);
                if (Boolean.TRUE.equals(d.getHasBonusPenalties())) {
                    com.lowagie.text.Paragraph warn = new com.lowagie.text.Paragraph(
                            "Nota: No se aplicó bono por límites establecidos.", normalFont);
                    warn.setSpacingBefore(8f);
                    document.add(warn);
                }
            } catch (Exception ignored) { } finally { document.close(); }
            return baos.toByteArray();
        }
        private static void addRow(com.lowagie.text.pdf.PdfPTable t, String label, String value,
                                   com.lowagie.text.Font lf, com.lowagie.text.Font vf) {
            com.lowagie.text.pdf.PdfPCell c1 = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Phrase(label, lf));
            c1.setBorderWidth(0); c1.setPadding(4f);
            com.lowagie.text.pdf.PdfPCell c2 = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Phrase(value, vf));
            c2.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_RIGHT); c2.setBorderWidth(0); c2.setPadding(4f);
            t.addCell(c1); t.addCell(c2);
        }
    }

    @PostMapping("/calculate-last-15-days/{employeeId}")
    public ApiResponse<Payroll> calculateLastFifteenDays(@PathVariable Long employeeId) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(15);
        return ApiResponse.success("Nómina de últimos 15 días calculada", payrollService.calculatePayroll(employeeId, startDate, endDate));
    }
}