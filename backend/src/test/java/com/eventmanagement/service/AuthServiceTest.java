package com.eventmanagement.service;

import com.eventmanagement.dto.AuthResponse;
import com.eventmanagement.dto.RegisterRequest;
import com.eventmanagement.model.User;
import com.eventmanagement.repository.UserRepository;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private SupabaseAuthService supabaseAuthService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
            userRepository,
            supabaseAuthService,
            passwordEncoder,
            "",
            true
        );
    }

    @Test
    void handleSupabaseAuth_createsAttendeeByDefault() {
        SupabaseAuthService.SupabaseUser supabaseUser =
            new SupabaseAuthService.SupabaseUser("supabase-id", "host@example.com", "Host User", null);
        when(supabaseAuthService.verifyToken("token")).thenReturn(supabaseUser);
        when(userRepository.findByEmail("host@example.com")).thenReturn(null);
        when(passwordEncoder.encode(any())).thenReturn("hashed");
        when(userRepository.save(any())).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            if (saved.getId() == null) {
                saved.setId(42L);
            }
            return saved;
        });

        AuthResponse response = authService.handleSupabaseAuth("Bearer token", "HOST");

        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getRole()).isEqualTo("ATTENDEE");
        assertThat(response.user().role()).isEqualTo("ATTENDEE");
        assertThat(response.token()).isEqualTo("token");
    }

    @Test
    void handleSupabaseAuth_upgradesAttendeeToOrganizer() {
        SupabaseAuthService.SupabaseUser supabaseUser =
            new SupabaseAuthService.SupabaseUser("supabase-id", "member@example.com", "Member", null);
        User existing = new User();
        existing.setId(7L);
        existing.setEmail("member@example.com");
        existing.setFullName("Member");
        existing.setRole("ATTENDEE");

        when(supabaseAuthService.verifyToken("token")).thenReturn(supabaseUser);
        when(userRepository.findByEmail("member@example.com")).thenReturn(existing);
        when(userRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = authService.handleSupabaseAuth("Bearer token", "HOST");

        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getRole()).isEqualTo("ORGANIZER");
        assertThat(response.user().role()).isEqualTo("HOST");
    }

    @Test
    void handleSupabaseAuth_doesNotDowngradeAdmin() {
        SupabaseAuthService.SupabaseUser supabaseUser =
            new SupabaseAuthService.SupabaseUser("supabase-id", "admin@example.com", "Admin", null);
        User existing = new User();
        existing.setId(11L);
        existing.setEmail("admin@example.com");
        existing.setFullName("Admin");
        existing.setRole("ADMIN");

        when(supabaseAuthService.verifyToken("token")).thenReturn(supabaseUser);
        when(userRepository.findByEmail("admin@example.com")).thenReturn(existing);
        AuthResponse response = authService.handleSupabaseAuth("Bearer token", "ATTENDEE");

        verify(userRepository, never()).save(any());
        assertThat(response.user().role()).isEqualTo("ADMIN");
    }

    @Test
    void registerUser_isGone() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("host2@example.com");
        request.setFullName("Host Two");
        request.setPassword(UUID.randomUUID().toString());
        request.setRole("HOST");

        assertThrows(ResponseStatusException.class, () -> authService.registerUser(request));
    }
}
