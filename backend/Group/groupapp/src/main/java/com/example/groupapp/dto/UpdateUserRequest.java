package com.example.groupapp.dto;

public class UpdateUserRequest {
    private String displayName;
    private String password;
    private String timezone;
    private String localTime;

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPassword() {
        return password;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getLocalTime() {
        return localTime;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public void setLocalTime(String localTime) {
        this.localTime = localTime;
    }
}
