package com.eventmanagement.controller;

import com.eventmanagement.dto.EventRequest;
import com.eventmanagement.dto.EventResponse;
import com.eventmanagement.dto.PagedResponse;
import com.eventmanagement.service.EventService;
import com.eventmanagement.service.RegistrationService;
import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EventController.class)
@AutoConfigureMockMvc(addFilters = false)
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EventService eventService;

    @MockBean
    private RegistrationService registrationService;

    @Test
    void getAllEvents_returnsList() throws Exception {
        EventResponse response = sampleEvent();
        PagedResponse<EventResponse> paged = new PagedResponse<>(
            List.of(response),
            0,
            12,
            1,
            1,
            true,
            true
        );
        when(eventService.getAllEvents(null, null, null, null, null, null, null, null, 0, 12))
            .thenReturn(paged);

        mockMvc.perform(get("/api/events"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].name").value("Sample Event"));
    }

    @Test
    void createEvent_forwardsAuthorizationHeader() throws Exception {
        EventResponse response = sampleEvent();
        when(eventService.createEvent(any(EventRequest.class), eq("Bearer token"))).thenReturn(response);

        mockMvc.perform(
                post("/api/events")
                    .header("Authorization", "Bearer token")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"name\":\"Sample Event\",\"startDate\":\"2026-01-12T10:00:00Z\",\"endDate\":\"2026-01-12T12:00:00Z\"}")
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Sample Event"));

        verify(eventService).createEvent(any(EventRequest.class), eq("Bearer token"));
    }

    private EventResponse sampleEvent() {
        OffsetDateTime start = OffsetDateTime.parse("2026-01-12T10:00:00Z");
        OffsetDateTime end = OffsetDateTime.parse("2026-01-12T12:00:00Z");
        return new EventResponse(
            1L,
            1L,
            1L,
            "Sample Event",
            "Sample description",
            "Tech",
            start,
            end,
            "Hyderabad",
            "Pulse Studio",
            100,
            100L,
            0.0,
            "USD",
            null,
            "PUBLISHED",
            start,
            start,
            start,
            false,
            List.of("tag"),
            start,
            end,
            "45 Banjara Hills",
            "Hyderabad",
            null,
            "FREE",
            "Organizer"
        );
    }
}
