package com.ufidesk.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.data.mongo.config.annotation.web.http.EnableMongoHttpSession;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Session configuration for MongoDB-backed HTTP sessions.
 * 
 * This configuration enables:
 * - MongoDB as session store
 * - 30-minute session timeout (configured in application.yml)
 * - Session cookies with HttpOnly, SameSite=Lax
 */
@Configuration
@EnableMongoHttpSession
public class SessionConfig {

	/**
	 * Configure CORS to allow frontend (React) to communicate with backend.
	 * 
	 * Settings are loaded from application.yml cors.* properties.
	 */
	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/api/**")
					.allowedOrigins("http://localhost:5173")
					.allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
					.allowedHeaders("*")
					.allowCredentials(true)
					.maxAge(3600);
			}
		};
	}
}
