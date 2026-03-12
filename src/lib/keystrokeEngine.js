export class KeystrokeEngine {
  constructor() {
    this.events = [];
    this.isRecording = false;
    this.startTime = null;
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.targetElement = null;
  }

  start() {
    this.events = [];
    this.isRecording = true;
    this.startTime = performance.now();
  }

  stop() {
    this.isRecording = false;
    return [...this.events];
  }

  attachTo(element) {
    if (this.targetElement) {
      this.detach();
    }
    this.targetElement = element;
    this.targetElement.addEventListener('keydown', this.handleKeyDown);
    this.targetElement.addEventListener('keyup', this.handleKeyUp);
  }

  detach() {
    if (this.targetElement) {
      this.targetElement.removeEventListener('keydown', this.handleKeyDown);
      this.targetElement.removeEventListener('keyup', this.handleKeyUp);
      this.targetElement = null;
    }
  }

  handleKeyDown(e) {
    if (!this.isRecording) return;
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') {
      this.events.push({
        key: e.key,
        type: 'keydown',
        timestamp: performance.now()
      });
    }
  }

  handleKeyUp(e) {
    if (!this.isRecording) return;
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') {
      this.events.push({
        key: e.key,
        type: 'keyup',
        timestamp: performance.now()
      });
    }
  }

  extractFeatures(events) {
    if (!events || events.length < 4) {
      return {
        dwell_times: [], flight_times: [], total_duration: 0,
        typing_speed: 0, rhythm_score: 0, bigram_map: {}, pressure_proxy: 0, key_count: 0
      };
    }

    const keydowns = {};
    const dwell_times = [];
    const flight_times = [];
    const bigram_map = {};
    
    let last_keyup_time = null;
    let last_key = null;

    for (const event of events) {
      const { key, type, timestamp } = event;

      if (type === 'keydown') {
        if (!keydowns[key]) {
          keydowns[key] = timestamp;
        }
        if (last_keyup_time !== null) {
          const flight = timestamp - last_keyup_time;
          flight_times.push(flight);
          if (last_key !== null) {
            const bg = last_key + key;
            if (!bigram_map[bg]) bigram_map[bg] = [];
            bigram_map[bg].push(flight);
          }
        }
      } else if (type === 'keyup') {
        if (keydowns[key]) {
          const dwell = timestamp - keydowns[key];
          dwell_times.push(dwell);
          delete keydowns[key];
        }
        last_keyup_time = timestamp;
        last_key = key;
      }
    }

    const total_duration = events[events.length - 1].timestamp - events[0].timestamp;
    const typing_speed = total_duration > 0 ? (dwell_times.length / total_duration) * 1000 : 0;
    
    let rhythm_score = 0.5;
    if (flight_times.length > 1) {
      const mean_ik = flight_times.reduce((a,b) => a+b, 0) / flight_times.length;
      const std_ik = Math.sqrt(flight_times.map(x => Math.pow(x - mean_ik, 2)).reduce((a,b) => a+b, 0) / flight_times.length);
      rhythm_score = Math.max(0, Math.min(1, 1 - (std_ik / (mean_ik || 1))));
    }

    const pressure_proxy = dwell_times.length > 0 ? dwell_times.reduce((a,b) => a+b, 0) / dwell_times.length : 0;

    return {
      dwell_times,
      flight_times,
      total_duration,
      typing_speed,
      rhythm_score,
      bigram_map,
      pressure_proxy,
      key_count: dwell_times.length
    };
  }

  computeSimilarity(profileFeatures, liveFeatures) {
    if (!liveFeatures.dwell_times.length) return 0;
    
    const p_dwell = profileFeatures.mean_dwell || 100;
    const p_flight = profileFeatures.mean_flight || 100;
    const p_speed = profileFeatures.speed || 5;
    const p_rhythm = profileFeatures.rhythm || 0.5;

    const l_dwell = liveFeatures.pressure_proxy;
    const l_flight = liveFeatures.flight_times.length ? liveFeatures.flight_times.reduce((a,b)=>a+b,0)/liveFeatures.flight_times.length : 0;
    const l_speed = liveFeatures.typing_speed;
    const l_rhythm = liveFeatures.rhythm_score;

    const dwell_diff = Math.min(1, Math.abs(p_dwell - l_dwell) / Math.max(1, p_dwell));
    const flight_diff = Math.min(1, Math.abs(p_flight - l_flight) / Math.max(1, p_flight));
    const speed_diff = Math.min(1, Math.abs(p_speed - l_speed) / Math.max(0.1, p_speed));
    const rhythm_diff = Math.min(1, Math.abs(p_rhythm - l_rhythm));

    const distance = Math.sqrt(0.4 * Math.pow(dwell_diff, 2) + 0.4 * Math.pow(flight_diff, 2) + 0.1 * Math.pow(speed_diff, 2) + 0.1 * Math.pow(rhythm_diff, 2));
    return Math.max(0, 1 - distance);
  }

  getRealtimeMetrics() {
    return this.extractFeatures(this.events);
  }
}
