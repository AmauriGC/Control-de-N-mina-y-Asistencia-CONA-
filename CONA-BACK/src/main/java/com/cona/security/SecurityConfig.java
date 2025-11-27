package com.cona.security;

import com.cona.modules.auth.service.CustomUserDetailsService;
import com.cona.security.jwt.JwtAuthenticationFilter;
import com.cona.security.jwt.JwtTokenProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private static final String[] ADMIN_ENDPOINTS = {
            "/employees",
            "/employees/*/status",
            "/system-config/**",
            "/leave-requests",
            "/leave-requests/*/review/user/*",
            "/leave-requests/stats/pending",
            "/attendance/today"
    };

    private static final String[] EMPLOYEE_ENDPOINTS = {
            "/leave-requests/user/*/requests",
            "/attendance/employee/*",
            "/attendance/employee/*/range",
            "/attendance/employee/*/stats"
    };

    private static final String[] COMMON_ENDPOINTS = {
            "/employees/*",
            "/leave-requests/*",
            "/leave-requests/user/*/***"
    };

    private static final String[] PUBLIC_ENDPOINTS = {
            "/auth/login",
            "/auth/google",
            "/auth/register",
            "/auth/forgot-password",
            "/auth/reset-password",
            "/attendance/check-in-out"
    };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           JwtTokenProvider jwt,
                                           CustomUserDetailsService users,
                                           AuthenticationProvider authenticationProvider) throws Exception {

        http.csrf(csrf -> csrf.disable())
                .cors(cors -> {
                })
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()

                        // Solo EMPLOYEE (more specific patterns first)
                        .requestMatchers(EMPLOYEE_ENDPOINTS).hasRole("EMPLOYEE")

                        // Solo ADMIN
                        .requestMatchers(ADMIN_ENDPOINTS).hasRole("ADMIN")

                        // Solo EMPLOYEE
                        .requestMatchers(EMPLOYEE_ENDPOINTS).hasRole("EMPLOYEE")

                        // ADMIN o EMPLOYEE
                        .requestMatchers(COMMON_ENDPOINTS).hasAnyRole("ADMIN", "EMPLOYEE")

                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(new JwtAuthenticationFilter(jwt, users), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(UserDetailsService userDetailsService,
                                                         PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }
}
