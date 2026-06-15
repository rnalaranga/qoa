package src;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.Font;
import java.io.FileReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.swing.BorderFactory;
import javax.swing.JLabel;
import javax.swing.JProgressBar;
import javax.swing.JTable;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.DefaultTableModel;
import javax.swing.table.TableCellRenderer;
import org.snmp4j.CommunityTarget;
import org.snmp4j.PDU;
import org.snmp4j.Snmp;
import org.snmp4j.TransportMapping;
import org.snmp4j.event.ResponseEvent;
import org.snmp4j.mp.SnmpConstants;
import org.snmp4j.smi.OID;
import org.snmp4j.smi.OctetString;
import org.snmp4j.smi.UdpAddress;
import org.snmp4j.smi.VariableBinding;
import org.snmp4j.transport.DefaultUdpTransportMapping;

/**
 *
 * @author RR
 */
public class PrinterStatusMonitorMainClass {

    // --- NEW: API URL for the Node.js backend ---
    private static final String API_URL = "http://localhost:5000/api/printers/status";

    public void loadPrinters(DefaultTableModel model) {
        try {
            Gson gson = new Gson();
            FileReader reader = new FileReader("C:\\QOA\\printers.json");
            List<Printer> printers = gson.fromJson(
                    reader,
                    new TypeToken<List<Printer>>() {
                    }.getType()
            );

            for (Printer p : printers) {
                model.addRow(new Object[]{
                    p.qoanum,
                    p.ip,
                    p.model,});
            }
            reader.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void checkAllPrinters(DefaultTableModel model, JTable table) {
        // --- 1. TABLE SETTINGS ---
        table.setRowHeight(30);
        table.setIntercellSpacing(new Dimension(8, 2));

        // --- 2. RENDERER FOR TONER PROGRESS BAR (Column 3) ---
        class TonerRenderer extends JProgressBar implements TableCellRenderer {
            public TonerRenderer() {
                super(0, 100);
                setStringPainted(true);
                setBorder(BorderFactory.createEmptyBorder(5, 10, 5, 10));
                setBackground(new Color(0, 0, 0));
            }

            @Override
            public Component getTableCellRendererComponent(JTable tbl, Object value,
                    boolean isSelected, boolean hasFocus, int row, int column) {
                String valStr = (value != null) ? value.toString() : "";
                setFont(new Font("Montserrat SemiBold", Font.PLAIN, 12));

                if (valStr.equals("Insert Toner") || valStr.equals("Replace Toner")) {
                    DefaultTableCellRenderer label = new DefaultTableCellRenderer();
                    label.setHorizontalAlignment(JLabel.CENTER);
                    label.setText(valStr);
                    label.setForeground(Color.RED);
                    label.setFont(new Font("Montserrat SemiBold", Font.PLAIN, 12));
                    if (isSelected) {
                        label.setBackground(tbl.getSelectionBackground());
                    }
                    return label;
                }

                int percent = 0;
                try {
                    percent = Integer.parseInt(valStr.replace("%", "").trim());
                } catch (Exception e) {
                    percent = 0;
                }

                setValue(percent);
                setString(percent + "%");
                setForeground(Color.BLACK);

                if (percent <= 10) {
                    setForeground(new Color(220, 53, 69));
                } else if (percent <= 25) {
                    setForeground(new Color(255, 193, 7));
                } else {
                    setForeground(new Color(150, 150, 150));
                }

                if (isSelected) {
                    setOpaque(true);
                    setBackground(tbl.getSelectionBackground());
                } else {
                    setOpaque(false);
                }
                return this;
            }
        }

        // --- 3. GENERIC RENDERER (Columns 4, 5, 6) ---
        DefaultTableCellRenderer genericRenderer = new DefaultTableCellRenderer() {
            @Override
            public Component getTableCellRendererComponent(JTable tbl, Object value,
                    boolean isSelected, boolean hasFocus, int row, int column) {
                Component c = super.getTableCellRendererComponent(tbl, value, isSelected, hasFocus, row, column);
                setHorizontalAlignment(JLabel.CENTER);
                setFont(new Font("Montserrat SemiBold", Font.PLAIN, 14));
                String valStr = (value != null) ? value.toString() : "";

                // STICKY COLOR LOGIC
                if (valStr.equalsIgnoreCase("Warning") || valStr.contains("Warning")) {
                    c.setForeground(new Color(255, 193, 7)); // Yellow
                } else if (valStr.equalsIgnoreCase("Stopped") || valStr.equalsIgnoreCase("Offline")
                        || (column == 6 && !valStr.equalsIgnoreCase("ok") && !valStr.equals("-") && !valStr.isEmpty())) {
                    c.setForeground(Color.RED);
                } else {
                    c.setForeground(Color.WHITE);
                }
                return c;
            }
        };

        for (int i = 0; i < table.getColumnCount(); i++) {
            table.getColumnModel().getColumn(i).setCellRenderer(i == 3 ? new TonerRenderer() : genericRenderer);
        }

        // --- 4. SNMP DATA FETCHING ---
        for (int i = 0; i < model.getRowCount(); i++) {
            String qoaNum = model.getValueAt(i, 0).toString(); // Get QOA Num
            String ip = model.getValueAt(i, 1).toString();
            String modelName = model.getValueAt(i, 2).toString(); // Get Model

            String statusOID = "1.3.6.1.2.1.25.3.5.1.1.1";
            String pageOID = "1.3.6.1.2.1.43.10.2.1.4.1.1";
            String tonerLevelOID = "1.3.6.1.2.1.43.11.1.1.9.1.1";
            String tonerMaxOID = "1.3.6.1.2.1.43.11.1.1.8.1.1";
            String markerStatusOID = "1.3.6.1.2.1.43.10.2.1.5.1.1";
            String alertDescOID = "1.3.6.1.2.1.43.18.1.1.8.1.1";
            String alertIndexOID = "1.3.6.1.2.1.43.18.1.1.2.1.1"; 
            String coverBase = "1.3.6.1.2.1.43.6.1.1.3.1.";
            String tray1OID = "1.3.6.1.2.1.43.11.1.1.9.1.1"; 
            String tray2OID = "1.3.6.1.2.1.43.11.1.1.9.1.2";

            String snmpStatusRaw = snmpGet(ip, statusOID);
            if (snmpStatusRaw == null || "No Response".equals(snmpStatusRaw)) {
                model.setValueAt("0%", i, 3);
                model.setValueAt("-", i, 4);
                model.setValueAt("Offline", i, 5);
                model.setValueAt("No Connection", i, 6);
                
                // --- NEW: Send Offline Data to API ---
                sendDataToApi(qoaNum, ip, modelName, "0%", "-", "Offline", "No Connection", "Offline");
                continue;
            }

            StringBuilder alerts = new StringBuilder();
            String mStatus = snmpGet(ip, markerStatusOID);

            // CHECK TRAYS
            boolean tray1Empty = "0".equals(snmpGet(ip, tray1OID));
            boolean tray2Empty = "0".equals(snmpGet(ip, tray2OID));

            // CHECK ALERT TABLE
            String currentAlert = snmpGet(ip, alertDescOID);
            String alertIndex = snmpGet(ip, alertIndexOID); 

            if (currentAlert != null && !currentAlert.isEmpty() && !currentAlert.equalsIgnoreCase("null")
                    && !currentAlert.toLowerCase().contains("nosuchinstance") && !currentAlert.toLowerCase().contains("no such instance")) {
                
                if (currentAlert.equalsIgnoreCase("Fatal Error")) {
                    switch (alertIndex) {
                        case "1": alerts.append("C130-160 Tray Error "); break;
                        case "2": alerts.append("C410 Heater Error "); break;
                        case "3": alerts.append("C440-449 Fuser Error "); break;
                        case "4": alerts.append("C260-280 Lens/Scan Error "); break;
                        case "5": alerts.append("C550-580 ADF/Finisher "); break;
                        case "6": alerts.append("C970 High Voltage "); break;
                        case "198": alerts.append("C6 System Error "); break;
                        default: alerts.append("Service Call ").append(alertIndex).append(" "); break;
                    }
                } else {
                    alerts.append(currentAlert).append(" ");
                }
            }

            if ("6".equals(mStatus) && alerts.length() == 0) {
                alerts.append("Paper Jam ");
            }
            if (!"4".equals(snmpGet(ip, coverBase + "1"))) {
                alerts.append("Front Cover Open ");
            }
            if (!"4".equals(snmpGet(ip, coverBase + "2"))) {
                alerts.append("ADU Cover Open ");
            }
            if (!"4".equals(snmpGet(ip, coverBase + "6"))) {
                alerts.append("Side Cover Open ");
            }

            String finalAlert = alerts.toString().trim();
            String errorStatusText = finalAlert.isEmpty() ? "OK" : finalAlert;

            if ((tray1Empty ^ tray2Empty) && finalAlert.toLowerCase().contains("paper empty")) {
                errorStatusText = finalAlert + " Warning";
            }
            model.setValueAt(errorStatusText, i, 6);

            // --- TONER LOGIC ---
            String tonerDisplay = "";
            try {
                String rawLevel = snmpGet(ip, tonerLevelOID);
                String rawMax = snmpGet(ip, tonerMaxOID);
                if (rawLevel == null || rawLevel.equals("-2") || rawLevel.isEmpty() || rawLevel.toLowerCase().contains("no such")) {
                    tonerDisplay = "Insert Toner";
                } else {
                    int level = Integer.parseInt(rawLevel);
                    int max = Integer.parseInt(rawMax);
                    int pct = (max > 0) ? (level * 100) / max : 0;
                    tonerDisplay = (pct <= 0 ? "Replace Toner" : pct + "%");
                }
            } catch (Exception e) {
                tonerDisplay = "Insert Toner";
            }
            model.setValueAt(tonerDisplay, i, 3);

            // --- DETERMINE COLUMN 5 (PRINTER STATUS) FINAL VALUE ---
            String finalStatusText;

            boolean isStopped = (tray1Empty && tray2Empty)
                    || !"4".equals(snmpGet(ip, coverBase + "1"))
                    || !"4".equals(snmpGet(ip, coverBase + "2"))
                    || !"4".equals(snmpGet(ip, coverBase + "6"))
                    || tonerDisplay.contains("Toner") || "6".equals(mStatus)
                    || (finalAlert.contains("C") && finalAlert.contains("Error"));

            if (isStopped) {
                finalStatusText = "Stopped";
            } else if (tray1Empty ^ tray2Empty) {
                finalStatusText = "Warning";
            } else {
                finalStatusText = decodeStatus(snmpStatusRaw);
            }

            model.setValueAt(finalStatusText, i, 5);
            
            String pagesPrinted = snmpGet(ip, pageOID);
            model.setValueAt(pagesPrinted, i, 4);
            
            // --- NEW: Send Data to API ---
            // Assume online status is Online if snmpResponse was not No Response
            sendDataToApi(qoaNum, ip, modelName, tonerDisplay, pagesPrinted, finalStatusText, errorStatusText, "Online");
        }
    }

    // --- NEW METHOD: SEND DATA TO API ---
    private void sendDataToApi(String qoaNum, String ip, String model, String tonerLevel, String pagesPrinted, String printerStatus, String errorStatus, String onlineStatus) {
        new Thread(() -> {
            try {
                URL url = new URL(API_URL);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json; utf-8");
                conn.setRequestProperty("Accept", "application/json");
                conn.setDoOutput(true);

                // Create JSON object using Map and Gson
                Map<String, String> data = new HashMap<>();
                data.put("qoa_num", qoaNum);
                data.put("ip_address", ip);
                data.put("model", model);
                data.put("toner_level", tonerLevel);
                data.put("pages_printed", pagesPrinted);
                data.put("printer_status", printerStatus);
                data.put("error_status", errorStatus);
                data.put("online_status", onlineStatus);

                Gson gson = new Gson();
                String jsonInputString = gson.toJson(data);

                try (OutputStream os = conn.getOutputStream()) {
                    byte[] input = jsonInputString.getBytes(StandardCharsets.UTF_8);
                    os.write(input, 0, input.length);
                }

                int code = conn.getResponseCode();
                if (code != 200) {
                    System.err.println("Failed to send data to API for IP " + ip + ". HTTP Code: " + code);
                }

            } catch (Exception e) {
                System.err.println("API Connection Error for IP " + ip + ": " + e.getMessage());
            }
        }).start(); // Run in a separate thread so it doesn't freeze the GUI
    }

    public String decodeStatus(String s) {
        if (s == null) {
            return "Offline";
        }
        switch (s) {
            case "3": return "Ready";
            case "4": return "Printing";
            case "5": return "Warmup";
            case "2": 
            case "1": return "Sleep";
            default: return "Unknown";
        }
    }

    private boolean isBitSet(String hex, int bitIndex) {
        try {
            int val = Integer.parseInt(hex.replace(" ", ""), 16);
            return (val & (1 << bitIndex)) != 0;
        } catch (Exception e) {
            return false;
        }
    }

    private String snmpGet(String ip, String oid) {
        String result = "No Response";
        try {
            TransportMapping transport = new DefaultUdpTransportMapping();
            transport.listen();

            CommunityTarget target = new CommunityTarget();
            target.setCommunity(new OctetString("public"));
            target.setAddress(new UdpAddress(ip + "/161"));
            target.setRetries(0);
            target.setTimeout(5000);
            target.setVersion(SnmpConstants.version2c);

            Snmp snmp = new Snmp(transport);
            PDU pdu = new PDU();
            pdu.add(new VariableBinding(new OID(oid)));
            pdu.setType(PDU.GET);

            ResponseEvent event = snmp.send(pdu, target);

            if (event != null && event.getResponse() != null) {
                result = event.getResponse().get(0).getVariable().toString();
            }
            snmp.close();
        } catch (Exception e) {
        }
        return result;
    }

    public void checkPrinterStatus(DefaultTableModel model, JTable table, int column, int ipcolumn) {
        try {
            for (int i = 0; i < model.getRowCount(); i++) {
                String ip = model.getValueAt(i, ipcolumn).toString();
                InetAddress address = InetAddress.getByName(ip);
                boolean reachable = address.isReachable(3000);

                if (reachable) {
                    model.setValueAt("Online", i, column);
                } else {
                    model.setValueAt("Offline", i, column);
                }
            }

            table.getColumnModel().getColumn(column).setCellRenderer(new javax.swing.table.DefaultTableCellRenderer() {
                @Override
                public java.awt.Component getTableCellRendererComponent(
                        javax.swing.JTable table, Object value, boolean isSelected,
                        boolean hasFocus, int row, int column) {
                    java.awt.Component c = super.getTableCellRendererComponent(
                            table, value, isSelected, hasFocus, row, column);

                    if (value != null && value.toString().equals("Online")) {
                        c.setForeground(java.awt.Color.GREEN);
                    } else {
                        c.setForeground(java.awt.Color.RED);
                    }
                    return c;
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
