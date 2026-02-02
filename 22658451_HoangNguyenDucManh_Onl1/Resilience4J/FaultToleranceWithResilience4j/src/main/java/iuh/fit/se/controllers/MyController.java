package iuh.fit.se.controllers;

import io.github.resilience4j.bulkhead.annotation.Bulkhead;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class MyController {

    @Autowired
    private RestTemplate restTemplate;

    @GetMapping("/test-fault-tolerance")
    // Áp dụng đồng thời các cơ chế bảo vệ
    @CircuitBreaker(name = "serviceB", fallbackMethod = "handleFallback")
    @Retry(name = "serviceB")
    @RateLimiter(name = "serviceB")
    @Bulkhead(name = "serviceB")
    public String callNodeJs() {
        String url = "http://localhost:3000/api/data";
        return restTemplate.getForObject(url, String.class);
    }

    // Hàm dự phòng khi Service B bị lỗi hoặc hệ thống ngắt mạch
    public String handleFallback(Throwable t) {
        return "Hệ thống đang bảo trì hoặc quá tải. Vui lòng quay lại sau! (Chi tiết: " + t.getMessage() + ")";
    }
}
