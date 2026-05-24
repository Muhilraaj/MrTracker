package com.mrtracker.backend.controller;

import com.mrtracker.backend.model.Action;
import com.mrtracker.backend.model.ActionRequest;
import com.mrtracker.backend.service.ActionService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/actions")
public class ActionController {

    ActionService actionService;

    ActionController(ActionService actionService) {
        this.actionService = actionService;
    }

    @GetMapping
    public List<Action> getActions(
            @RequestParam(required = false) boolean active,
            @RequestParam(required = false) LocalDate asOfDate) {
        if (active) {
            return actionService.getDailyActiveActions(asOfDate);
        }
        return actionService.getDailyActions(asOfDate);
    }

    @GetMapping("/{id}")
    public Action getAction(@PathVariable String id) {
        return actionService.getActionById(id);
    }

    @PostMapping
    public Action createAction(@RequestBody ActionRequest request) {
        return actionService.createAction(request);
    }

    @PutMapping("/{id}")
    public Action updateAction(@PathVariable String id, @RequestBody ActionRequest request) {
        return actionService.updateAction(id, request);
    }
}
