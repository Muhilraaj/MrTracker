package com.mrtracker.backend.repository;

import com.mrtracker.backend.model.Event;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public interface EventRepositoryCustom {
    Map<String, List<Event>> getEvents(Instant startDate, Instant endDate);

    void upsert(Event event);
}
