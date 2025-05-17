package com.example.groupapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class GroupappApplication {

	public static void main(String[] args) {
		SpringApplication.run(GroupappApplication.class, args);
	}

}
