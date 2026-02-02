package com.ufidesk.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for updating desk details.
 *
 * Fields:
 * - deskId: The desk ID (e.g., "RT-8") from the floorplan
 * - description: Optional - updated desk description
 * - blockStart: Optional - start date of block period (null to unblock)
 * - blockEnd: Optional - end date of block period (null to unblock)
 *
 * The deskId will be matched against the main floorplan to find the desk document.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDeskDetailsRequest {

    @JsonProperty("deskId")
    private String deskId;

    @JsonProperty("description")
    private String description;

    @JsonProperty("blockStart")
    private LocalDate blockStart;

    @JsonProperty("blockEnd")
    private LocalDate blockEnd;
}
