package com.stochy.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {
    private UsersStats usersStats;
    private DemographicsStats demographicsStats;
    private FinancialStats financialStats;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UsersStats {
        private Long totalUsers;
        private Long activeUsers;
        private Long inactiveUsers;
        private Long newUsersThisMonth;
        private List<MonthlyCount> registrationTrend;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MonthlyCount {
        private String month;
        private Long count;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DemographicsStats {
        private List<StatusCount> byProfessionalStatus;
        private List<StatusCount> byGender;
        private List<StatusCount> byMaritalStatus;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class StatusCount {
        private String status;
        private Long count;
        private Double percentage;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class FinancialStats {
        private BigDecimal averageMonthlyIncome;
        private BigDecimal averageMonthlyExpenses;
        private Double averageSavingsRate;
        private List<TopCategory> topExpenseCategories;
        private Long usersWithActiveLoans;
        private Long usersWithActiveGoals;
        private BigDecimal averageLoanAmount;
        private List<IncomeByStatus> incomeByProfessionalStatus;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TopCategory {
        private String categoryName;
        private BigDecimal avgAmount;
        private Long usersCount;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class IncomeByStatus {
        private String status;
        private BigDecimal avgIncome;
    }
}
