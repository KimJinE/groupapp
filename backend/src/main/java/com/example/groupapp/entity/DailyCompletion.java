package com.example.groupapp.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.ZonedDateTime;

@Entity
public class DailyCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private GroupMember member;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private boolean isComplete;

    @Column(nullable = false)
    private ZonedDateTime completedAt;

    @Column(nullable = false)
    private String timezone;

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public boolean isComplete() {
        return isComplete;
    }

    public void setComplete(boolean complete) {
        isComplete = complete;
    }

    public GroupMember getMember() {
        return member;
    }

    public void setMember(GroupMember member) {
        this.member = member;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public void setCompletedAt(ZonedDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public String getTimezone() {
        return timezone;
    }

    public ZonedDateTime getCompletedAt() {
        return completedAt;
    }
}
