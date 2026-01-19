// ========== STATE PATTERN ==========
interface PaymentState {
    void handle(Payment payment);
    String getStatus();
}

class PendingState implements PaymentState {
    @Override
    public void handle(Payment payment) {
        System.out.println("Payment is pending... waiting for processing.");
    }

    @Override
    public String getStatus() {
        return "PENDING";
    }
}

class ProcessingState implements PaymentState {
    @Override
    public void handle(Payment payment) {
        System.out.println("Processing payment via " + payment.getMethodName() + "...");
        payment.executePayment();
    }

    @Override
    public String getStatus() {
        return "PROCESSING";
    }
}

class SuccessState implements PaymentState {
    @Override
    public void handle(Payment payment) {
        System.out.println("Payment successful!");
    }

    @Override
    public String getStatus() {
        return "SUCCESS";
    }
}

class FailedState implements PaymentState {
    @Override
    public void handle(Payment payment) {
        System.out.println("Payment failed. Please try again.");
    }

    @Override
    public String getStatus() {
        return "FAILED";
    }
}

// ========== STRATEGY PATTERN ==========
interface PaymentStrategy {
    boolean pay(double amount);
    String getName();
}

class CreditCardPayment implements PaymentStrategy {
    @Override
    public boolean pay(double amount) {
        System.out.println("Paying $" + amount + " using Credit Card.");
        return true;
    }

    @Override
    public String getName() {
        return "Credit Card";
    }
}

class PayPalPayment implements PaymentStrategy {
    @Override
    public boolean pay(double amount) {
        System.out.println("Paying $" + amount + " using PayPal.");
        return true;
    }

    @Override
    public String getName() {
        return "PayPal";
    }
}

// ========== CONTEXT (PAYMENT) ==========
class Payment {
    private PaymentState state;
    private PaymentStrategy strategy;
    private double amount;

    public Payment(double amount, PaymentStrategy strategy) {
        this.amount = amount;
        this.strategy = strategy;
        this.state = new PendingState();
    }

    public void setState(PaymentState state) {
        this.state = state;
    }

    public String getMethodName() {
        return strategy.getName();
    }

    public void process() {
        System.out.println("Current State: " + state.getStatus());
        state.handle(this);
    }

    public void executePayment() {
        boolean result = strategy.pay(amount);
        if (result) {
            setState(new SuccessState());
        } else {
            setState(new FailedState());
        }
        process();
    }

    public double getAmount() {
        return amount;
    }
}

// ========== DECORATOR PATTERN ==========
interface PaymentService {
    double getFinalAmount();
    String getDescription();
}

class BasicPayment implements PaymentService {
    private double amount;

    public BasicPayment(double amount) {
        this.amount = amount;
    }

    @Override
    public double getFinalAmount() {
        return amount;
    }

    @Override
    public String getDescription() {
        return "Base Amount: $" + amount;
    }
}

abstract class PaymentDecorator implements PaymentService {
    protected PaymentService paymentService;

    public PaymentDecorator(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}

class ProcessingFeeDecorator extends PaymentDecorator {
    public ProcessingFeeDecorator(PaymentService paymentService) {
        super(paymentService);
    }

    @Override
    public double getFinalAmount() {
        return paymentService.getFinalAmount() + 10; // phí xử lý $10
    }

    @Override
    public String getDescription() {
        return paymentService.getDescription() + " + Processing Fee ($10)";
    }
}

class DiscountDecorator extends PaymentDecorator {
    public DiscountDecorator(PaymentService paymentService) {
        super(paymentService);
    }

    @Override
    public double getFinalAmount() {
        return paymentService.getFinalAmount() * 0.9; // giảm 10%
    }

    @Override
    public String getDescription() {
        return paymentService.getDescription() + " + Discount (10%)";
    }
}

// ========== MAIN DEMO ==========
public class Main {
    public static void main(String[] args) {

        System.out.println("=== PAYMENT SYSTEM DEMO ===");

        // Áp dụng Decorator: thêm phí + giảm giá
        PaymentService paymentService = new BasicPayment(100);
        paymentService = new ProcessingFeeDecorator(paymentService);
        paymentService = new DiscountDecorator(paymentService);

        double finalAmount = paymentService.getFinalAmount();
        System.out.println("Payment Details: " + paymentService.getDescription());
        System.out.println("Final Amount: $" + finalAmount);

        // Tạo thanh toán với Strategy (Credit Card)
        Payment payment = new Payment(finalAmount, new CreditCardPayment());

        payment.process(); // PENDING
        payment.setState(new ProcessingState());
        payment.process(); // PROCESSING -> SUCCESS
    }
}
