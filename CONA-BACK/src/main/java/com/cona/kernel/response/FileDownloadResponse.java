package com.cona.kernel.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileDownloadResponse {
    private String filename;
    private String contentType;
    private String base64Data;
    private long sizeBytes;
}

