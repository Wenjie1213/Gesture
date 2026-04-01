class SerialManager {
  constructor() {
    this.port = null;
    this.writer = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.encoder = new TextEncoder();
  }

  async autoReconnectIfPossible() {
    if (!('serial' in navigator)) return false;

    try {
      const ports = await navigator.serial.getPorts();
      if (!ports.length) return false;

      this.port = ports[0];
      await this.port.open({ baudRate: 9600 });
      this.writer = this.port.writable.getWriter();
      this.isConnected = true;
      this._bindDisconnect();
      console.log('[Serial] Reconnected to previously authorized port');
      return true;
    } catch (err) {
      console.warn('[Serial] Auto reconnect failed:', err);
      await this.cleanup();
      return false;
    }
  }

  async requestAndConnect() {
    if (!('serial' in navigator)) {
      throw new Error('Web Serial API is not supported in this browser.');
    }

    if (this.isConnected && this.port && this.writer) return true;
    if (this.isConnecting) return false;

    this.isConnecting = true;
    try {
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 9600 });
      this.writer = this.port.writable.getWriter();
      this.isConnected = true;
      this._bindDisconnect();
      console.log('[Serial] Connected');
      return true;
    } finally {
      this.isConnecting = false;
    }
  }

  _bindDisconnect() {
    if (!this.port) return;

    this.port.ondisconnect = async () => {
      console.warn('[Serial] Port disconnected');
      await this.cleanup();
    };
  }

  async writeText(text) {
    if (!this.isConnected || !this.writer) {
      throw new Error('Serial not connected');
    }
    await this.writer.write(this.encoder.encode(text));
  }

  async sendGesture(gesture) {
    const map = {
      v_sign: 'V',
      thumbs_up: '1',
      three_finger_salute: '2',
      shocker: '3',
      serbian_salute: '4',
      open_palm_with_fingers_spread: '5',
      ok: '6',
      middle_finger: '7',
      little_finger: '8',
      raise_index_finger: '9',
      horns: 'a',
      six_hand: 'b',
      curled_finger:'c',
      curled_finger_down: 'c'
    };

    const cmd = map[gesture];
    if (!cmd) {
      console.warn('[Serial] No command mapping for gesture:', gesture);
      return;
    }

    await this.writeText(cmd);
    console.log('[Serial] Sent:', gesture, '->', cmd);
  }

  async resetHand() {
    if (!this.isConnected) return;
    await this.writeText('h');
    console.log('[Serial] Sent reset -> h');
  }

  async cleanup() {
    try {
      if (this.writer) {
        this.writer.releaseLock();
        this.writer = null;
      }
    } catch (_) {}

    try {
      if (this.port) {
        await this.port.close();
      }
    } catch (_) {}

    this.port = null;
    this.isConnected = false;
    this.isConnecting = false;
  }
}

window.serialManager = new SerialManager();