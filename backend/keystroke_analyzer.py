import numpy as np
from scipy.spatial.distance import euclidean
import json
from typing import List, Dict, Tuple

class KeystrokeAnalyzer:
    def extract_features(self, keystroke_events: List[Dict]) -> Dict:
        if not keystroke_events or len(keystroke_events) < 4:
            return {
                "dwell_times": [], "flight_times": [], "total_duration": 0,
                "typing_speed": 0, "rhythm_score": 0, "bigram_times": {}, "pressure_proxy": 0
            }

        keydowns = {}
        dwell_times = []
        flight_times = []
        bigram_times = {}
        
        last_keyup_time = None
        last_key = None

        for event in keystroke_events:
            key = event["key"]
            t = event["timestamp"]
            etype = event["type"]

            if etype == "keydown":
                if key not in keydowns:
                    keydowns[key] = t
                if last_keyup_time is not None:
                    flight = t - last_keyup_time
                    flight_times.append(flight)
                    if last_key is not None:
                        bg = last_key + key
                        if bg not in bigram_times:
                            bigram_times[bg] = []
                        bigram_times[bg].append(flight)
            elif etype == "keyup":
                if key in keydowns:
                    dwell = t - keydowns[key]
                    dwell_times.append(dwell)
                    del keydowns[key]
                last_keyup_time = t
                last_key = key

        total_duration = keystroke_events[-1]["timestamp"] - keystroke_events[0]["timestamp"]
        typing_speed = (len(dwell_times) / total_duration) * 1000 if total_duration > 0 else 0
        
        inter_key = flight_times
        if len(inter_key) > 1:
            mean_ik = np.mean(inter_key)
            std_ik = np.std(inter_key)
            rhythm_score = max(0.0, min(1.0, 1.0 - (std_ik / mean_ik) if mean_ik > 0 else 0))
        else:
            rhythm_score = 0.5

        pressure_proxy = float(np.mean(dwell_times)) if dwell_times else 0

        return {
            "dwell_times": dwell_times,
            "flight_times": flight_times,
            "total_duration": total_duration,
            "typing_speed": typing_speed,
            "rhythm_score": rhythm_score,
            "bigram_times": bigram_times,
            "pressure_proxy": pressure_proxy
        }

    def build_profile(self, samples: List[List[Dict]]) -> Dict:
        all_dwells = []
        all_flights = []
        speeds = []
        rhythms = []

        for sample in samples:
            f = self.extract_features(sample)
            if f["dwell_times"]:
                all_dwells.extend(f["dwell_times"])
            if f["flight_times"]:
                all_flights.extend(f["flight_times"])
            speeds.append(f["typing_speed"])
            rhythms.append(f["rhythm_score"])

        mean_dwell = float(np.mean(all_dwells)) if all_dwells else 0
        std_dwell = float(np.std(all_dwells)) if all_dwells else 0
        mean_flight = float(np.mean(all_flights)) if all_flights else 0
        std_flight = float(np.std(all_flights)) if all_flights else 0
        mean_speed = float(np.mean(speeds)) if speeds else 0
        mean_rhythm = float(np.mean(rhythms)) if rhythms else 0

        # Simple distance-based threshold
        threshold = 0.65

        return {
            "mean_dwell_times": json.dumps([mean_dwell]),
            "mean_flight_times": json.dumps([mean_flight]),
            "std_dwell_times": json.dumps([std_dwell]),
            "std_flight_times": json.dumps([std_flight]),
            "mean_typing_speed": mean_speed,
            "mean_rhythm_score": mean_rhythm,
            "training_samples": len(samples),
            "confidence_threshold": threshold
        }

    def compare(self, profile: Dict, live_features: Dict) -> Tuple[float, str]:
        if not live_features["dwell_times"]:
            return 0.0, "BLOCKED"

        p_mean_dwell = json.loads(profile["mean_dwell_times"])[0]
        p_mean_flight = json.loads(profile["mean_flight_times"])[0]
        p_speed = profile["mean_typing_speed"]
        p_rhythm = profile["mean_rhythm_score"]
        threshold = profile["confidence_threshold"]

        l_mean_dwell = float(np.mean(live_features["dwell_times"]))
        l_mean_flight = float(np.mean(live_features["flight_times"])) if live_features["flight_times"] else 0
        l_speed = live_features["typing_speed"]
        l_rhythm = live_features["rhythm_score"]

        # Normalize differences (very simplified for hackathon)
        dwell_diff = min(1.0, abs(p_mean_dwell - l_mean_dwell) / max(1, p_mean_dwell))
        flight_diff = min(1.0, abs(p_mean_flight - l_mean_flight) / max(1, p_mean_flight))
        speed_diff = min(1.0, abs(p_speed - l_speed) / max(0.1, p_speed))
        rhythm_diff = min(1.0, abs(p_rhythm - l_rhythm))

        distance = np.sqrt(0.4 * (dwell_diff**2) + 0.4 * (flight_diff**2) + 0.1 * (speed_diff**2) + 0.1 * (rhythm_diff**2))
        match_score = max(0.0, 1.0 - distance)

        if match_score >= threshold:
            return match_score, "MATCH"
        elif match_score >= threshold - 0.2:
            return match_score, "UNCERTAIN"
        else:
            return match_score, "BLOCKED"

    def detect_anomaly(self, profile: Dict, live_features: Dict) -> Dict:
        if not live_features["dwell_times"]:
            return {"severity": "CRITICAL", "reason": "No keystrokes detected", "details": {}}

        p_mean_dwell = json.loads(profile["mean_dwell_times"])[0]
        l_mean_dwell = float(np.mean(live_features["dwell_times"]))
        dwell_dev = abs(p_mean_dwell - l_mean_dwell) / max(1, p_mean_dwell)

        severity = "LOW"
        if dwell_dev > 0.5: severity = "CRITICAL"
        elif dwell_dev > 0.3: severity = "HIGH"
        elif dwell_dev > 0.15: severity = "MEDIUM"

        return {
            "severity": severity,
            "reason": f"Dwell time deviation: {dwell_dev*100:.1f}%",
            "details": {
                "dwell_dev": dwell_dev,
                "p_mean_dwell": p_mean_dwell,
                "l_mean_dwell": l_mean_dwell
            }
        }
