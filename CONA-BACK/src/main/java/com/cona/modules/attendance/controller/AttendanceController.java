package com.cona.modules.attendance.controller;

import com.cona.kernel.response.ApiResponse;
import com.cona.modules.attendance.controller.dto.AttendanceResponseDto;
import com.cona.modules.attendance.controller.dto.AttendanceStatsDto;
import com.cona.modules.attendance.controller.dto.CheckInOutRequestDto;
import com.cona.modules.attendance.controller.dto.TodayAttendanceCountsDto;
import com.cona.modules.attendance.controller.dto.AttendanceRangeRequestDto;
import com.cona.modules.attendance.service.AttendanceService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Validated // Activar validación en parámetros
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/check-in-out")
    public ApiResponse<AttendanceResponseDto> checkInOut(@Valid @RequestBody CheckInOutRequestDto request) {
        AttendanceResponseDto response = attendanceService.processCheckInOut(request);
        return ApiResponse.success("Registro de asistencia procesado", response);
    }

    @GetMapping("/employee/{employeeId}")
    public ApiResponse<List<AttendanceResponseDto>> getEmployeeAttendance(@PathVariable @Positive(message = "El ID debe ser positivo") Long employeeId) {
        List<AttendanceResponseDto> attendance = attendanceService.getEmployeeAttendance(employeeId);
        return ApiResponse.success("Asistencia del empleado obtenida", attendance);
    }

    @GetMapping("/employee/{employeeId}/paginated")
    public ApiResponse<Page<AttendanceResponseDto>> getEmployeeAttendancePaginated(
            @PathVariable @Positive(message = "El ID debe ser positivo") Long employeeId,
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "El page debe ser >= 0") int page,
            @RequestParam(defaultValue = "15") @Min(value = 1, message = "El size debe ser >= 1") @Max(value = 100, message = "El size máximo es 100") int size) {
        Page<AttendanceResponseDto> attendancePage = attendanceService.getEmployeeAttendancePaginated(employeeId, page, size);
        return ApiResponse.success("Asistencia paginada del empleado obtenida", attendancePage);
    }

    @GetMapping("/employee/{employeeId}/range")
    public ApiResponse<List<AttendanceResponseDto>> getEmployeeAttendanceByRange(
            @PathVariable @Positive(message = "El ID debe ser positivo") Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<AttendanceResponseDto> attendance = attendanceService.getEmployeeAttendanceByDateRange(
                employeeId, startDate, endDate);
        return ApiResponse.success("Asistencia por rango obtenida", attendance);
    }

    @PostMapping("/employee/{employeeId}/range")
    public ApiResponse<List<AttendanceResponseDto>> postEmployeeAttendanceByRange(
            @PathVariable @Positive(message = "El ID debe ser positivo") Long employeeId,
            @Valid @RequestBody AttendanceRangeRequestDto range
    ) {
        List<AttendanceResponseDto> attendance = attendanceService.getEmployeeAttendanceByDateRange(
                employeeId, range.startDate(), range.endDate());
        return ApiResponse.success("Asistencia por rango obtenida", attendance);
    }

    @GetMapping("/employee/{employeeId}/stats")
    public ApiResponse<AttendanceStatsDto> getEmployeeAttendanceStats(
            @PathVariable @Positive(message = "El ID debe ser positivo") Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        AttendanceStatsDto stats = attendanceService.getEmployeeAttendanceStats(employeeId, startDate, endDate);
        return ApiResponse.success("Estadísticas de asistencia obtenidas", stats);
    }

    @GetMapping("/today")
    public ApiResponse<List<AttendanceResponseDto>> getTodayAttendance() {
        List<AttendanceResponseDto> todayAttendance = attendanceService.getTodayAttendance();
        return ApiResponse.success("Asistencia de hoy obtenida", todayAttendance);
    }

    @GetMapping("/employee/{employeeId}/recent")
    public ApiResponse<List<AttendanceResponseDto>> getRecentEmployeeAttendance(
            @PathVariable @Positive(message = "El ID debe ser positivo") Long employeeId,
            @RequestParam(defaultValue = "4") @Min(value = 1, message = "El límite debe ser >= 1") @Max(value = 50, message = "El límite máximo es 50") Integer limit
    ) {
        List<AttendanceResponseDto> list = attendanceService.getEmployeeAttendance(employeeId);
        List<AttendanceResponseDto> recent = list.stream().limit(limit).toList();
        return ApiResponse.success("Asistencia reciente obtenida", recent);
    }

    @GetMapping("/today/counts")
    public ApiResponse<TodayAttendanceCountsDto> getTodayCounts() {
        TodayAttendanceCountsDto counts = attendanceService.getTodayCounts();
        return ApiResponse.success("Conteos de asistencia de hoy", counts);
    }
}