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

## 🧠 Future Web MLC-LLM (Gemma) Integration Flow

1. **Model Loader Initialization**: Install `@mlc-ai/web-llm` library.
2. **GPU Allocation & Compilation**: Request WebGPU adapter on mount, compile shaders, and check local storage for cached model weights.
3. **Weight Pinned Cache**: Preload Gemma-2B-it weights (approx 1.5GB) into indexedDB browser cache.
4. **Structured Inference**: Construct System JSON schemas to force JSON-formatted output containing `cognitiveLoad`, `focusLevel`, `stressLevel`, `dominantEmotion`, and `suggestion`.
5. **Telemetry Hooks**: Feed execution timestamps and cache stats into the Dashboard telemetry state.
