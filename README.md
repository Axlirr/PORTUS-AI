# PORTUS AI – Conversational Trade Intelligence Agent

PORTUS AI is a sophisticated, multi-modal conversational agent designed to empower global port and logistics managers. It provides real-time, AI-driven coordination and decision-making capabilities, especially during disruptions to global trade. The agent combines data retrieval, LLM-driven reasoning, and simulated analysis to recommend clear, actionable decisions.

This application demonstrates advanced AI agent patterns including **ReAct (Reasoning + Acting)**, **RAG (Retrieval-Augmented Generation)**, and **Human-in-the-Loop** workflows using Azure OpenAI.

## 🚀 Key Features

- **Conversational Interface:** Users can ask complex questions about the global trade network in natural, everyday language.
- **ReAct Pattern Implementation:** The agent shows its reasoning process with visible [Thinking], [Action], and [Observation] steps.
- **RAG-Enhanced Responses:** Retrieves relevant operational documents and procedures to provide context-aware answers.
- **Human-in-the-Loop Controls:** Critical actions require human approval before execution.
- **Multi-source Data Analysis:** Ingests and analyzes disparate data sources simultaneously, including vessel status, port throughput, weather disruptions, and trade route information.
- **AI-Driven Recommendations:** Goes beyond simple data retrieval to provide concrete, actionable recommendations with estimated impacts and confidence scores.
- **Transparent Reasoning:** Clearly displays the AI's step-by-step execution plan, the data sources it used for its analysis, and a concise summary of its findings.
- **Real-time Decision Support:** Built to provide logistics professionals with the insights they need to react quickly and effectively to dynamic, real-world events.

## 🏗️ Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **AI Model:** Azure OpenAI (`gpt-4o`) for advanced reasoning, function-calling, and structured data generation
- **Build Tool:** Vite with custom proxy middleware for Azure OpenAI integration
- **Agent Patterns:** ReAct (Reasoning + Acting), RAG (Retrieval-Augmented Generation)

## 📁 Project Structure

The project is organized into a modular structure to separate concerns and improve maintainability.

```
/
├── public/
├── src/
│   ├── components/      # Reusable React components
│   │   ├── AnalysisDisplay.tsx  # Renders the detailed AI analysis with ReAct trace
│   │   ├── ChatInterface.tsx    # The main chat window and input form
│   │   ├── ChatMessage.tsx      # A single chat bubble
│   │   ├── IconComponents.tsx   # SVG icons used throughout the app
│   │   └── SourcePill.tsx       # A small pill to display data sources
│   ├── data/
│   │   ├── mockData.ts        # Mock data for vessels, ports, weather, etc.
│   │   └── ragDocs.ts         # RAG knowledge base with operational documents
│   ├── services/
│   │   └── openaiService.ts   # Handles all communication with Azure OpenAI API
│   ├── types.ts             # TypeScript type definitions including ReAct trace types
│   ├── App.tsx              # Main application component and layout
│   └── index.tsx            # React application entry point
├── index.html           # The main HTML file with custom scrollbar styles
├── vite.config.ts       # Vite configuration with Azure OpenAI proxy middleware
└── metadata.json        # Application metadata
```

## 🔄 How It Works

The application follows a clear data flow from user input to AI-generated analysis with visible reasoning:

1.  **User Query:** The user enters a natural language query into the `ChatInterface`.
2.  **RAG Retrieval:** The system searches the knowledge base for relevant operational documents.
3.  **API Service Call:** The `getTradeAnalysis` function in `openaiService.ts` is triggered.
4.  **Prompt Construction:** The service constructs a detailed, multi-part prompt including:
    *   A **System Instruction** that defines the AI's persona (PORTUS AI), its objective, and the required JSON output schema with ReAct trace.
    *   A **Data Context** containing all the available mock data (vessels, ports, weather, routes) formatted as JSON strings.
    *   **RAG Context** with retrieved operational documents.
    *   The **User's Query**.
5.  **Azure OpenAI Request:** The complete prompt is sent to the `gpt-4o` model via Azure OpenAI. The request specifies that the response must be in `application/json` and must adhere to the defined schema with ReAct trace.
6.  **Structured JSON Response:** Azure OpenAI processes the prompt, analyzes the data in context, and returns a structured JSON object containing the `plan`, `recommendations`, `sources`, `explain`, and `trace` fields.
7.  **State Update & UI Render:**
    *   The frontend receives the JSON response.
    *   The `explain` text is displayed as a new message from the AI in the `ChatInterface`.
    *   The entire analysis object is passed to the `AnalysisDisplay` component, which renders the detailed breakdown including the ReAct trace with [Thinking], [Action], and [Observation] steps.
    *   Human approval buttons are shown for critical actions requiring confirmation.

## 🚀 Getting Started

### Prerequisites

- An active Azure OpenAI resource with a deployed model (e.g., `gpt-4o`).
- Primary and/or Secondary API keys.

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd PORTUS-AI
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Azure Configuration:** Set the following environment variables (e.g., in a `.env` file):

   - `AZURE_OPENAI_ENDPOINT` (e.g., `https://your-resource-name.openai.azure.com`)
   - `AZURE_OPENAI_DEPLOYMENT` (your deployment name, e.g., `gpt-4o`)
   - `AZURE_OPENAI_API_VERSION` (e.g., `2024-08-01-preview`)
   - `AZURE_OPENAI_PRIMARY_KEY` (your primary key)
   - `AZURE_OPENAI_SECONDARY_KEY` (your secondary key, used as fallback)

   The app prefers the primary key and falls back to the secondary key automatically.

4.  **Running the Application:**
    ```bash
    npm run dev
    ```

5.  **Build for Production:**
    ```bash
    npm run build
    ```

### Example Usage

Once the application is running, try asking complex questions that require synthesizing information from the mock data and operational procedures. For example:

> "If the Suez Canal sandstorm causes a 48-hour delay, how are vessels V101 and V102 affected? What are my best options to mitigate the impact on Rotterdam's port congestion?"

> "What's the protocol for handling a hazardous material spill at Tuas Port?"

## 🧠 AI Agent Patterns

### ReAct (Reasoning + Acting)
The agent demonstrates its reasoning process through visible trace steps:
- **[Thinking]:** Internal reasoning and planning
- **[Action]:** Tool calls or function executions
- **[Observation]:** Results from actions taken
- **[Final]:** Summary and recommendations

### RAG (Retrieval-Augmented Generation)
The system includes a knowledge base of operational documents:
- Safety procedures and protocols
- Berth allocation guidelines
- Predictive maintenance procedures
- Incident communication templates

### Human-in-the-Loop (HITL)
Critical actions require human approval:
- Vessel rerouting decisions
- Emergency protocol activations
- Resource allocation changes

## 🛠️ Development

### Key Components

- **`openaiService.ts`:** Handles Azure OpenAI communication with ReAct trace support
- **`AnalysisDisplay.tsx`:** Renders ReAct trace with approval controls
- **`ragDocs.ts`:** Knowledge base for RAG functionality
- **`vite.config.ts`:** Custom proxy middleware for Azure OpenAI integration

### Customization

- **Add new tools:** Extend the ReAct trace to include custom function calls
- **Expand RAG knowledge:** Add more operational documents to `ragDocs.ts`
- **Modify UI:** Update components in the `components/` directory
- **Add data sources:** Extend mock data in `mockData.ts`

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support or questions, please open an issue in the GitHub repository.