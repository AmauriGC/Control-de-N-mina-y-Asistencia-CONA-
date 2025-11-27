package com.cona.modules.justifications.service;

import com.cona.modules.justifications.controller.dto.JustificationResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface JustificationService {
    JustificationResponse submit(Long employeeId, Long attendanceId, String reason, com.cona.modules.justifications.enums.DocumentType documentType, MultipartFile file);
    List<JustificationResponse> listByEmployee(Long employeeId);
    List<JustificationResponse> listAll();
    JustificationResponse approve(Long id, Long adminUserId, String adminComments);
    JustificationResponse reject(Long id, Long adminUserId, String adminComments);
}
