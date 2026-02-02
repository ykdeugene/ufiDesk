package com.ufidesk.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "floorplans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Floorplan {

    @Id
    private String id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("xLength")
    private int xLength;

    @JsonProperty("yLength")
    private int yLength;

    @JsonProperty("desks")
    private List<Desk> desks;

    @JsonProperty("isMain")
    private boolean main;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Desk {
        private String id;
        private int x;
        private int y;
        private boolean hasMonitor;
        private Direction direction;
        private DeskType type;
    }
}
