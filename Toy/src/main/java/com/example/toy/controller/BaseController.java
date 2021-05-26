package com.example.toy.controller;


import org.springframework.context.annotation.ComponentScan;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@ComponentScan("{com.example.toy.controller}")
public class BaseController {


    @GetMapping("/")
    public String home() {
        return "/intro.html";
    }

    @GetMapping("/intro")
    public String introPage() {
        return "intro";
    }


}
