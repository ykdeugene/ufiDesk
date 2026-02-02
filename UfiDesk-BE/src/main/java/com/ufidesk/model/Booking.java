package com.ufidesk.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    private String id;

    @JsonProperty("floorplanId")
    private String floorplanId;

    @JsonProperty("deskId")
    private String deskId;

    @JsonProperty("description")
    private String description;

    @JsonProperty("startDate")
    private LocalDate startDate;

    @JsonProperty("startPeriod")
    private Period startPeriod;

    @JsonProperty("endDate")
    private LocalDate endDate;

    @JsonProperty("endPeriod")
    private Period endPeriod;

    @JsonProperty("userEmail")
    private String userEmail;

    @JsonProperty("status")
    private Status status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum Period {
        AM, PM
    }

    public enum Status {
        ACTIVE, CANCELLED
    }
}
