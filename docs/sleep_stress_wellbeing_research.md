# ASTRA HEALTH: Sleep, Stress, Behavioral Health & AI Decision Support

**Module Focus:** Sleep Logger, Wellbeing & Stress Reporting, and AI Symptom Assistant  
**Alignment Reference:** NASA & Canadian Space Agency (CSA) Human Spaceflight Health Data (13–14 November 2026)

## 1. Executive Summary & Mission Alignment

As human spaceflight expands from Low Earth Orbit (ISS) toward the Moon (3-day trip) and Mars (~140 million miles away, ~3-year mission), crews face five compounding hazards: **isolation and confinement, distance from Earth, space radiation, altered gravity fields ($0\text{g}$, $0.38\text{g}$, $1\text{g}$), and hostile closed environments**. CSA notes that these physiological effects resemble accelerated aging and severe sedentary deconditioning.

According to NASA and CSA data, the primary operational threat of chronic stress and sleep disruption is **degraded cognitive performance, impaired reaction time, and poor decision-making** at the exact moment a crew must resolve conflicts, interpret alarms, or manage emergencies. Furthermore, because Mars-class missions introduce **one-way communication delays of up to 20 minutes** and eliminate the ISS "docked lifeboat" evacuation option, crews require **Earth-independent medical operations** combining proactive behavioral monitoring with onboard AI decision support.

## 2. Core Spaceflight Hazards & Observed Clinical Signs/Symptoms

Based on the provided NASA/CSA documentation, our modules track and cross-reference the following physiological and behavioral indicators:

