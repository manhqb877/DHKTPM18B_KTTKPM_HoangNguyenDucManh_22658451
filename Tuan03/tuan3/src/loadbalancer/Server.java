package loadbalancer;

public class Server {
    private String name;

    public Server(String name) {
        this.name = name;
    }

    public void handleRequest() {
        System.out.println("Handling request on " + name);
    }
}

