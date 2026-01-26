package adapter;

public class XMLtoJSONAdapter implements DataAdapter {
    private XMLService xmlService;

    public XMLtoJSONAdapter(XMLService xmlService) {
        this.xmlService = xmlService;
    }

    @Override
    public String convert(String data) {
        return "{ \"task\": { \"status\": \"DONE\" } }";
    }
}
