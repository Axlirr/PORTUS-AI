# PORTUS AI – Conversational Trade Intelligence Agent

PORTUS AI is a sophisticated, multi-modal conversational agent designed to empower global port and logistics managers. It provides real-time, AI-driven coordination and decision-making capabilities, especially during disruptions to global trade. The agent combines data retrieval, LLM-driven reasoning, and simulated analysis to recommend clear, actionable decisions.

This application serves as a powerful demonstration of using the Google Gemini API for complex data analysis, reasoning, and structured data generation in a specialized domain.

## Key Features

- **Conversational Interface:** Users can ask complex questions about the global trade network in natural, everyday language.
- **Multi-source Data Analysis:** Ingests and analyzes disparate data sources simultaneously, including vessel status, port throughput, weather disruptions, and trade route information.
- **AI-Driven Recommendations:** Goes beyond simple data retrieval to provide concrete, actionable recommendations with estimated impacts and confidence scores.
- **Transparent Reasoning:** Clearly displays the AI's step-by-step execution plan, the data sources it used for its analysis, and a concise summary of its findings.
- **Real-time Decision Support:** Built to provide logistics professionals with the insights they need to react quickly and effectively to dynamic, real-world events.

## Technology Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **AI Model:** Google Gemini API (`gemini-2.5-flash`) for its advanced reasoning, function-calling, and structured data generation capabilities.

## Project Structure

The project is organized into a modular structure to separate concerns and improve maintainability.

```
/
├── public/
├── src/
│   ├── components/      # Reusable React components
│   │   ├── AnalysisDisplay.tsx  # Renders the detailed AI analysis
│   │   ├── ChatInterface.tsx    # The main chat window and input form
│   │   ├── ChatMessage.tsx      # A single chat bubble
│   │   ├── IconComponents.tsx   # SVG icons used throughout the app
│   │   └── SourcePill.tsx       # A small pill to display data sources
│   ├── data/
│   │   └── mockData.ts        # Mock data for vessels, ports, weather, etc.
│   ├── services/
│   │   └── geminiService.ts   # Handles all communication with the Gemini API
│   ├── types.ts             # TypeScript type definitions
│   ├── App.tsx              # Main application component and layout
│   └── index.tsx            # React application entry point
├── index.html           # The main HTML file
└── metadata.json        # Application metadata
```

## How It Works

The application follows a clear data flow from user input to AI-generated analysis:

1.  **User Query:** The user enters a natural language query into the `ChatInterface`.
2.  **API Service Call:** The `getTradeAnalysis` function in `geminiService.ts` is triggered.
3.  **Prompt Construction:** The service constructs a detailed, multi-part prompt. This includes:
    *   A **System Instruction** that defines the AI's persona (PORTUS AI), its objective, and the required JSON output schema.
    *   A **Data Context** containing all the available mock data (vessels, ports, weather, routes) formatted as JSON strings.
    *   The **User's Query**.
4.  **Gemini API Request:** The complete prompt is sent to the `gemini-2.5-flash` model. The request specifies that the response must be in `application/json` and must adhere to the defined `responseSchema`.
5.  **Structured JSON Response:** The Gemini API processes the prompt, analyzes the data in context, and returns a structured JSON object containing the `plan`, `recommendations`, `sources`, and `explain` fields.
6.  **State Update & UI Render:**
    *   The frontend receives the JSON response.
    *   The `explain` text is displayed as a new message from the AI in the `ChatInterface`.
    *   The entire analysis object is passed to the `AnalysisDisplay` component, which renders the detailed breakdown of the recommendations, execution plan, and data sources.

## Getting Started

### Prerequisites

- An active Google Gemini API key.

### Setup

1.  **API Key Configuration:** This application is configured to use an API key provided through an environment variable. Ensure that `process.env.API_KEY` is available in your execution environment.

2.  **Running the Application:** This project is set up to run directly in a compatible web development environment. No local installation of dependencies is required as they are loaded via an import map from a CDN. Simply serve the `index.html` file.

### Example Usage

Once the application is running, try asking a complex question that requires synthesizing information from the mock data. For example:

> "If the Suez Canal sandstorm causes a 48-hour delay, how are vessels V101 and V102 affected? What are my best options to mitigate the impact on Rotterdam's port congestion?"
