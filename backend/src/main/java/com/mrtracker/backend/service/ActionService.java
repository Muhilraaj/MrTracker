package com.mrtracker.backend.service;

import com.mrtracker.backend.model.Action;
import com.mrtracker.backend.repository.ActionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActionService {
    @Autowired
    ActionRepo actionRepo;

    public List<Action> getDailyActions(){
        return actionRepo.findByTypeOrderBySequence("todoDaily");
    }
    public List<Action> getDailyActiveActions(){
        return actionRepo.findByActiveTrueAndTypeOrderBySequence("todoDaily");
    }
}
