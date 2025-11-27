package com.cona.modules.attendance.service;

import com.cona.modules.attendance.controller.dto.AttendanceResponseDto;
import com.cona.modules.attendance.controller.dto.AttendanceStatsDto;
import com.cona.modules.attendance.controller.dto.CheckInOutRequestDto;


import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    
    AttendanceResponseDto processCheckInOut(CheckInOutRequestDto request);
    
    List<AttendanceResponseDto> getEmployeeAttendance(Long employeeId);
    
    List<AttendanceResponseDto> getEmployeeAttendanceByDateRange(Long employeeId, LocalDate startDate, LocalDate endDate);
    
    AttendanceStatsDto getEmployeeAttendanceStats(Long employeeId, LocalDate startDate, LocalDate endDate);
    
    List<AttendanceResponseDto> getTodayAttendance();
}