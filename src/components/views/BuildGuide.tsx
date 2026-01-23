import { Copy, Terminal, CheckCircle, Cpu, Wifi, Book, AlertCircle } from 'lucide-react';
import { useToast, InfoBlock } from '../ui';

export const BuildGuide = () => {
    const { showToast } = useToast();

    const CodeBlock = ({ label, code, step }: { label: string; code: string; step: number }) => {
        const copyToClipboard = () => {
            navigator.clipboard.writeText(code);
            showToast('Copied to clipboard!', 'success');
        };

        return (
            <div style={{ marginBottom: '20px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-default)', background: '#1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#0f172a', borderBottom: '1px solid #334155' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: 'var(--primary)', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>{step}</span>
                        <Terminal size={14} />
                        {label}
                    </span>
                    <button onClick={copyToClipboard} style={{ background: '#334155', border: 'none', cursor: 'pointer', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px', borderRadius: '6px' }}>
                        <Copy size={14} /> Copy
                    </button>
                </div>
                <pre style={{ margin: 0, padding: '16px', color: '#e2e8f0', overflowX: 'auto', fontFamily: 'ui-monospace, monospace', fontSize: '0.85rem', lineHeight: 1.6 }}>{code}</pre>
            </div>
        );
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <InfoBlock icon={<Book size={20} />} title="Hardware & Software Guide" description="Step-by-step instructions to build the BNE Kit MVP. Copy commands directly to your terminal." variant="info" />

            {/* Quick Reference Notice */}
            <div className="alert alert-warning" style={{ marginTop: '20px' }}>
                <AlertCircle size={20} color="#92400e" />
                <div>
                    <div className="alert-title">Quick Reference</div>
                    <div className="alert-description">This is a command cheatsheet. Refer to the full PDF documentation for hardware wiring and assembly.</div>
                </div>
            </div>

            {/* Hardware Checklist */}
            <div className="glass-card" style={{ marginTop: '20px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}><Cpu size={18} color="var(--primary)" /> Hardware Checklist</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {['Raspberry Pi Zero 2 W', 'microSD Card (16GB+)', 'Power Supply (5V/3A)', 'DHT22 Temperature Sensor', 'Jumper Wires (3x)', 'MicroUSB Cable'].map(item => (
                        <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                            <CheckCircle size={16} color="var(--primary)" />
                            <span style={{ fontSize: '0.9rem' }}>{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Commands */}
            <div style={{ marginTop: '24px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}><Terminal size={18} color="var(--primary)" /> Terminal Commands</h3>

                <CodeBlock step={1} label="Install Dependencies" code={`sudo apt update && sudo apt upgrade -y
sudo apt install hostapd dnsmasq python3-pip python3-flask -y
pip3 install adafruit-circuitpython-dht
sudo systemctl stop hostapd
sudo systemctl stop dnsmasq`} />

                <CodeBlock step={2} label="Configure Hostapd (/etc/hostapd/hostapd.conf)" code={`interface=wlan0
driver=nl80211
ssid=GreenKit_Demo
hw_mode=g
channel=7
wpa=2
wpa_passphrase=greentech2026
wpa_key_mgmt=WPA-PSK`} />

                <CodeBlock step={3} label="Configure Dnsmasq (/etc/dnsmasq.conf)" code={`interface=wlan0
dhcp-range=192.168.4.10,192.168.4.50,255.255.255.0,24h
address=/#/192.168.4.1
# Spoof Apple Captive Portal
address=/captive.apple.com/192.168.4.1`} />

                <CodeBlock step={4} label="Configure Static IP (/etc/dhcpcd.conf)" code={`interface wlan0
static ip_address=192.168.4.1/24
nohook wpa_supplicant`} />

                <CodeBlock step={5} label="Enable Services & Reboot" code={`sudo systemctl unmask hostapd
sudo systemctl enable hostapd
sudo systemctl enable dnsmasq
sudo reboot`} />
            </div>

            {/* WiFi Info */}
            <div className="glass-card" style={{ marginTop: '24px', background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: 'white' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'white' }}><Wifi size={18} /> Demo WiFi Credentials</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div><div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Network Name (SSID)</div><div style={{ fontWeight: 700, fontSize: '1.1rem' }}>GreenKit_Demo</div></div>
                    <div><div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Password</div><div style={{ fontWeight: 700, fontSize: '1.1rem' }}>greentech2026</div></div>
                    <div><div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Dashboard URL</div><div style={{ fontWeight: 700, fontSize: '1.1rem' }}>http://192.168.4.1</div></div>
                </div>
            </div>
        </div>
    );
};
