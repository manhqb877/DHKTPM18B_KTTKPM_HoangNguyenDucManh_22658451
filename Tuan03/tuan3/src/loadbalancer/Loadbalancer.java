package loadbalancer;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public class Loadbalancer {
    private List<Server> servers;
    private AtomicInteger index = new AtomicInteger(0);

    public Loadbalancer(List<Server> servers) {
        this.servers = servers;
    }

    public Server nextServer() {
        return servers.get(index.getAndIncrement() % servers.size());
    }
}
