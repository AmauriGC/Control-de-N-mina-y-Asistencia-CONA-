package com.cona.modules.attendance.controller;

import com.cona.modules.attendance.controller.dto.AttendanceResponseDto;
import com.cona.modules.attendance.controller.dto.AttendanceStatsDto;
import com.cona.modules.attendance.controller.dto.CheckInOutRequestDto;
import com.cona.modules.attendance.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/check-in-out")
    public ResponseEntity<AttendanceResponseDto> checkInOut(@Valid @RequestBody CheckInOutRequestDto request) {
        AttendanceResponseDto response = attendanceService.processCheckInOut(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<AttendanceResponseDto>> getEmployeeAttendance(@PathVariable Long employeeId) {
        List<AttendanceResponseDto> attendance = attendanceService.getEmployeeAttendance(employeeId);
        return ResponseEntity.ok(attendance);
    }

    @GetMapping("/employee/{employeeId}/range")
    public ResponseEntity<List<AttendanceResponseDto>> getEmployeeAttendanceByRange(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<AttendanceResponseDto> attendance = attendanceService.getEmployeeAttendanceByDateRange(
                employeeId, startDate, endDate);
        return ResponseEntity.ok(attendance);
    }

    @GetMapping("/employee/{employeeId}/stats")
    public ResponseEntity<AttendanceStatsDto> getEmployeeAttendanceStats(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        AttendanceStatsDto stats = attendanceService.getEmployeeAttendanceStats(employeeId, startDate, endDate);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/today")
    public ResponseEntity<List<AttendanceResponseDto>> getTodayAttendance() {
        List<AttendanceResponseDto> todayAttendance = attendanceService.getTodayAttendance();
        return ResponseEntity.ok(todayAttendance);
    }
}