package com.eventmanagement.controller;

import com.eventmanagement.dto.AuthResponse;
import com.eventmanagement.dto.AuthUser;
import com.eventmanagement.service.AuthService;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Test
    void handleSupabaseAuth_returnsAuthResponse() throws Exception {
        AuthUser user = new AuthUser(
            1L,
            "host@example.com",
            "Host",
            "HOST",
            null,
            null,
            OffsetDateTime.parse("2026-01-12T10:00:00Z"),
            OffsetDateTime.parse("2026-01-12T10:00:00Z"),
            true,
            true
        );
        AuthResponse response = new AuthResponse("token", "Bearer", 3600, user);
        when(authService.handleSupabaseAuth("Bearer token", "HOST")).thenReturn(response);

        mockMvc.perform(
                post("/api/auth/supabase")
                    .header("Authorization", "Bearer token")
                    .header("X-Desired-Role", "HOST")
                    .contentType(MediaType.APPLICATION_JSON)
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").value("token"))
            .andExpect(jsonPath("$.user.role").value("HOST"));
    }

    @Test
    void registerUser_isGone() throws Exception {
        mockMvc.perform(
                post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"new@example.com\",\"fullName\":\"New User\",\"password\":\"Pass1234\",\"role\":\"ATTENDEE\"}")
            )
            .andExpect(status().isGone());
    }
}
