package com.example.groupapp.repository;

import com.example.groupapp.entity.GroupEntity;
import com.example.groupapp.entity.GroupMember;
import com.example.groupapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByUser(User user);
    List<GroupMember> findByGroup(GroupEntity group);
    Optional<GroupMember> findByUserAndGroup(User user, GroupEntity group);

    List<GroupMember> findByUserAndIsAdminTrue(User user);
    List<GroupMember> findByUserAndApprovedTrue(User user);
    List<GroupMember> findByGroupAndApprovedFalse(GroupEntity group);
    List<GroupMember> findByGroupAndApprovedTrue(GroupEntity group);

}
