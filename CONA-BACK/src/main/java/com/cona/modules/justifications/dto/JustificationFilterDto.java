package com.cona.modules.justifications.dto;

import com.cona.modules.justifications.enums.DocumentType;
import com.cona.modules.justifications.enums.JustificationStatus;
import lombok.Data;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;

@Data
public class JustificationFilterDto {
    private Long employeeId;
    private JustificationStatus status;
    private DocumentType documentType;
    private LocalDate startDate;
    private LocalDate endDate;
    
    private Integer page = 0;
    private Integer size = 20;
    private String sortBy = "createdAt";
    private Sort.Direction direction = Sort.Direction.DESC;
    
    public Pageable toPageable() {
        return PageRequest.of(page, size, Sort.by(direction, sortBy));
    }
}
