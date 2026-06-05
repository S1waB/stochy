package com.stochy.controller;

import com.stochy.entity.Transaction;
import com.stochy.repository.TransactionRepository;
import com.stochy.service.AuthService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/export")
public class ExportController {

    private final TransactionRepository transactionRepository;
    private final AuthService authService;

    public ExportController(TransactionRepository transactionRepository, AuthService authService) {
        this.transactionRepository = transactionRepository;
        this.authService = authService;
    }

    @GetMapping("/csv")
    public ResponseEntity<byte[]> exportCsv() {
        UUID userId = authService.getCurrentUserId();
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByTransactionDateDesc(userId);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(baos, true, StandardCharsets.UTF_8);

        try {
            // BOM for Excel UTF-8 compatibility
            baos.write(new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF});
        } catch (java.io.IOException e) {
            // Ignore for ByteArrayOutputStream
        }

        writer.println("Titre,Montant,Type,Categorie,Date,Notes,Recurrent,Frequence");

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (Transaction tx : transactions) {
            writer.printf("\"%s\",%.2f,%s,\"%s\",%s,\"%s\",%s,%s%n",
                    escapeCSV(tx.getTitle()),
                    tx.getAmount().doubleValue(),
                    tx.getType(),
                    tx.getCategory() != null ? escapeCSV(tx.getCategory().getName()) : "",
                    tx.getTransactionDate() != null ? tx.getTransactionDate().format(fmt) : "",
                    tx.getNotes() != null ? escapeCSV(tx.getNotes()) : "",
                    tx.getIsRecurring() != null ? tx.getIsRecurring() : false,
                    tx.getFrequency() != null ? tx.getFrequency() : ""
            );
        }
        writer.flush();

