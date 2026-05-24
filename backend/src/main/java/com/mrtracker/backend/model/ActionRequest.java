package com.mrtracker.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ActionRequest {
    @JsonProperty
    private String name;
    @JsonProperty
    private String goal;
    @JsonProperty
    private String prompt;
    @JsonProperty
    private Boolean priority;
    @JsonProperty
    private Integer sequence;
    @JsonProperty
    private Boolean active;
    @JsonProperty
    private LocalDate activeFromDate;
}
