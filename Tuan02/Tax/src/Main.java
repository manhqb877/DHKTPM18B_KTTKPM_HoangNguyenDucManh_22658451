// ========== STATE PATTERN ==========
interface ProductState {
    double applyState(double basePrice);
    String getStateName();
}

class NormalState implements ProductState {
    @Override
    public double applyState(double basePrice) {
        return basePrice; // không thay đổi
    }

    @Override
    public String getStateName() {
        return "NORMAL";
    }
}

class LuxuryState implements ProductState {
    @Override
    public double applyState(double basePrice) {
        return basePrice * 1.10; // tăng 10% giá cơ bản trước khi tính thuế
    }

    @Override
    public String getStateName() {
        return "LUXURY";
    }
}

class ExemptState implements ProductState {
    @Override
    public double applyState(double basePrice) {
        return 0; // miễn thuế hoàn toàn
    }

    @Override
    public String getStateName() {
        return "EXEMPT";
    }
}

// ========== STRATEGY PATTERN ==========
interface TaxStrategy {
    double calculateTax(double price);
    String getTaxName();
}

class VATTax implements TaxStrategy {
    @Override
    public double calculateTax(double price) {
        return price * 0.10; // 10% VAT
    }

    @Override
    public String getTaxName() {
        return "VAT (10%)";
    }
}

class ExciseTax implements TaxStrategy {
    @Override
    public double calculateTax(double price) {
        return price * 0.05; // 5% tiêu thụ đặc biệt
    }

    @Override
    public String getTaxName() {
        return "Excise Tax (5%)";
    }
}

class LuxuryTax implements TaxStrategy {
    @Override
    public double calculateTax(double price) {
        return price * 0.15; // 15% xa xỉ
    }

    @Override
    public String getTaxName() {
        return "Luxury Tax (15%)";
    }
}

// ========== CONTEXT (SẢN PHẨM) ==========
class Product {
    private String name;
    private double basePrice;
    private ProductState state;

    public Product(String name, double basePrice) {
        this.name = name;
        this.basePrice = basePrice;
        this.state = new NormalState();
    }

    public void setState(ProductState state) {
        this.state = state;
    }

    public double getPriceAfterState() {
        return state.applyState(basePrice);
    }

    public String getName() {
        return name;
    }

    public String getStateName() {
        return state.getStateName();
    }
}

// ========== DECORATOR PATTERN ==========
interface TaxCalculator {
    double getTotalTax();
    String getDescription();
}

class BaseTax implements TaxCalculator {
    private double price;

    public BaseTax(double price) {
        this.price = price;
    }

    @Override
    public double getTotalTax() {
        return 0; // chưa có thuế
    }

    @Override
    public String getDescription() {
        return "Base Price: $" + price;
    }
}

abstract class TaxDecorator implements TaxCalculator {
    protected TaxCalculator taxCalculator;
    protected double price;

    public TaxDecorator(TaxCalculator taxCalculator, double price) {
        this.taxCalculator = taxCalculator;
        this.price = price;
    }
}

class VATDecorator extends TaxDecorator {
    private TaxStrategy vat = new VATTax();

    public VATDecorator(TaxCalculator taxCalculator, double price) {
        super(taxCalculator, price);
    }

    @Override
    public double getTotalTax() {
        return taxCalculator.getTotalTax() + vat.calculateTax(price);
    }

    @Override
    public String getDescription() {
        return taxCalculator.getDescription() + " + " + vat.getTaxName();
    }
}

class ExciseDecorator extends TaxDecorator {
    private TaxStrategy excise = new ExciseTax();

    public ExciseDecorator(TaxCalculator taxCalculator, double price) {
        super(taxCalculator, price);
    }

    @Override
    public double getTotalTax() {
        return taxCalculator.getTotalTax() + excise.calculateTax(price);
    }

    @Override
    public String getDescription() {
        return taxCalculator.getDescription() + " + " + excise.getTaxName();
    }
}

class LuxuryDecorator extends TaxDecorator {
    private TaxStrategy luxury = new LuxuryTax();

    public LuxuryDecorator(TaxCalculator taxCalculator, double price) {
        super(taxCalculator, price);
    }

    @Override
    public double getTotalTax() {
        return taxCalculator.getTotalTax() + luxury.calculateTax(price);
    }

    @Override
    public String getDescription() {
        return taxCalculator.getDescription() + " + " + luxury.getTaxName();
    }
}

// ========== MAIN DEMO ==========
public class Main {
    public static void main(String[] args) {

        System.out.println("=== TAX CALCULATION DEMO ===");

        Product phone = new Product("Smartphone", 1000);
        phone.setState(new LuxuryState()); // sản phẩm xa xỉ

        double priceAfterState = phone.getPriceAfterState();
        System.out.println("Product: " + phone.getName());
        System.out.println("State: " + phone.getStateName());
        System.out.println("Price after state adjustment: $" + priceAfterState);

        // Áp dụng nhiều loại thuế bằng Decorator
        TaxCalculator tax = new BaseTax(priceAfterState);
        tax = new VATDecorator(tax, priceAfterState);
        tax = new ExciseDecorator(tax, priceAfterState);
        tax = new LuxuryDecorator(tax, priceAfterState);

        System.out.println("Applied Taxes: " + tax.getDescription());
        System.out.println("Total Tax: $" + tax.getTotalTax());
        System.out.println("Final Price: $" + (priceAfterState + tax.getTotalTax()));
    }
}