        byte[] csvBytes = baos.toByteArray();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"transactions.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .contentLength(csvBytes.length)
                .body(csvBytes);
    }

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> exportPdf() {
        UUID userId = authService.getCurrentUserId();
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByTransactionDateDesc(userId);

        byte[] pdfBytes = generatePdf(transactions);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"transactions.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(pdfBytes);
    }

    private byte[] generatePdf(List<Transaction> transactions) {
        // Pure Java PDF generation without external library
        StringBuilder sb = new StringBuilder();

        // Minimal valid PDF structure
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

            // We'll use a simple approach: build the PDF manually
            // PDF header
            List<String> lines = new java.util.ArrayList<>();
            lines.add("STOCHY - Export des Transactions");
            lines.add("=".repeat(60));
            lines.add(String.format("%-30s %-12s %-10s %-12s %-12s", "Titre", "Montant", "Type", "Categorie", "Date"));
            lines.add("-".repeat(80));

            double totalIncome = 0, totalExpense = 0;
            for (Transaction tx : transactions) {
                double amount = tx.getAmount().doubleValue();
                String type = tx.getType().toString();
                if ("INCOME".equals(type)) totalIncome += amount;
                else if ("EXPENSE".equals(type)) totalExpense += amount;

                String title = tx.getTitle().length() > 28 ? tx.getTitle().substring(0, 28) + ".." : tx.getTitle();
                String cat = tx.getCategory() != null ? tx.getCategory().getName() : "N/A";
                if (cat.length() > 10) cat = cat.substring(0, 10) + "..";
                String date = tx.getTransactionDate() != null ? tx.getTransactionDate().format(fmt) : "N/A";
                lines.add(String.format("%-30s %-12.2f %-10s %-12s %-12s", title, amount, type, cat, date));
            }

            lines.add("=".repeat(80));
            lines.add(String.format("Total Revenus : %.2f TND", totalIncome));
            lines.add(String.format("Total Depenses: %.2f TND", totalExpense));
            lines.add(String.format("Solde net     : %.2f TND", totalIncome - totalExpense));
            lines.add(String.format("Nombre de transactions : %d", transactions.size()));

            // Build a simple PDF manually
            String content = String.join("\n", lines);

            // Use iText-style simple PDF or just use PDFBox if available
            // Since no library is guaranteed, let's use ReportLab equivalent via Apache POI-less approach
            // Actually let's use a proper approach with java.awt printing → PDF via basic structure

            // Simple approach: encode as UTF-8 text PDF
            return buildSimplePdf(lines);

        } catch (Exception e) {
            // Fallback: return a text file
            return ("Export error: " + e.getMessage()).getBytes(StandardCharsets.UTF_8);
        }
    }

    private byte[] buildSimplePdf(List<String> lines) throws Exception {
        // Build a minimal valid PDF manually
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        String textContent = String.join("\n", lines);
        // Escape special PDF chars
        textContent = textContent.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");

        // Split into pages (approx 50 lines per page)
        List<List<String>> pages = new java.util.ArrayList<>();
        List<String> currentPage = new java.util.ArrayList<>();
        int lineCount = 0;
        for (String line : lines) {
            currentPage.add(line);
            lineCount++;
            if (lineCount >= 50) {
                pages.add(currentPage);
                currentPage = new java.util.ArrayList<>();
                lineCount = 0;
            }
        }
        if (!currentPage.isEmpty()) pages.add(currentPage);

        // Build PDF objects
        List<byte[]> objects = new java.util.ArrayList<>();
        List<Integer> offsets = new java.util.ArrayList<>();

        // Object 1: Catalog
        // Object 2: Pages
        // Object 3+: Page content streams
        // Object (3+pages+1): Font

        int totalPages = pages.size();
        int fontObjNum = 3 + totalPages * 2;

        // Catalog (obj 1)
        String catalog = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";

        // Build page refs for Pages dict
        StringBuilder pageRefs = new StringBuilder();
        for (int i = 0; i < totalPages; i++) {
            pageRefs.append((3 + i * 2)).append(" 0 R ");
        }

        // Pages (obj 2)
        String pagesDict = "2 0 obj\n<< /Type /Pages /Kids [" + pageRefs + "] /Count " + totalPages + " >>\nendobj\n";

        // Now build each page + its stream
        List<String> pageObjs = new java.util.ArrayList<>();
        List<String> streamObjs = new java.util.ArrayList<>();

        for (int p = 0; p < totalPages; p++) {
            int pageObjNum = 3 + p * 2;
            int streamObjNum = 4 + p * 2;

            // Build text for this page
            StringBuilder bt = new StringBuilder();
            bt.append("BT\n");
            bt.append("/F1 9 Tf\n");
            bt.append("40 780 Td\n");
            bt.append("12 TL\n");

            for (String line : pages.get(p)) {
                // Escape PDF string
                String escaped = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");
                bt.append("(").append(escaped).append(") Tj T*\n");
            }
            bt.append("ET\n");

            String streamContent = bt.toString();
            byte[] streamBytes = streamContent.getBytes(StandardCharsets.ISO_8859_1);

            String streamObj = streamObjNum + " 0 obj\n<< /Length " + streamBytes.length + " >>\nstream\n"
                    + streamContent + "\nendstream\nendobj\n";

            String pageObj = pageObjNum + " 0 obj\n<< /Type /Page /Parent 2 0 R "
                    + "/MediaBox [0 0 595 842] "
                    + "/Contents " + streamObjNum + " 0 R "
                    + "/Resources << /Font << /F1 " + fontObjNum + " 0 R >> >> "
                    + ">>\nendobj\n";

            pageObjs.add(pageObj);
            streamObjs.add(streamObj);
        }

        // Font obj
        String fontObj = fontObjNum + " 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n";

        // Assemble PDF
        out.write("%PDF-1.4\n".getBytes(StandardCharsets.ISO_8859_1));
        List<Integer> xrefOffsets = new java.util.ArrayList<>();

        // Write obj 1
        xrefOffsets.add(out.size());
        out.write(catalog.getBytes(StandardCharsets.ISO_8859_1));

        // Write obj 2
        xrefOffsets.add(out.size());
        out.write(pagesDict.getBytes(StandardCharsets.ISO_8859_1));

        // Write page objects and streams
        for (int p = 0; p < totalPages; p++) {
            xrefOffsets.add(out.size());
            out.write(pageObjs.get(p).getBytes(StandardCharsets.ISO_8859_1));
            xrefOffsets.add(out.size());
            out.write(streamObjs.get(p).getBytes(StandardCharsets.ISO_8859_1));
        }

        // Write font obj
        xrefOffsets.add(out.size());
        out.write(fontObj.getBytes(StandardCharsets.ISO_8859_1));

        // xref table
        int xrefOffset = out.size();
        int totalObjs = 1 + xrefOffsets.size(); // 0 is free
        StringBuilder xref = new StringBuilder();
        xref.append("xref\n0 ").append(totalObjs).append("\n");
        xref.append("0000000000 65535 f \n");
        for (int offset : xrefOffsets) {
            xref.append(String.format("%010d 00000 n \n", offset));
        }
        out.write(xref.toString().getBytes(StandardCharsets.ISO_8859_1));

        // trailer
        String trailer = "trailer\n<< /Size " + totalObjs + " /Root 1 0 R >>\nstartxref\n" + xrefOffset + "\n%%EOF\n";
        out.write(trailer.getBytes(StandardCharsets.ISO_8859_1));

        return out.toByteArray();
    }

    private String escapeCSV(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }
}
