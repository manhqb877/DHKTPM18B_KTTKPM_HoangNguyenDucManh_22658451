package faulttolerance;

public class RetryPolicy {
    public static void execute(Runnable task, int retries) {
        for (int i = 0; i < retries; i++) {
            try {
                task.run();
                return;
            } catch (Exception e) {
                System.out.println("Retry " + (i + 1));
            }
        }
    }
}
