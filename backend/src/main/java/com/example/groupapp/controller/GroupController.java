package com.example.groupapp.controller;

import com.example.groupapp.dto.*;
import com.example.groupapp.entity.DailyCompletion;
import com.example.groupapp.entity.GroupEntity;
import com.example.groupapp.entity.GroupMember;
import com.example.groupapp.entity.User;
import com.example.groupapp.repository.DailyCompletionRepository;
import com.example.groupapp.repository.GroupMemberRepository;
import com.example.groupapp.repository.GroupRepository;
import com.example.groupapp.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final DailyCompletionRepository dailyCompletionRepository;

    public GroupController(GroupRepository groupRepository, UserRepository userRepository, GroupMemberRepository groupMemberRepository, DailyCompletionRepository dailyCompletionRepository ) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.dailyCompletionRepository = dailyCompletionRepository;
    }

    @PostMapping("/create")
    public String createGroup(@RequestBody CreateGroupRequest request, Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow();

        System.out.println("Authenticated user: " + authentication.getName());
        System.out.println("Authorities: " + authentication.getAuthorities());

        ZoneId timezone = ZoneId.of(user.getTimezone());
        ZonedDateTime createAt = ZonedDateTime.now(timezone);

        GroupEntity group = new GroupEntity();
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setRequestApproval(request.isRequiresApproval());
        group.setCreatedBy(user);
        group.setCreatedAt(createAt);
        group.setTimezone(timezone.toString());

        groupRepository.save(group);

        GroupMember member = new GroupMember();
        member.setUser(user);
        member.setGroup(group);
        member.setAdmin(true);
        member.setJoinAt(createAt);
        member.setTimezone(timezone.toString());

        groupMemberRepository.save(member);

        return "Group created successfully with ID: " + group.getId();
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinGroup(@RequestBody JoinGroupRequest request, Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        GroupEntity group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));

        Optional<GroupMember> alreadyAMember = groupMemberRepository.findByUserAndGroup(user, group);
        if (alreadyAMember.isPresent()) {
            if (!alreadyAMember.get().isApproved()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "You already submit approval request"));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "You are already a member of this group"));
        }

        ZoneId timezone = ZoneId.of(user.getTimezone());
        ZonedDateTime joinAt = ZonedDateTime.now(timezone);

        GroupMember member = new GroupMember();
        member.setUser(user);
        member.setGroup(group);
        member.setAdmin(false);
        member.setTimezone(timezone.toString());
        member.setJoinAt(joinAt);

        if (group.isRequestApproval()) {
            member.setApproved(false);
            groupMemberRepository.save(member);
            return ResponseEntity.ok(Map.of("message", "Your request to join has been submitted. Waiting for admin approval."));
        }

        member.setApproved(true);
        member.setApprovedAt(ZonedDateTime.now());
        groupMemberRepository.save(member);
        return ResponseEntity.ok(Map.of("message", "You have joined the group successfully."));
    }

    @GetMapping
    public ResponseEntity<List<GroupInfoResponse>> getMyGroups(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow();

        ZoneId userZone = ZoneId.of(user.getTimezone());
        LocalDate today = ZonedDateTime.now(userZone).toLocalDate();

        List<GroupInfoResponse> groups = groupMemberRepository.findByUserAndApprovedTrue(user).stream()
                .map(member -> {
                    GroupEntity group = member.getGroup();
                    List<GroupMember> members = groupMemberRepository.findByGroupAndApprovedTrue(group);
                    int memberCount = members.size();

                    int completedCount = (int) members.stream()
                            .filter(m -> dailyCompletionRepository.existsByMemberAndDate(m, today))
                            .count();
                    return new GroupInfoResponse(
                            group.getId(),
                            group.getName(),
                            group.getDescription(),
                            member.isAdmin(),
                            dailyCompletionRepository.existsByMemberAndDate(member, LocalDate.now()),
                            member.getGroup().getCreatedAt(),
                            member.getGroup().getTimezone(),
                            memberCount,
                            completedCount
                    );
                })
                .collect(Collectors.toList());;

        return ResponseEntity.ok(groups);
    }

    @GetMapping("/{groupId}/members")
    public List<GroupMemberInfoResponse> getGroupMembers(@PathVariable Long groupId, Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow();

        GroupEntity group = groupRepository.findById(groupId)
                .orElseThrow(()->new RuntimeException("Group not found"));

        List<GroupMember> members = groupMemberRepository.findByGroupAndApprovedTrue(group);

        ZoneId userZoneId = ZoneId.of(user.getTimezone());
        LocalDate today = ZonedDateTime.now(userZoneId).toLocalDate();

        return members.stream()
                .map(member-> {

                    List<DailyCompletion> completions = dailyCompletionRepository.findByMemberOrderByDateAsc(member);

                    List<LocalDate> dates = completions.stream()
                            .map(DailyCompletion::getDate)
                            .collect(Collectors.toList());

                    // ✅ Find today's completion (if exists)
                    ZonedDateTime completeAt = null;
                    for (int i = completions.size() - 1; i >= 0; i--) {
                        LocalDate date = completions.get(i).getDate();

                        if (date.isBefore(today)) {
                            break; // no match will be found beyond this
                        }

                        if (date.equals(today)) {
                            completeAt = completions.get(i).getCompletedAt();
                            break;
                        }
                    }

                    return new GroupMemberInfoResponse(
                            member.getUser().getId(),
                            member.getUser().getUsername(),
                            member.getJoinAt(),
                            member.getTimezone(),
                            dates,
                            completeAt
                    );
                })
                .collect(Collectors.toList());
    }

    @PostMapping("/{groupId}/complete")
    public ResponseEntity<GroupInfoResponse> markTodayComplete(@PathVariable Long groupId, Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow();

        GroupEntity group = groupRepository.findById(groupId)
                .orElseThrow(()->new RuntimeException("Group not found"));

        GroupMember member = groupMemberRepository.findByUserAndGroup(user, group)
                .orElseThrow(()->new RuntimeException("You are not a member of this group."));

        ZoneId timezone = ZoneId.of(user.getTimezone());
        ZonedDateTime completedAt = ZonedDateTime.now(timezone);

        LocalDate today = completedAt.toLocalDate();

        if (dailyCompletionRepository.existsByMemberAndDate(member, today)) {
            throw new RuntimeException("You have already marked as completed.");
        }

        DailyCompletion completion = new DailyCompletion();

        completion.setMember(member);
        completion.setDate(today);
        completion.setCompletedAt(completedAt);
        completion.setTimezone(user.getTimezone());

        dailyCompletionRepository.save(completion);

        List<GroupMember> members = groupMemberRepository.findByGroupAndApprovedTrue(group);
        int memberCount = members.size();

        int completedCount = (int) members.stream()
                .filter(m -> dailyCompletionRepository.existsByMemberAndDate(m, today))
                .count();

        GroupInfoResponse updatedGroup = new GroupInfoResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                member.isAdmin(),
                dailyCompletionRepository.existsByMemberAndDate(member, LocalDate.now()),
                member.getGroup().getCreatedAt(),
                member.getGroup().getTimezone(),
                memberCount,
                completedCount
        );

        return ResponseEntity.ok(updatedGroup);
    }

    @DeleteMapping("/{groupId}/leave")
    public ResponseEntity<?> leaveGroup(@PathVariable Long groupId, Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow();

        GroupEntity group = groupRepository.findById(groupId)
                .orElseThrow(()->new RuntimeException("Group not found"));

        Optional<GroupMember> member = groupMemberRepository.findByUserAndGroup(user, group);
        if (member.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "You are not a member of this group."));
        }
        if (member.get().isAdmin()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "You are the admin of this group"));
        }

        List<DailyCompletion> dailyCompletionList = dailyCompletionRepository.findByMember(member.get());
        dailyCompletionRepository.deleteAll(dailyCompletionList);

        groupMemberRepository.delete(member.get());

        return ResponseEntity.ok(Map.of("message", "You have left the group."  + group.getId()));
    }

    @DeleteMapping("/{groupId}/member/{userId}/remove")
    public ResponseEntity<?> removeMember(@PathVariable Long groupId, @PathVariable Long userId, Authentication authentication) {
        String username = authentication.getName();
        User admin = userRepository.findByUsername(username).orElseThrow();

        GroupEntity group = groupRepository.findById(groupId)
                .orElseThrow(()->new RuntimeException("Group not found"));
        GroupMember member = groupMemberRepository.findByUserAndGroup(admin, group)
                .orElseThrow(() -> new RuntimeException("You are not in this group"));

        if (!member.isAdmin()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "only admin can remove member"));
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User to remove not found"));

        GroupMember removeMember = groupMemberRepository.findByUserAndGroup(user, group)
                .orElseThrow(() -> new RuntimeException("Target user is not in this group"));

        List<DailyCompletion> dailyCompletionList = dailyCompletionRepository.findByMember(removeMember);
        dailyCompletionRepository.deleteAll(dailyCompletionList);


        groupMemberRepository.delete(removeMember);

        return ResponseEntity.ok(Map.of("message", "Member removed from group."));
    }

    @DeleteMapping("/{groupId}/delete")
    public ResponseEntity<?> deleteGroup(@PathVariable Long groupId, Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow();

        GroupEntity group = groupRepository.findById(groupId)
                .orElseThrow(()->new RuntimeException("Group not found"));

        Optional<GroupMember> member = groupMemberRepository.findByUserAndGroup(user, group);
        if (member.isEmpty() | !member.get().isAdmin()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Only group admins can delete the group."));
        }

        List<GroupMember> members = groupMemberRepository.findByGroup(group);

        for (GroupMember m : members) {
            List<DailyCompletion> dailyCompletionList = dailyCompletionRepository.findByMember(m);
            dailyCompletionRepository.deleteAll(dailyCompletionList);
        }
        groupMemberRepository.deleteAll(members);

        groupRepository.delete(group);

        return ResponseEntity.ok(Map.of("message", "You have delete the group."  + group.getId()));
    }

    @PostMapping("/{groupId}/members/{userId}/approve")
    public ResponseEntity<?> approveMember(@PathVariable Long groupId, @PathVariable Long userId, Authentication authentication) {
        String username = authentication.getName();
        User admin = userRepository.findByUsername(username).orElseThrow();
        GroupEntity group = groupRepository.findById(groupId)
                .orElseThrow(()->new RuntimeException("Group not found"));

        GroupMember member = groupMemberRepository.findByUserAndGroup(admin, group)
                .orElseThrow(() -> new RuntimeException("Not a member"));

        if (!member.isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Only admins can approve members."));
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        GroupMember newMember = groupMemberRepository.findByUserAndGroup(user, group)
                .orElseThrow(() -> new RuntimeException("User not found in group"));

        newMember.setApproved(true);
        newMember.setApprovedAt(ZonedDateTime.now());
        groupMemberRepository.save(newMember);
        return ResponseEntity.ok(Map.of("message", "Member approved successfully."));
    }

    @GetMapping("/pendingmembers")
    public  ResponseEntity<?> getPendingMember(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow();

        List<GroupMember> groups = groupMemberRepository.findByUserAndIsAdminTrue(user);

        List<Map<String, Object>> pendingList = new ArrayList<>();

        for (GroupMember myGroup : groups) {
            GroupEntity group = myGroup.getGroup();
            List<GroupMember> pendingMembers = groupMemberRepository.findByGroupAndApprovedFalse(group);

            for (GroupMember member: pendingMembers) {
                Map<String, Object> record = new HashMap<>();
                record.put("groupId", group.getId());
                record.put("groupName", group.getName());
                record.put("userId", member.getUser().getId());
                record.put("userName", member.getUser().getUsername());
                record.put("displayName", member.getUser().getDisplayname());
                record.put("joinAt", member.getJoinAt());
                pendingList.add(record);
            }
        }

        return ResponseEntity.ok(pendingList);
    }
}
