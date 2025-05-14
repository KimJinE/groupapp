package com.example.groupapp.dto;

import java.time.ZonedDateTime;

public class GroupInfoResponse {
    private Long groupId;
    private String groupName;
    private String description;
    private boolean isAdmin;
    private boolean isCompleted;
    private int memberCount;
    private int completedCount;

    private ZonedDateTime createdAt;
    private String timezone;

    public GroupInfoResponse(Long groupId, String groupName, String description, boolean isAdmin, boolean isCompleted, ZonedDateTime createdAt, String timezone, int memberCount, int completedCount) {
        this.groupId = groupId;
        this.groupName = groupName;
        this.description = description;
        this.isAdmin = isAdmin;
        this.isCompleted = isCompleted;
        this.timezone = timezone;
        this.createdAt = createdAt;
        this.memberCount = memberCount;
        this.completedCount = completedCount;
    }

    public Long getGroupId() {
        return groupId;
    }

    public String getDescription() {
        return description;
    }

    public boolean isAdmin() {
        return isAdmin;
    }

    public boolean isCompleted() {
        return isCompleted;
    }

    public String getGroupName() {
        return groupName;
    }

    public String getTimezone() {
        return timezone;
    }

    public ZonedDateTime getCreatedAt() {
        return createdAt;
    }

    public int getCompletedCount() {
        return completedCount;
    }

    public int getMemberCount() {
        return memberCount;
    }
}
