// Detailed case narratives. Business cases retain their confirmed role boundaries;
// lab cases describe AI-assisted personal research prototypes, not client or live-trading delivery.
window.PORTFOLIO_CASE_STUDIES = {
  commerce: {
    title: 'Restaurant Orders & Payments',
    meta: 'Baiweiyun (百味云) · Senior Software Engineer / Technical Team Lead · 2016.10 — 2018.04',
    thesis: 'An order notification needs a delivery path—and a way to know whether it arrived.',
    context: 'Yunxiaoer and Yunzhanggui connected restaurant orders, payments, and notifications. Each operation crossed business logic, payment channels, and store devices. A failure at any point could leave staff unsure what to do next. The design focused on clear module responsibilities and explicit boundaries between processing an order and confirming its delivery to a device.',
    flow: [
      { name: 'Business entry', detail: 'Orders and store operations' },
      { name: 'Order service', detail: 'Core business workflow' },
      { name: 'Payment integration', detail: 'Payment gateway connections' },
      { name: 'Device notification', detail: 'Persistent connections, push, and acknowledgments' }
    ],
    decisions: [
      {
        title: 'Organize modules around business responsibilities',
        problem: 'Orders, payments, and risk controls were closely connected. Mixing their responsibilities would make changes and integration work harder to contain.',
        choice: 'Used the order module to coordinate the core workflow, developed the payment gateway, and worked with the risk-control module, keeping business orchestration distinct from external channel integration.',
        benefit: 'Gave each change a clear place in the system, making its impact easier to assess and development and acceptance work easier to coordinate.'
      },
      {
        title: 'Give notification delivery its own design',
        problem: 'Completing an order did not establish whether the store or its staff had received the notification.',
        choice: 'The notification path consumes new-order messages through RabbitMQ, prioritizes Netty persistent connections, and uses JPush as a fallback for store printing and staff notifications.',
        benefit: 'Separated order processing from device delivery while retaining both an immediate connection and an alternative notification path.'
      },
      {
        title: 'Bound retries using application acknowledgments',
        problem: 'Network changes and device availability could leave notifications unconfirmed, while retries from multiple nodes could create duplicates.',
        choice: 'The notification path uses application acknowledgments to trigger limited retries for unconfirmed orders, with Redis counters restricting repeated JPush notifications across nodes.',
        benefit: 'Made retry limits and duplicate controls explicit while preserving the distinction between server-side processing and completion at the device.'
      }
    ],
    checks: [
      'Are successful order processing and confirmed device delivery represented as distinct states?',
      'Are retry limits and stopping conditions explicit when a device disconnects or an acknowledgment is missing?',
      'Are duplicate notifications controlled when multiple nodes process the same event?'
    ],
    outcome: 'Established clear boundaries for orders, payments, and notifications, providing a structure for continued development and failure diagnosis.',
    responsibility: 'Responsible for architecture setup and core development of Yunxiaoer and Yunzhanggui. Led the order module, developed the payment gateway, and contributed to the risk-control module.',
    tags: ['Business architecture', 'Orders / Payments', 'RabbitMQ', 'Netty', 'Redis', 'JPush']
  },
  aigc: {
    title: 'AIGC Production Workflow',
    meta: 'Personal R&D · AI-assisted · Offline engineering prototype',
    thesis: 'The central question: how should tasks and budgets recover when generation is interrupted?',
    context: 'Content production involves generation, rework, review, and editing. Tracking the state and cost of repeated attempts is an engineering problem in its own right. This personal prototype uses offline simulations to explore recovery after interruption, submissions with unknown outcomes, and whether a review remains valid after its media or prompt changes.',
    flow: [
      { name: 'Shot ledger', detail: 'Versions, requests, and budgets' },
      { name: 'Simulated execution', detail: 'Submission, polling, and recovery' },
      { name: 'Quality review', detail: 'Technical checks tied to versions' },
      { name: 'Edit assembly', detail: 'Sequencing, mixing, and subtitles' }
    ],
    decisions: [
      {
        title: 'Persist evidence before advancing state',
        problem: 'A request can time out after submission. Retrying immediately may execute the same task again.',
        choice: 'Stored shot versions, request hashes, attempt records, and audit events in SQLite WAL. When a submission outcome is unknown, the prototype retains the budget reservation and enters recovery or reconciliation.',
        benefit: 'Distinguishes an absent response from an unsubmitted task and gives recovery a durable record to work from.'
      },
      {
        title: 'Make budget limits part of scheduling',
        problem: 'Prompt changes, retries, and rejected media can leave cost reporting behind the actual number of attempts.',
        choice: 'Checked project and episode budgets and reserved funds atomically within a transaction, using integer accounting. Retry counts span versions, and attempts rejected by quality checks retain their simulated costs.',
        benefit: 'Keeps budgets, versions, and retries under the same rules, so the cost of a production can be traced to its attempts.'
      },
      {
        title: 'Track technical quality and content approval separately',
        problem: 'Valid media files can still fail content review, and replacing an asset can invalidate an earlier approval.',
        choice: 'Used FFmpeg / ffprobe to check dimensions, duration, audio tracks, black frames, and freezes. Content reviews are bound to the request, file, and acceptance context; changes require a new review.',
        benefit: 'Keeps evidence for technical checks and content decisions separate, with version checks during assembly to prevent reuse of stale approvals.'
      }
    ],
    checks: [
      'After an interruption, can recovery distinguish submitted tasks, unknown outcomes, and tasks never submitted?',
      'Do prompt or media changes correctly affect retry limits and review validity?',
      'Do the files, versions, and approvals used in an edit refer to the same valid attempt?'
    ],
    outcome: 'Organizes a recoverable content-production workflow around durable state, budget constraints, and version evidence, explored through offline simulation.',
    responsibilityLabel: 'Research scope',
    responsibility: 'An AI-assisted personal engineering prototype covering task records, recovery, technical quality checks, and editing validation. The focus is engineering control of the generation workflow.',
    stage: 'Offline workflow and mock-provider validation are complete. Real model integration and generated-content quality evaluation remain future integration work; this is not a client production system.',
    tags: ['Python', 'SQLite WAL', 'FFmpeg / ffprobe', 'State machines', 'Budget reservations', 'Task recovery']
  },
  quant: {
    title: 'Quant Research & Backtesting',
    meta: 'Personal research · AI-assisted · Simulated backtesting prototype',
    thesis: 'Reconcile signals, costs, and cash movements before interpreting a backtest.',
    context: 'A backtest depends on signal calculations, execution assumptions, costs, and capital constraints. This personal research prototype examines those layers separately: why a signal was produced, when costs were deducted, how risk rules changed cash and positions, and whether results can be reproduced after data or code changes. Its focus is a research tool whose calculations can be inspected and reconciled.',
    flow: [
      { name: 'Market data & signals', detail: 'LEAN / C# calculations' },
      { name: 'Independent ledger', detail: 'Python execution simulation' },
      { name: 'Costs & risk', detail: 'Fees, cash, and constraints' },
      { name: 'Reconciliation', detail: 'Trade records and research reports' }
    ],
    decisions: [
      {
        title: 'Separate signal generation from capital accounting',
        problem: 'An engine’s final statistics alone make it difficult to identify whether a discrepancy comes from signals, execution assumptions, or capital calculations.',
        choice: 'Exported structured strategy signals from LEAN / C# for an independent Python ledger to consume and simulate cash and execution. Separate window calculations support row-by-row reconciliation, while the signal stage places no orders.',
        benefit: 'Provides an independent inspection point for each layer and a way to locate the source of discrepancies.'
      },
      {
        title: 'Use the same capital basis for costs and risk',
        problem: 'Deducting costs in a report without reflecting them in cash and risk decisions can distort research conclusions.',
        choice: 'Distinguished trading equity, net equity, actual cash deductions, and return attribution. The ledger includes commissions, slippage, funding fees, and settlement, with risk controls based on net equity after costs.',
        benefit: 'Makes risk rules act on the capital model and enables checks for missing costs, double counting, and incorrect attribution.'
      },
      {
        title: 'Keep a reproducible path from inputs to results',
        problem: 'Summary charts alone cannot explain result changes when inputs, parameters, or code are revised.',
        choice: 'Retained individual trades, decision reasons, cost records, and risk events. Scripts connect signal validation, backtesting, and ledger acceptance checks, with hashes for inputs, code, and outputs.',
        benefit: 'Connects research reports to their underlying calculations and establishes a reproducible baseline for later experiments.'
      }
    ],
    checks: [
      'Does row-by-row reconciliation reveal missing signals, alignment errors, or duplicate consumption?',
      'Do cost deductions and risk pauses actually change available cash, positions, and subsequent entries?',
      'Can the same inputs, code, and parameters reproduce both detailed records and aggregate results?'
    ],
    outcome: 'Provides a basis for explainable, reconcilable, and reproducible research through explicit ledger and cost assumptions.',
    responsibilityLabel: 'Research scope',
    responsibility: 'An AI-assisted personal research prototype covering signal calculations, an independent capital ledger, risk rules, result reconciliation, and HTML research reports.',
    stage: 'Research and simulated backtesting only. The prototype is not connected to a brokerage account, does not place live orders, and is not a client production system.',
    tags: ['C# / LEAN', 'Python', 'Independent capital ledger', 'Cost modeling', 'Risk rules', 'Reproducible research']
  },
  telemarketing: {
    title: 'Outbound Calling Platform Modernization',
    meta: 'Qifu Technology (奇富科技) · Development Lead · 2018.04 — 2026.03',
    thesis: 'Service boundaries had to improve alongside lock contention, timeouts, and out-of-memory failures.',
    context: 'As manual and automated outbound calling evolved, the monolith encountered lock contention, timeouts, and out-of-memory failures. The work combined service decomposition with specific runtime, downstream-call, and data-access improvements. It also required coordination across scheduling, configuration, and team delivery while leaving room for further business changes.',
    flow: [
      { name: 'Calling requests', detail: 'Manual and automated outbound calls' },
      { name: 'Rule validation', detail: 'Call restrictions, blocklists, and limits' },
      { name: 'Service coordination', detail: 'Business calls and task management' },
      { name: 'Data access', detail: 'Caching, queries, and hot/cold separation' }
    ],
    decisions: [
      {
        title: 'Decompose services along business responsibilities',
        problem: 'Responsibilities within the monolith affected one another, allowing pressure in one area to become a wider runtime problem.',
        choice: 'Led the move from a monolith to microservices and introduced XXL-JOB and Apollo for scheduling and configuration. A dedicated outbound validation service handles call restrictions, blocklists, and phone-number and frequency limits.',
        benefit: 'Creates clearer boundaries between business rules and execution, giving diagnosis and subsequent changes a defined place in the system.'
      },
      {
        title: 'Bound resources for parallel downstream calls',
        problem: 'Agent-facing tag lookups depended on multiple downstream queries. Sequential waiting and individual failures could both affect result assembly.',
        choice: 'The tag-query path uses a bounded thread pool and CompletableFuture to fetch downstream results in parallel, retaining available information when an individual query fails.',
        benefit: 'Allows concurrency within explicit resource limits and preserves a path for partial results when a dependency fails.'
      },
      {
        title: 'Address performance along specific access paths',
        problem: 'Lock contention, slow queries, and memory pressure overlapped, so a single configuration adjustment could not address every cause.',
        choice: 'Tuned JVM settings for concurrent access, improved SQL indexes and Redis caching, and separated hot and cold data to address runtime behavior, query access, and data volume individually.',
        benefit: 'Links each intervention to a concrete source of pressure, making its effect and any remaining bottlenecks easier to assess.'
      }
    ],
    checks: [
      'Do business rules, error responses, and restrictions retain their semantics after service decomposition?',
      'Do thread usage and partial-result handling behave as intended when downstream services are slow or fail?',
      'Are JVM, SQL, cache, and hot/cold data changes evaluated under comparable loads?'
    ],
    outcome: 'Connected architectural change to concrete reliability problems, with explicit service boundaries and specific implementation points to validate.',
    responsibility: 'Led the monolith-to-microservices migration, covering technical design, core development, and team delivery. Worked with product, QA, and operations on releases and production issues.',
    tags: ['Java / Dubbo', 'Microservices', 'CompletableFuture', 'JVM', 'MySQL / Redis', 'XXL-JOB / Apollo']
  },
  'customer-ai': {
    title: 'AI Customer Support & Knowledge Retrieval',
    meta: 'Qifu Technology (奇富科技) · Contributor to message processing and routing',
    thesis: 'My contribution connected support messages and routing with business context and retrieved knowledge.',
    context: 'Customer inquiries arrive with business state, conversation history, and missing information. The project connects message processing, routing, and knowledge retrieval to support clarification, status queries, and human handoff. It also retains model-call and citation records to help trace answers and incorporate operational feedback.',
    flow: [
      { name: 'Message intake', detail: 'Receive inquiries and persist records' },
      { name: 'Scenario routing', detail: 'Rules, classification, and context' },
      { name: 'Knowledge retrieval', detail: 'Relevance scores and thresholds' },
      { name: 'Reply & feedback', detail: 'Citations, calls, and operational records' }
    ],
    decisions: [
      {
        title: 'Record the task before asynchronous processing',
        problem: 'Message intake and model calls run at different speeds. After a failure, the system also needs to know which state the task reached.',
        choice: 'The system receives messages through RabbitMQ, persists processing records, and invokes the model asynchronously. Duplicate-message checks, state-conditioned retries, and timeout cleanup manage the task lifecycle.',
        benefit: 'Gives intake and generation their own records, with state evidence for diagnosis and retries beyond the result of a single request.'
      },
      {
        title: 'Route with business context',
        problem: 'Classifying only the latest sentence can miss the support ticket’s background and differences between business scenarios.',
        choice: 'The routing pipeline combines rules, model classification, and knowledge retrieval in stages, with bounded context organized by support ticket. Routes support clarification, status queries, and human handoff.',
        benefit: 'Uses business information in routing while keeping the decisions for different scenarios understandable and traceable.'
      },
      {
        title: 'Keep the evidence behind each answer',
        problem: 'The final reply alone cannot explain its source or why a particular model call produced an unsuitable result.',
        choice: 'The system integrates the Bailian knowledge base and uses retrieval scores and thresholds to inform replies. It retains routes, cited passages, prompt versions, model and token information, and operational feedback.',
        benefit: 'Makes it possible to trace issues through citations, prompts, and model calls, providing concrete material for evaluation and improvement.'
      }
    ],
    checks: [
      'Do duplicate messages, timed-out tasks, and failed retries follow the correct state-dependent paths?',
      'Do missing knowledge, retrieval failures, and insufficient context lead to appropriate routing or feedback?',
      'Can an answer be traced to its knowledge citations, prompt version, and model call?'
    ],
    outcome: 'Connects inquiry handling, knowledge evidence, and operational feedback to support traceable evaluation and iteration.',
    responsibility: 'Contributed to support-message processing and routing, using business context to distinguish scenarios. Work included failure retries, timeout-state cleanup, and duplicate-submission controls.',
    tags: ['Java 17', 'Spring Boot 3', 'LangChain4j', 'RabbitMQ', 'PostgreSQL', 'RAG / Bailian']
  },
  messaging: {
    title: 'Enterprise Customer Messaging Platform',
    meta: 'Qifu Technology (奇富科技) · Architecture & core development · 2020.05 — 2024.07',
    thesis: 'My focus was the connection between asynchronous requests, business rules, and delivery channels.',
    context: 'Business teams needed to reach customers through IVR, SMS, push notifications, and automated calls. Request bursts, filtering rules, and provider constraints required a platform that could buffer demand, coordinate validation, and handle channel differences. Clear responsibilities were central to adding business use cases and providers over time.',
    flow: [
      { name: 'Request intake', detail: 'Asynchronous Kafka processing' },
      { name: 'Business rules', detail: 'Filtering, rate limits, and validation' },
      { name: 'Channel strategy', detail: 'Channel and provider selection' },
      { name: 'Delivery handling', detail: 'Provider integration and exceptions' }
    ],
    decisions: [
      {
        title: 'Buffer requests at the platform boundary',
        problem: 'Requests could arrive in bursts, while downstream channels had their own processing rates and integration limits.',
        choice: 'Used Kafka to process messaging requests asynchronously, separating request acceptance from downstream execution to buffer concentrated traffic.',
        benefit: 'Accommodates differences in processing speed and defines where to inspect backlog, rate limits, and failure recovery.'
      },
      {
        title: 'Compose rules by responsibility',
        problem: 'Combining blocklists, traffic limits, phone-number resolution, and template requirements in one place would make rule changes difficult to manage.',
        choice: 'Led development of a rule engine using a chain of responsibility for blocklist filtering, rate limiting, phone-number resolution, batch splitting, and template validation, composed for each business scenario.',
        benefit: 'Makes each validation step and its change impact traceable, while allowing rules to be combined for new scenarios.'
      },
      {
        title: 'Contain provider differences in the channel layer',
        problem: 'Channels and SMS providers differed in carrier support, weights, quotas, and availability.',
        choice: 'The platform parses inputs by channel type and dispatches through channel strategies. SMS provider selection considers carrier, weight, and sending quota, with configured exception handling when no channel is available.',
        benefit: 'Keeps business-facing integration relatively consistent while assigning provider selection and failure details to the appropriate channel.'
      }
    ],
    checks: [
      'Can queue backlog, consumption rate, and channel quotas be examined together after a request burst?',
      'Do filtering, batch splitting, and template validation retain their intended semantics when rules are recomposed?',
      'Do exhausted provider quotas and unavailable channels lead to explicit exception-handling paths?'
    ],
    outcome: 'Separated traffic handling, rules, and provider differences into an extensible structure for additional business use cases and messaging channels.',
    responsibility: 'Responsible for platform architecture and core development. Led the rule engine, integrated third-party messaging services, and handled channel integration and push-delivery issues.',
    tags: ['Java', 'Kafka', 'Chain of responsibility', 'Channel strategies', 'Asynchronous processing', 'Multiple providers']
  },
  dify: {
    title: 'Dify Self-Service Assistant for Operations',
    meta: 'Qifu Technology (奇富科技) · Project contributor · 2025.05 — 2026.03',
    thesis: 'The aim was to let operations ask a bot for the data and status checks they routinely needed.',
    context: 'Operations staff frequently needed engineering help to look up data, statuses, and business rules. Answers were spread across internal APIs and systems. The project used Dify to turn natural-language questions into executable query workflows and brought them into 360Teams, where staff could ask through an existing communication tool.',
    flow: [
      { name: 'Operations question', detail: '360Teams bot' },
      { name: 'Question understanding', detail: 'Intent recognition and parameter extraction' },
      { name: 'Business query', detail: 'Calls to existing internal APIs' },
      { name: 'Response assembly', detail: 'Answers based on query results' }
    ],
    decisions: [
      {
        title: 'Turn a question into distinct execution steps',
        problem: 'Operations staff describe a business question; internal APIs require a specific operation and explicit parameters.',
        choice: 'The project used Dify to orchestrate intent recognition, parameter extraction, internal API calls, and response assembly as separate workflow steps.',
        benefit: 'Allows language understanding and business execution to be inspected separately, helping locate errors in intent, parameters, or query results.'
      },
      {
        title: 'Use business APIs as the source of facts',
        problem: 'Data, statuses, and rules each have their own sources. Language understanding must connect to those business facts.',
        choice: 'Workflows pass extracted business parameters to existing internal APIs and compose replies from the returned results, covering routine operations queries.',
        benefit: 'Connects natural-language requests to executable queries while keeping each answer tied to a result that can be checked.'
      },
      {
        title: 'Bring the workflow into an existing work channel',
        problem: 'Even a usable query tool adds friction if staff must search across systems to find the right entry point.',
        choice: 'The project integrated a 360Teams bot so operations staff could ask questions directly, bringing data lookups, status checks, and rule queries into their everyday communication tool.',
        benefit: 'Shortens the path from asking a question to starting a query and fits the workflow around existing work habits.'
      }
    ],
    checks: [
      'Can the workflow identify information that needs clarification when a question or its parameters are incomplete?',
      'Are API permissions, error responses, and empty results included in pre-release acceptance checks?',
      'Does the answer agree with the business API response, and can that source be checked?'
    ],
    outcome: 'Organizes common business queries into executable workflows, connecting a natural-language entry point with internal APIs and everyday operations work.',
    responsibility: 'Contributed to the operations self-service query project, working with the team on routine data, status, and business-rule lookup scenarios.',
    tags: ['Dify', 'Intent recognition', 'Parameter extraction', 'Business APIs', 'Workflow orchestration', '360Teams']
  }
};
