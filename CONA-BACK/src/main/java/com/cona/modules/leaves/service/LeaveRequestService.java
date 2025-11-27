package com.cona.modules.leaves.service;

import com.cona.modules.leaves.controller.dto.LeaveRequestDto;
import com.cona.modules.leaves.controller.dto.LeaveRequestResponseDto;
import com.cona.modules.leaves.controller.dto.LeaveReviewDto;
import org.springframework.data.domain.Page;

import java.util.List;

public interface LeaveRequestService {
    
    LeaveRequestResponseDto createRequest(LeaveRequestDto dto, Long userId);
    
    Page<LeaveRequestResponseDto> getAllRequests(int page, int size, String status, String employeeName);
    
    List<LeaveRequestResponseDto> getEmployeeRequests(Long userId);
    
    LeaveRequestResponseDto getById(Long id);
    
    void reviewRequest(Long requestId, LeaveReviewDto reviewDto, Long reviewerId);
    
    long countPendingRequests();
}