package com.mrtracker.backend.service;

import com.mrtracker.backend.model.Action;
import com.mrtracker.backend.repository.ActionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class ActionService {
    @Autowired
    ActionRepo actionRepo;

    private static final Comparator<Action> PRIORITY_THEN_SEQUENCE = Comparator
            .comparing((Action action) -> Boolean.TRUE.equals(action.getPriority()))
            .reversed()
            .thenComparingInt(Action::getSequence);

    public List<Action> getDailyActions() {
        return sortByPriorityThenSequence(actionRepo.findByTypeOrderByPriorityDescSequenceAsc("todoDaily"));
    }

    public List<Action> getDailyActiveActions() {
        return sortByPriorityThenSequence(actionRepo.findByActiveTrueAndTypeOrderByPriorityDescSequenceAsc("todoDaily"));
    }

    private List<Action> sortByPriorityThenSequence(List<Action> actions) {
        return actions.stream().sorted(PRIORITY_THEN_SEQUENCE).toList();
    }
}
