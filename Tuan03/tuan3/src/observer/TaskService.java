package observer;

public class TaskService extends Subject {
    private String status;

    public void updateStatus(String status) {
        this.status = status;
        notifyObservers("Task status changed to: " + status);
    }
}

