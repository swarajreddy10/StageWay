package com.eventmanagement.controller;

import com.eventmanagement.dto.AuthResponse;
import com.eventmanagement.dto.AuthUser;
import com.eventmanagement.dto.RegisterRequest;
import com.eventmanagement.service.AuthService;
import com.eventmanagement.service.OAuthStateService;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
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

    @MockBean
    private OAuthStateService oauthStateService;

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
        when(oauthStateService.consumeState(any())).thenReturn(null);
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
    void registerUser_delegatesToService() throws Exception {
        AuthUser user = new AuthUser(
            2L,
            "new@example.com",
            "New User",
            "ATTENDEE",
            null,
            null,
            null,
            null,
            true,
            true
        );
        AuthResponse response = new AuthResponse("token", "Bearer", 3600, user);
        when(authService.registerUser(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(
                post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"new@example.com\",\"fullName\":\"New User\",\"password\":\"Pass1234\",\"role\":\"ATTENDEE\"}")
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.user.email").value("new@example.com"));

        verify(authService).registerUser(any(RegisterRequest.class));
    }
}
