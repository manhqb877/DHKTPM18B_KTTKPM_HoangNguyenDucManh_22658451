// Target
interface JsonService {
    void processJson(String jsonData);
}

// Adaptee
class XmlSystem {
    public void processXml(String xmlData) {
        System.out.println("Processing XML: " + xmlData);
    }
}

// Adapter
class XmlToJsonAdapter implements JsonService {
    private XmlSystem xmlSystem;

    public XmlToJsonAdapter(XmlSystem xmlSystem) {
        this.xmlSystem = xmlSystem;
    }

    @Override
    public void processJson(String jsonData) {
        String xml = "<xml>" + jsonData + "</xml>";
        xmlSystem.processXml(xml);
    }
}

// Demo

public class Main {
    public static void main(String[] args) {
        JsonService service =
                new XmlToJsonAdapter(new XmlSystem());

        service.processJson("{\"name\":\"ChatGPT\"}");
    }
}