import adapter.DataAdapter;
import adapter.XMLService;
import adapter.XMLtoJSONAdapter;
import faulttolerance.CircuitBraker;
import faulttolerance.RetryPolicy;
import loadbalancer.Loadbalancer;
import loadbalancer.Server;
import observer.EmailNotifier;
import observer.TaskService;
import security.EncryptionUtil;

import java.util.Arrays;

public class Main {
    public static void main(String[] args) {

        // ===== Observer Pattern =====
        TaskService taskService = new TaskService();
        taskService.attach(new EmailNotifier());

        // ===== Adapter Pattern =====
        XMLService xmlService = new XMLService();
        DataAdapter adapter = new XMLtoJSONAdapter(xmlService);

        // ===== Load Balancer =====
        Server s1 = new Server("Server-A");
        Server s2 = new Server("Server-B");
        Loadbalancer lb = new Loadbalancer(Arrays.asList(s1, s2));

        // ===== Fault Tolerance =====
        CircuitBraker cb = new CircuitBraker();

        RetryPolicy.execute(() -> {
            cb.call(() -> {
                Server server = lb.nextServer();
                server.handleRequest();

                // Task thay đổi trạng thái → Observer chạy
                taskService.updateStatus("IN_PROGRESS");

                // Adapter chuyển dữ liệu
                String json = adapter.convert(xmlService.readXML());
                System.out.println("Converted data: " + json);

                // Security
                String encrypted = EncryptionUtil.encrypt(json);
                System.out.println("Encrypted data: " + encrypted);
            });
        }, 3);
    }
}
