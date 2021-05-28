package com.example.toy.controller;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Controller
//@RestController
//@ComponentScan("{com.example.toy.controller}") ->
public class BaseController {


    @GetMapping("/")
    public String home() {
        System.out.println("hello world");
        return "home.html";
    }

    @RequestMapping("/intro")
    public String introPage() {
        return "intro";
    }


}
