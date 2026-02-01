package com.ufidesk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main application class for UfiDesk Backend.
 * <p>
 * This application provides RESTful API services for the UfiDesk hot desk booking system,
 * including user management, desk/floorplan management, and booking functionality.
 */
@SpringBootApplication
public class UfiDeskApplication {

	public static void main(String[] args) {
		SpringApplication.run(UfiDeskApplication.class, args);
	}

}
