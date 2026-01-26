import java.util.ArrayList;
import java.util.List;

// Observer
interface Observer {
    void update(String state);
}

// Subject
interface Subject {
    void attach(Observer o);
    void detach(Observer o);
    void notifyObservers();
}

// Concrete Subject


class Stock implements Subject {
    private List<Observer> observers = new ArrayList<>();
    private String price;

    public void setPrice(String price) {
        this.price = price;
        notifyObservers();
    }

    @Override
    public void attach(Observer o) {
        observers.add(o);
    }

    @Override
    public void detach(Observer o) {
        observers.remove(o);
    }

    @Override
    public void notifyObservers() {
        for (Observer o : observers) {
            o.update(price);
        }
    }
}

// Concrete Observer
class Investor implements Observer {
    private String name;

    public Investor(String name) {
        this.name = name;
    }

    @Override
    public void update(String state) {
        System.out.println(name + " received update: " + state);
    }
}

// Demo

public class Main {
    public static void main(String[] args) {
        Stock stock = new Stock();

        Investor a = new Investor("Alice");
        Investor b = new Investor("Bob");

        stock.attach(a);
        stock.attach(b);

        stock.setPrice("Price = 120$");
    }
}