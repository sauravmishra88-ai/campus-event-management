
package com.campus.eventmanagement.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class RoleTestController {

    @GetMapping("/admin/test")
    public String adminTest() {
        return "Admin access granted";
    }

    @GetMapping("/manager/test")
    public String managerTest() {
        return "Manager access granted";
    }

    @GetMapping("/student/test")
    public String studentTest() {
        return "Student access granted";
    }
}

