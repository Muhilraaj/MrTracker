package com.mrtracker.backend.repository;

import com.mrtracker.backend.model.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface EventRepo extends MongoRepository<Event, String>, EventRepositoryCustom  {

    // Custom query methods
    List<Event> findByStatus(Integer status);

    List<Event> findByActionId(String actionId);

    List<Event> findByEventDateBetween(Instant start, Instant end);

}
