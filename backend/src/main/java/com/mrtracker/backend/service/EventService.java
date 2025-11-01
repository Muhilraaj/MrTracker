package com.mrtracker.backend.service;

import com.mrtracker.backend.model.Event;
import com.mrtracker.backend.repository.ActionRepo;
import com.mrtracker.backend.repository.EventRepo;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@Service
public class EventService {

    private final EventRepo eventRepo;


    public EventService(EventRepo eventRepo,ActionRepo actionRepo) {
        this.eventRepo = eventRepo;
    }


    public List<Event> getAllEvents() {
        return eventRepo.findAll();
    }


    public Map<String,List<Event>> getEventsByDate(Instant startOfDay,Instant endOfDay) {
        return eventRepo.getEvents(startOfDay,endOfDay);
    }

    public void postEvent(Event event){
        event.setUpdatedDate(Instant.now());
        eventRepo.upsert(event);
    }
}
