package com.example.toy.controller;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class BaseController {


    @GetMapping("/")
    public String home() {
        return "Hello";
    }


}
