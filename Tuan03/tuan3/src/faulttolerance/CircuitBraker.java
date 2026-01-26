package faulttolerance;

public class CircuitBraker {
    private boolean open = false;

    public void call(Runnable task) {
        if (open) {
            System.out.println("Circuit is open!");
            return;
        }
        try {
            task.run();
        } catch (Exception e) {
            open = true;
        }
    }
}
