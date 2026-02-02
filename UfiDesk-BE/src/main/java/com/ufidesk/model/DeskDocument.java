package com.ufidesk.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Document representing a desk in the desk table/collection.
 *
 * Stores desk information including:
 * - Reference to the floorplan it belongs to
 * - Desk details (ID, description)
 * - Block dates (if desk is blocked)
 */
@Document(collection = "desks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeskDocument {

    @Id
    private String id;

    @JsonProperty("floorplanId")
    private String floorplanId;

    @JsonProperty("deskId")
    private String deskId;

    @JsonProperty("description")
    private String description;

    @JsonProperty("blockStart")
    private LocalDate blockStart;

    @JsonProperty("blockEnd")
    private LocalDate blockEnd;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    /**
     * Check if the desk is currently blocked.
     * A desk is blocked if both blockStart and blockEnd are not null.
     *
     * @return true if the desk is blocked, false otherwise
     */
    public boolean isBlocked() {
        return blockStart != null && blockEnd != null;
    }
}
