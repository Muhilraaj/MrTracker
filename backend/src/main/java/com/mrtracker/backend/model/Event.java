package com.mrtracker.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "events")
public class Event {

    @Id @JsonProperty
    private String id;

    @JsonProperty
    private String actionId;
    private Integer status;       // 0 = pending, 1 = completed, etc.
    private Instant eventDate;
    private Instant updatedDate;
}
