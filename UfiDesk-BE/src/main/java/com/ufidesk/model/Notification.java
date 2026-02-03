package com.ufidesk.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    private String id;

    @JsonProperty("email")
    private String email;

    @JsonProperty("bookingId")
    private String bookingId;

    @JsonProperty("cancelledBy")
    private String cancelledBy;

    @JsonProperty("notifiedStatus")
    private boolean notifiedStatus;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
