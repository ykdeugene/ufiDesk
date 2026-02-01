package com.ufidesk.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum DeskType {
    REGULAR("regular"),
    STANDING("standing");

    private final String value;

    DeskType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static DeskType fromValue(String value) {
        for (DeskType deskType : DeskType.values()) {
            if (deskType.value.equalsIgnoreCase(value)) {
                return deskType;
            }
        }
        throw new IllegalArgumentException("Invalid desk type value: " + value);
    }
}
