package com.example.groupapp.dto;

import java.time.ZonedDateTime;

public class UserInfoResponse {
    private Long userId;
    private String username;
    private String displayName;
    private String timezone;
    private ZonedDateTime lastSeenAt;

    public UserInfoResponse(Long userId, String username, String displayName, String timezone, ZonedDateTime lastSeenAt) {
        this.userId = userId;
        this.username = username;
        this.displayName = displayName;
        this.timezone = timezone;
        this.lastSeenAt = lastSeenAt;
    }

    public Long getUserId() {
        return userId;
    }

    public ZonedDateTime getLastSeenAt() {
        return lastSeenAt;
    }

    public String getTimezone() {
        return timezone;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getUsername() {
        return username;
    }
}
