package com.mrtracker.backend.repository;
import com.mrtracker.backend.model.Action;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActionRepo extends MongoRepository<Action, String> {
    List<Action> findByActiveTrueAndTypeOrderByPriorityDescSequenceAsc(String type);
    List<Action> findByTypeOrderByPriorityDescSequenceAsc(String type);
}
