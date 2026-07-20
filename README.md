<div align="center">

<a href="https://academy.masterfabric.co">
  <img src="https://academy.masterfabric.co/academy-badge.png" width="120" alt="MasterFabric Academy">
</a>

<p>
  <sub>
    academy.masterfabric.co is a
    <a href="https://masterfabric.co">MasterFabric</a>
    subsidiary.
  </sub>
</p>

</div>

# Smart Emotion and Focus Journal (Akıllı Duygu ve Odak Günlüğü)

**Vercel Live Demo**: [https://smart-emotion-focus-journal-fronten.vercel.app](https://smart-emotion-focus-journal-fronten.vercel.app)  
**Go Backend Source Repository**: [https://github.com/Gurkan26/smart-emotion-focus-journal-backend](https://github.com/Gurkan26/smart-emotion-focus-journal-backend)

An advanced Next.js frontend prototype built for evaluation of user emotional states, cognitive workloads, and focus efficiencies. This project is architected to perform local **Decision Scoring** and **Raw LLM Monitoring** using browser-embedded large language models (such as **Gemma-2B** via **Web MLC-LLM**).

## 🚀 Key Objectives

- **Decision Scoring**: Real-time analysis of free-text journal inputs to compute cognitive load percentages, fatigue indicators, stress indexes, and generate actionable mental health suggestions.
- **Raw LLM Monitoring**: Diagnostic dashboards tracking prompt/completion token volumes, GPU/VRAM temperature, weight cache hits, and generation speeds (tokens per second).
- **100% Local Privacy**: Designed for browser-only execution using WebGPU pipelines, ensuring user thoughts never leave their device.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI & Logic**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📂 Project Structure

```
smart-emotion-focus-journal/
├── src/
│   ├── app/
│   │   ├── layout.js          # Root layout and metadata configuration
│   │   ├── page.js            # Redirect entry page
│   │   ├── globals.css        # Premium dark mode and glassmorphism styling
│   │   ├── auth/
│   │   │   └── page.js        # Auth card (Sign in / Register) view
│   │   └── app/
│   │       ├── layout.js      # App sidebar layout, status, and navigation
│   │       ├── journal/
│   │       │   └── page.js    # Journal writing and Decision Scoring metrics
│   │       └── dashboard/
│   │           └── page.js    # Telemetry dashboards and SVG performance charts
```

---

## ⚡ Getting Started

First, install the package dependencies:

```bash
npm install
```

Then, run the development server locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to experience the application.

---

## 🧠 Web MLC-LLM (Gemma) Integration & Telemetry

The Web-LLM local inference engine is **fully integrated**:
1. **Model Loader Initialization**: Uses `@mlc-ai/web-llm` dynamic module loads within client context to safeguard builds.
2. **GPU Allocation & Compilation**: Automatically checks WebGPU support, requests adapter, compiles shaders, and streams weights caching.
3. **Weight Pinned Cache**: Automatically caches Gemma-2B-it weights (approx 1.5GB) locally on first run.
4. **Structured Inference**: Prompted to output structured raw decisions that are parsed into cognitive load, stress, and focus charts.
5. **Telemetry Sync**: Latency and token metrics are pushed to the live database and visualized dynamically on the dashboard.