* **Sleep Loss & Circadian Desynchrony:** Living in a closed environment without terrestrial light/dark cues—combined with work overload and irregular schedules—disrupts circadian alignment, causing chronic sleep loss, metabolic strain, and lowered cognitive performance.
* **Isolation, Confinement & Teamwork Strain:** Small crews in tight quarters (modeled in **HERA** [650 sq ft, 45 days, up to 5-min delay] and **CHAPEA** [1,700 sq ft, 378 days]) face elevated risks for behavioral changes, mood disturbances, and interpersonal friction.
* **Fluid Shifts & Neuro-Ocular Strain (SANS):** Headward fluid redistribution in microgravity causes facial puffiness, sinus pressure, headache, elevated intracranial/eye pressure, and structural vision changes (**Spaceflight-Associated Neuro-Ocular Syndrome**).
* **Vestibular & Sensorimotor Disturbances:** Gravity transitions cause space motion sickness, dizziness, spatial disorientation, impaired hand-eye/head-eye coordination, and orthostatic intolerance (fainting/lightheadedness upon re-entry to gravity).
* **Immune Dysregulation & Viral Reactivation:** Spaceflight stress alters immune responses, triggering skin/gut microbiome shifts and reactivating latent viruses (such as the shingles virus, monitored via saliva/blood in NASA's **Immune Biomarkers** study).
* **Space Anemia & Musculoskeletal Deconditioning:** Astronauts experience **1% to 1.5% bone mineral density loss per month**, up to **20% muscle loss in 5–11 days** without exercise, elevated kidney-stone risk, and **54% higher red blood cell destruction** (space anemia).
* **Menu Fatigue & Nutritional Deficit:** Reduced food appeal in prolonged isolation leads to inadequate caloric intake, body-mass loss, and micronutrient deficiencies that undermine all other physical and behavioral countermeasures.

## 3. Architecture Alignment: Why Our System Fits NASA's Layered Defense

NASA's operational health doctrine emphasizes a **layered countermeasure system** rather than a single reactive fix, supported by current research such as **ARCHeR** (Artemis wrist actigraphy for sleep/activity/light and behavioral surveys) and CSA's **C-STARS** (mental well-being in space):

| NASA Architecture Layer | Competition Data Requirement & Research Precedent | ASTRA HEALTH Module & Justification |
| :--- | :--- | :--- |
| **Layer 2: Maintain** *(Sleep & Behavioral Support)* | Manage sleep and circadian alignment (light therapy, phase shifting, journaling, structured schedules) to preserve team function before a crisis occurs. | **Sleep Logger & Circadian Tracker:** Logs sleep duration, quality, and disruption triggers so astronauts can identify circadian drift early and apply targeted light-therapy or schedule adjustments. |
| **Layer 3: Detect Early** *(Individualized Monitoring)* | Mirroring **ARCHeR** and **C-STARS**, frequent physiological and psychological measurements enable individualized countermeasures rather than one-size-fits-all protocols. | **Wellbeing & Stress Check-In:** Captures structured daily stress, mood, appetite ("menu fatigue"), and fatigue data alongside environmental/workload tags to flag behavioral decline early. |
| **Layer 5: Treat Locally** *(Autonomous Point-of-Care)* | NASA's Exploration Medical Capability requires **clinical decision support software**, onboard electronic health records, and in-situ diagnostics when Earth communication is delayed by up to 20 minutes. | **AI Symptom Assistant (`AiSymptomAssistant.tsx`):** Acts as an onboard triage and decision-support layer, cross-referencing logged sleep/stress trends with physical symptoms to guide Crew Medical Officer (CMO) care. |

## 4. Structured Data Tags & Diagnostic Rules for Code Implementation

To implement the competition data directly into our frontend components and AI prompt logic, the system uses standardized categories and symptom-correlation rules derived from the NASA/CSA dataset:

### Sleep Disruption Tags (`SleepLogger`)
* `Circadian Shift / Irregular Schedule` (Loss of natural light-dark cues / shift work)
* `Closed Environment Noise / Ventilation` (Cabin acoustics, airflow, and life-support hardware)
* `Microgravity Fluid Shift / Head Pressure` (Headward fluid redistribution, sinus congestion, or SANS discomfort)
* `High Operational Workload / Alarm Load` (Demanding mission timelines and EVA preparation)
* `Thermal / Humidity Discomfort` (Spacecraft closed-loop environmental variance)

### Behavioral, Nutritional & Stress Trigger Tags (`WellbeingCheckIn`)
* `Isolation & Confinement` (Small quarters, limited privacy, and distance from family/Earth)
* `Communication Delay / Autonomy Pressure` (Up to 20-min one-way Mars latency; high-stakes local decision-making)
* `Teamwork & Interpersonal Friction` (Group dynamics in prolonged multi-year confinement)
* `Menu Fatigue / Low Appetite` (Reduced food acceptability risking body-mass and nutrient loss)
* `Physical Deconditioning / Motion Sickness` (Vestibular disturbance, muscle/bone fatigue, or post-EVA strain)

### AI Symptom Assistant Triage & Correlation Rules (`AiSymptomAssistant.tsx`)
1. **Cross-Domain Symptom Correlation:**
   * *Headache + Vision Changes + Fluid Shift Tag* $\rightarrow$ Flag potential **SANS (Spaceflight-Associated Neuro-Ocular Syndrome)** or intracranial pressure; recommend tonometry/ocular check and thigh-cuff/fluid protocol review.
   * *Fatigue + Skin Rash + High Stress Tag* $\rightarrow$ Flag potential **immune dysregulation / latent viral reactivation** (e.g., shingles); recommend saliva/biomarker logging and CMO isolation/treatment check.
   * *Persistent Fatigue + Low Appetite ("Menu Fatigue")* $\rightarrow$ Flag potential **caloric deficit or space anemia** (54% elevated RBC destruction); recommend nutrition intake audit and blood/hemoglobin check.
   * *Dizziness + Post-Transit / Gravity Change* $\rightarrow$ Flag **vestibular/sensorimotor disturbance or orthostatic intolerance**; advise hydration and graded movement protocols.
2. **Earth-Independent Guidance (20-Minute Delay Mode):**
   * Recommendations prioritize onboard self-care, **Crew Medical Officer (CMO)** procedures (trained to paramedic level), and low-mass countermeasures (circadian light therapy, scheduled rest, hydration, workload pacing) rather than assuming real-time flight surgeon video guidance.
3. **Emergency Red-Flag Escalation:**
   * Following NASA's emergency doctrine (*Crew Safety First, Vehicle Safety Second, Mission Success Third*), the AI immediately escalates acute red-flag symptoms—such as sudden severe vision loss, neurological deficits, chest pain, or signs of **decompression sickness, hypoxia, fire, or toxic atmosphere**—to emergency CMO and safe-haven protocols.

## 6. Earth-Independent Decision Support Protocol (~20-Minute Latency)

Mars-class missions introduce one-way communication delays of up to 20 minutes between Earth and the spacecraft, making real-time flight surgeon consultation impossible. ASTRA HEALTH's Earth-independent protocol ensures continuous health monitoring and triage without ground dependency:

### 6.1 Local Triage & Ledger
The `AiSymptomAssistant` component runs entirely on-device. Symptom reports, sleep/stress check-ins, and movement assessment results are correlated locally using the onboard triage rules in Section 4.2. Each autonomous assessment is written to the `astra_mission_triage_logs` localStorage ledger with severity badges (NOMINAL / CAUTION / CRITICAL), crew name, category, and timestamp. The Central Mission Triage Ledger surfaces these entries so the Crew Medical Officer (CMO) can review them without waiting for ground downlink.

### 6.2 Timeline Integration
Triage ledger entries are passed through `App.tsx` → `DashboardPage` → `HealthTimelinePage` as `missionTriageLogs`, where they render natively alongside sleep, wellbeing, movement, and symptom records in the Central Health Timeline. Each triage entry is tagged with source `"triage"` and an `AlertTriangle` icon, allowing medical personnel to see autonomous triage assessments in the same longitudinal view as other mission event markers.

### 6.3 Crew Telemetry Enrichment
The `CrewTelemetry` interface (`src/types/telemetry.ts`) extends triage context with deep-space environmental and physiological metrics: ambient CO₂ levels, radiation exposure counters, heart rate variability (HRV), cabin temperature, cabin pressure, sleep quality, stress, mood, and fatigue ratings. These metrics enrich the autonomous diagnostic prompts, making triage decisions more data-rich when Earth guidance is delayed.

### 6.4 Queued Ground Downlink
All triage logs are persisted to `localStorage` and marked as "queued for ground telemetry downlink." When communication is restored (e.g., during a contact window), the ledger can be exported and transmitted to mission control. The 20-minute latency is thus absorbed by local autonomy for immediate decisions, with deferred review by ground medical personnel for long-term trend analysis.

### 6.5 Emergency Escalation
Acute red-flag symptoms (sudden vision loss, neurological deficits, chest pain, decompression sickness, hypoxia, fire, toxic atmosphere) bypass the 20-minute delay protocol and trigger immediate local CMO and safe-haven procedures, following NASA's doctrine: Crew Safety First, Vehicle Safety Second, Mission Success Third.


## 5. Key Pitch Points & Justification for Judges

1. **Directly Modeled on Artemis & Mars Research:** Our sleep and wellbeing metrics mirror NASA's **ARCHeR** (Artemis actigraphy & behavioral surveys), **HERA/CHAPEA** delay analogs, and CSA's **C-STARS** mental health framework.
2. **Solves the 20-Minute Mars Latency Gap:** Unlike ISS tools that rely on live ground consultation and a docked escape capsule, ASTRA HEALTH provides autonomous, onboard triage and trend correlation when Earth cannot respond in real time.
3. **Whole-System Prevention:** By linking sleep, stress, and appetite ("menu fatigue") directly to physical symptom triage, the platform prevents minor behavioral or nutritional dips from compounding into mission-critical medical emergencies.