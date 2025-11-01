package com.mrtracker.backend.controller;


import com.mrtracker.backend.model.Event;
import com.mrtracker.backend.service.EventService;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/event")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService){
        this.eventService = eventService;
    }

    // 🟢 Get all events
    @GetMapping
    public List<Event> getEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/range")
    public Map<String,List<Event>> getEventsByDate(@RequestParam Instant start,@RequestParam Instant end) {
        return eventService.getEventsByDate(start,end);
    }

    @PostMapping
    public void postEvent(@RequestBody Event event){
        if(event.getEventDate()==null){
            event.setEventDate(LocalDate.now()
                    .atStartOfDay(ZoneOffset.UTC)
                    .toInstant());
        }
        eventService.postEvent(event);
    }
}
