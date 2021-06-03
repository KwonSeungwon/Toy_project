package com.example.toy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan({"ngineeus.lucia.webs.payload"})
public class ToyApplication {

    public static void main(String[] args) {

        SpringApplication.run(ToyApplication.class, args);
    }
}
