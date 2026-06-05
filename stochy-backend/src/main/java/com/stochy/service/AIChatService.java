package com.stochy.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stochy.dto.request.AIChatRequest;
import com.stochy.dto.response.AIChatResponse;
import com.stochy.entity.Debt;
import com.stochy.entity.Loan;
import com.stochy.entity.User;
import com.stochy.exception.ResourceNotFoundException;
import com.stochy.repository.DebtRepository;
import com.stochy.repository.LoanRepository;
import com.stochy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AIChatService {

    @Value("${groq.api.key}")
    private String groqApiKey;

    private final UserRepository userRepository;
    private final LoanRepository loanRepository;
    private final DebtRepository debtRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public AIChatService(UserRepository userRepository, LoanRepository loanRepository, DebtRepository debtRepository, ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.loanRepository = loanRepository;
        this.debtRepository = debtRepository;
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    public AIChatResponse getChatResponse(UUID userId, AIChatRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Loan> loans = loanRepository.findByUserId(userId);
        List<Debt> debts = debtRepository.findByUserId(userId);

        String systemPrompt = buildSystemPrompt(user, loans, debts);

        try {
            String url = "https://api.groq.com/openai/v1/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(groqApiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("model", "llama-3.1-8b-instant");
            
            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", systemPrompt);

            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", request.getMessage());

            body.put("messages", new Object[]{systemMessage, userMessage});

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    String reply = (String) message.get("content");
                    return new AIChatResponse(reply);
                }
            }

            return new AIChatResponse("Désolé, je n'ai pas pu générer une réponse pour le moment.");

        } catch (Exception e) {
            e.printStackTrace();
            return new AIChatResponse("Erreur de connexion à l'assistant IA: " + e.getMessage());
        }
    }

    private String buildSystemPrompt(User user, List<Loan> loans, List<Debt> debts) {
        try {
            Map<String, Object> data = new HashMap<>();
            data.put("loans", loans.stream().map(l -> Map.of(
                    "lenderName", l.getLenderName(),
                    "initialAmount", l.getInitialAmount(),
                    "interestRate", l.getInterestRate(),
                    "durationMonths", l.getDurationMonths(),
                    "isActive", l.getIsActive()
            )).toList());

            data.put("debts", debts.stream().map(d -> Map.of(
                    "debtorName", d.getDebtorName(),
                    "amountLent", d.getAmountLent(),
                    "status", d.getStatus()
            )).toList());

            String jsonData = objectMapper.writeValueAsString(data);

            return "You are an AI financial advisor for the Stochy app. Your role is to analyze the user's financial data and answer their questions in a friendly, professional manner in French.\n\n" +
                   "The user specifically asked for predictions on which bank is best for them based on old loans, and which person they should lend to (or not) based on lending history.\n" +
                   "Use the following user data to formulate your advice:\n" + jsonData + "\n\n" +
                   "Rules:\n" +
                   "- Always respond in French.\n" +
                   "- Be concise but informative.\n" +
                   "- Highlight risks (like lending to someone who has unpaid debts).\n" +
                   "- Point out the best bank based on the lowest interest rate from past loans.";
        } catch (Exception e) {
            return "You are an AI financial advisor. Answer in French.";
        }
    }
}
