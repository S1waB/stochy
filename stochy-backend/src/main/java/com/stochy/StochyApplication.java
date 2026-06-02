package com.stochy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class StochyApplication {

    public static void main(String[] args) {
        SpringApplication.run(StochyApplication.class, args);
    }
}
