package com.mrtracker.backend.repository;

import com.mrtracker.backend.model.Event;
import org.bson.Document;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.*;

@Repository
public class EventRepositoryCustomImpl implements EventRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    public EventRepositoryCustomImpl(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public Map<String, List<Event>> getEvents(Instant startDate, Instant endDate) {
        MatchOperation match = Aggregation.match(
                Criteria.where("eventDate").gte(startDate).lt(endDate)
        );
        ProjectionOperation project = Aggregation.project()
                .andExpression("{ $dateToString: { format: '%Y-%m-%d', date: '$eventDate', timezone: 'UTC' } }")
                .as("date")
                // Include all original fields we want to pass to the next stage ($$ROOT will contain these)
                .andInclude("_id", "actionId", "status", "updatedDate","eventDate");
        GroupOperation group = Aggregation.group("date")
                .push(Aggregation.ROOT).as("records");

        SortOperation sort = Aggregation.sort(Sort.by(Sort.Direction.ASC, "eventDate"));

        Aggregation aggregation = Aggregation.newAggregation(match,project, group, sort);

        List<Document> results = mongoTemplate.aggregate(
                aggregation, "events", Document.class
        ).getMappedResults();

        System.out.println(results);

        Map<String, List<Event>> groupedMap = new LinkedHashMap<>();
        for (Document doc : results) {
            String eventDate = doc.getString("_id");
            List<Document> recordDocs = (List<Document>) doc.get("records");
            List<Event> events = recordDocs.stream()
                    .map(d -> mongoTemplate.getConverter().read(Event.class, d))
                    .toList();
            groupedMap.put(eventDate, events);
        }

        return groupedMap;
    }

    @Override
    public void upsert(Event event){
        Criteria criteria = new Criteria();
        List<Criteria> conditions = new ArrayList<>();
        conditions.add(Criteria.where("eventDate").is(event.getEventDate()));
        conditions.add(Criteria.where("actionId").is(event.getActionId()));
        Update update = new Update()
                .set("status", event.getStatus())
                .set("updatedDate", Instant.now());
        criteria = new Criteria().andOperator(conditions.toArray(new Criteria[0]));
        Query query=new Query(criteria);
        mongoTemplate.upsert(query, update, Event.class);
    }
}
