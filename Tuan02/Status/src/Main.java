// ===== STATE PATTERN =====
interface OrderState {
    void handle(Order order);
    String getStatus();
}

class NewOrderState implements OrderState {
    @Override
    public void handle(Order order) {
        System.out.println("Checking order information...");
    }

    @Override
    public String getStatus() {
        return "NEW";
    }
}

class ProcessingState implements OrderState {
    @Override
    public void handle(Order order) {
        System.out.println("Packing and shipping the order...");
    }

    @Override
    public String getStatus() {
        return "PROCESSING";
    }
}

class DeliveredState implements OrderState {
    @Override
    public void handle(Order order) {
        System.out.println("Order delivered successfully!");
    }

    @Override
    public String getStatus() {
        return "DELIVERED";
    }
}

class CancelledState implements OrderState {
    @Override
    public void handle(Order order) {
        System.out.println("Order cancelled. Processing refund...");
        order.setPaymentStrategy(new RefundPayment());
        order.processPayment(100);
    }

    @Override
    public String getStatus() {
        return "CANCELLED";
    }
}

// ===== STRATEGY PATTERN =====
interface PaymentStrategy {
    void pay(double amount);
}

class NormalPayment implements PaymentStrategy {
    @Override
    public void pay(double amount) {
        System.out.println("Processing payment: $" + amount);
    }
}

class RefundPayment implements PaymentStrategy {
    @Override
    public void pay(double amount) {
        System.out.println("Refunding amount: $" + amount);
    }
}

// ===== CONTEXT =====
class Order {
    private OrderState state;
    private PaymentStrategy paymentStrategy;

    public Order() {
        this.state = new NewOrderState();
        this.paymentStrategy = new NormalPayment();
    }

    public void setState(OrderState state) {
        this.state = state;
    }

    public void processOrder() {
        System.out.println("Current State: " + state.getStatus());
        state.handle(this);
    }

    public void setPaymentStrategy(PaymentStrategy paymentStrategy) {
        this.paymentStrategy = paymentStrategy;
    }

    public void processPayment(double amount) {
        paymentStrategy.pay(amount);
    }
}

// ===== DECORATOR PATTERN =====
interface OrderService {
    String getDescription();
    double getCost();
}

class BasicOrder implements OrderService {
    @Override
    public String getDescription() {
        return "Basic Order";
    }

    @Override
    public double getCost() {
        return 100;
    }
}

abstract class OrderDecorator implements OrderService {
    protected OrderService order;

    public OrderDecorator(OrderService order) {
        this.order = order;
    }
}

class GiftWrap extends OrderDecorator {
    public GiftWrap(OrderService order) {
        super(order);
    }

    @Override
    public String getDescription() {
        return order.getDescription() + " + Gift Wrap";
    }

    @Override
    public double getCost() {
        return order.getCost() + 10;
    }
}

class ExpressDelivery extends OrderDecorator {
    public ExpressDelivery(OrderService order) {
        super(order);
    }

    @Override
    public String getDescription() {
        return order.getDescription() + " + Express Delivery";
    }

    @Override
    public double getCost() {
        return order.getCost() + 20;
    }
}

// ===== MAIN =====
public class Main {
    public static void main(String[] args) {

        System.out.println("=== STATE + STRATEGY DEMO ===");
        Order order = new Order();

        order.processOrder(); // NEW

        order.setState(new ProcessingState());
        order.processOrder(); // PROCESSING

        order.setState(new DeliveredState());
        order.processOrder(); // DELIVERED

        order.setState(new CancelledState());
        order.processOrder(); // CANCELLED + REFUND

        System.out.println("\n=== DECORATOR DEMO ===");
        OrderService myOrder = new BasicOrder();
        myOrder = new GiftWrap(myOrder);
        myOrder = new ExpressDelivery(myOrder);

        System.out.println("Order Description: " + myOrder.getDescription());
        System.out.println("Total Cost: $" + myOrder.getCost());
    }
}
