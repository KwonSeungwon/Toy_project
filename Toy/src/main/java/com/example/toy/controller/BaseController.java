package com.example.toy.controller;


import ngineeus.lucia.webs.jpa.UEntities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import ngineeus.lucia.webs.payload.Payload;
import org.springframework.web.servlet.ModelAndView;

@Controller
//@RestController
//@ComponentScan("{com.example.toy.controller}") ->
public class BaseController {


//    @GetMapping("/")
//    public ModelAndView home(Payload payload) {
//        return payload.toModelAndView("home");
//    }
    @GetMapping("/")
    public ModelAndView main(Payload payload) {
        System.out.println("hhh");
        return payload.toModelAndView("home");
    }

    @GetMapping("/api/v1/move")
    public String movePage() {
        System.out.println("test");
        return "board";
    }

}
