package com.mrtracker.backend.service;

import com.mrtracker.backend.exception.ActionNotFoundException;
import com.mrtracker.backend.model.Action;
import com.mrtracker.backend.model.ActionRequest;
import com.mrtracker.backend.repository.ActionRepo;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.List;

@Service
public class ActionService {
    private static final String DAILY_ACTION_TYPE = "todoDaily";

    @Autowired
    ActionRepo actionRepo;

    private static final Comparator<Action> PRIORITY_THEN_SEQUENCE = Comparator
            .comparing((Action action) -> Boolean.TRUE.equals(action.getPriority()))
            .reversed()
            .thenComparingInt(Action::getSequence);

    public List<Action> getDailyActions(LocalDate asOfDate) {
        return filterVisibleAsOf(
                sortByPriorityThenSequence(actionRepo.findByTypeOrderByPriorityDescSequenceAsc(DAILY_ACTION_TYPE)),
                asOfDate);
    }

    public List<Action> getDailyActiveActions(LocalDate asOfDate) {
        return filterVisibleAsOf(
                sortByPriorityThenSequence(actionRepo.findByActiveTrueAndTypeOrderByPriorityDescSequenceAsc(DAILY_ACTION_TYPE)),
                asOfDate);
    }

    public List<Action> getDailyActions() {
        return getDailyActions(null);
    }

    public List<Action> getDailyActiveActions() {
        return getDailyActiveActions(null);
    }

    public Action getActionById(String id) {
        Action action = actionRepo.findByIdAndType(id, DAILY_ACTION_TYPE)
                .orElseThrow(() -> new ActionNotFoundException(id));
        enrichActiveFromDateForResponse(action);
        return action;
    }

    public Action createAction(ActionRequest request) {
        validateRequiredFields(request);

        Instant now = startOfUtcDay(Instant.now());
        Action action = new Action();
        action.setName(request.getName().trim());
        action.setGoal(trimOrEmpty(request.getGoal()));
        action.setPrompt(request.getPrompt().trim());
        action.setType(DAILY_ACTION_TYPE);
        action.setActive(request.getActive() == null || request.getActive());
        action.setPriority(Boolean.TRUE.equals(request.getPriority()));
        action.setSequence(resolveSequence(request.getSequence()));
        action.setCreatedDate(now);
        action.setActiveFromDate(resolveActiveFromDate(request.getActiveFromDate(), now));

        return actionRepo.save(action);
    }

    public Action updateAction(String id, ActionRequest request) {
        validateRequiredFields(request);

        Action action = getActionById(id);
        action.setName(request.getName().trim());
        action.setGoal(trimOrEmpty(request.getGoal()));
        action.setPrompt(request.getPrompt().trim());
        if (request.getPriority() != null) {
            action.setPriority(request.getPriority());
        }
        if (request.getSequence() != null) {
            action.setSequence(resolveSequence(request.getSequence()));
        }
        if (request.getActive() != null) {
            action.setActive(request.getActive());
        }
        if (request.getActiveFromDate() != null) {
            action.setActiveFromDate(toStartOfUtcDay(request.getActiveFromDate()));
        }

        return actionRepo.save(action);
    }

    private int resolveSequence(Integer sequence) {
        if (sequence == null) {
            return nextSequence();
        }
        if (sequence < 0) {
            throw new IllegalArgumentException("Sequence must be zero or greater");
        }
        return sequence;
    }

    private int nextSequence() {
        return actionRepo.findByTypeOrderByPriorityDescSequenceAsc(DAILY_ACTION_TYPE).stream()
                .mapToInt(Action::getSequence)
                .max()
                .orElse(0) + 1;
    }

    private void validateRequiredFields(ActionRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (request.getPrompt() == null || request.getPrompt().isBlank()) {
            throw new IllegalArgumentException("Prompt is required");
        }
    }

    private String trimOrEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private Instant startOfUtcDay(Instant instant) {
        return instant.atOffset(ZoneOffset.UTC)
                .toLocalDate()
                .atStartOfDay()
                .toInstant(ZoneOffset.UTC);
    }

    private Instant toStartOfUtcDay(LocalDate date) {
        return date.atStartOfDay().toInstant(ZoneOffset.UTC);
    }

    private Instant resolveActiveFromDate(LocalDate activeFromDate, Instant fallback) {
        if (activeFromDate != null) {
            return toStartOfUtcDay(activeFromDate);
        }
        return fallback;
    }

    private List<Action> filterVisibleAsOf(List<Action> actions, LocalDate asOfDate) {
        if (asOfDate == null) {
            return actions;
        }
        Instant asOfInstant = toStartOfUtcDay(asOfDate);
        return actions.stream()
                .filter(action -> isVisibleAsOf(action, asOfInstant))
                .toList();
    }

    private boolean isVisibleAsOf(Action action, Instant asOfInstant) {
        return !effectiveActiveFromDate(action).isAfter(asOfInstant);
    }

    private Instant effectiveActiveFromDate(Action action) {
        if (action.getActiveFromDate() != null) {
            return startOfUtcDay(action.getActiveFromDate());
        }
        if (action.getCreatedDate() != null) {
            return startOfUtcDay(action.getCreatedDate());
        }
        if (action.getId() != null && ObjectId.isValid(action.getId())) {
            return startOfUtcDay(new ObjectId(action.getId()).getDate().toInstant());
        }
        return Instant.EPOCH;
    }

    private List<Action> sortByPriorityThenSequence(List<Action> actions) {
        return actions.stream()
                .peek(this::enrichActiveFromDateForResponse)
                .sorted(PRIORITY_THEN_SEQUENCE)
                .toList();
    }

    private void enrichActiveFromDateForResponse(Action action) {
        if (action.getActiveFromDate() == null) {
            action.setActiveFromDate(effectiveActiveFromDate(action));
        }
    }
}
