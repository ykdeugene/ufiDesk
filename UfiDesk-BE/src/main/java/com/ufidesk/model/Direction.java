package com.ufidesk.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Direction {
    UP("up"),
    DOWN("down"),
    LEFT("left"),
    RIGHT("right");

    private final String value;

    Direction(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static Direction fromValue(String value) {
        for (Direction direction : Direction.values()) {
            if (direction.value.equalsIgnoreCase(value)) {
                return direction;
            }
        }
        throw new IllegalArgumentException("Invalid direction value: " + value);
    }
}
