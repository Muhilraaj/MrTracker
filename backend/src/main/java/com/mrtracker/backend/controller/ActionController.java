package com.mrtracker.backend.controller;

import com.mrtracker.backend.model.Action;
import com.mrtracker.backend.service.ActionService;
import jakarta.validation.constraints.Null;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/action")
public class ActionController {

    ActionService actionService;

    ActionController(ActionService actionService){
        this.actionService=actionService;
    }

    @GetMapping
    public List<Action> getActiveAction(@RequestParam(required = false) boolean active){
        if(active){
            return actionService.getDailyActiveActions();
        }
        return  actionService.getDailyActions();
    }

}
