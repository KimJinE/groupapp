package com.example.groupapp.dto;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;

public class GroupMemberInfoResponse {
    private Long userId;
    private String username;
    private ZonedDateTime joinAt;
    private String timezone;
    private List<LocalDate> completionDates;
    private ZonedDateTime completeAt;

    public GroupMemberInfoResponse(Long userId, String username, ZonedDateTime joinAt, String timezone, List<LocalDate> completionDates, ZonedDateTime completeAt) {
        this.userId = userId;
        this.username = username;
        this.joinAt = joinAt;
        this.timezone = timezone;
        this.completionDates = completionDates;
        this.completeAt = completeAt;
    }

    public Long getUserId() {
        return userId;
    }

    public String getTimezone() {
        return timezone;
    }

    public ZonedDateTime getJoinAt() {
        return joinAt;
    }

    public String getUsername() {
        return username;
    }

    public List<LocalDate> getCompletionDates() {
        return completionDates;
    }

    public ZonedDateTime getCompleteAt() {
        return completeAt;
    }
}
