package com.example.groupapp.repository;

import com.example.groupapp.entity.DailyCompletion;
import com.example.groupapp.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DailyCompletionRepository extends JpaRepository<DailyCompletion, Long> {
    boolean existsByMemberAndDate(GroupMember member, LocalDate date);
    List<DailyCompletion> findByMember(GroupMember member);
    List<DailyCompletion> findByMemberOrderByDateAsc(GroupMember member);
}
