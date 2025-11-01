package com.mrtracker.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Data
@Document(collection = "actions")
public class Action {
    @Id
    private String id;
    @JsonProperty
    private String name;
    @JsonProperty
    private String goal;
    @JsonProperty
    private String prompt;
    @JsonProperty
    private String type;
    @JsonProperty
    private Boolean active;
    @JsonProperty
    private int sequence;
}
