// Detailed case narratives. Business cases retain their confirmed role boundaries;
// lab cases describe AI-assisted personal research prototypes, not client or live-trading delivery.
window.PORTFOLIO_CASE_STUDIES = {
  commerce: {
    title: 'Restaurant Orders & Payments',
    meta: 'Baiweiyun (百味云) · Senior Software Engineer / Technical Team Lead · 2016.10 — 2018.04',
    thesis: 'An order can be processed while its notification is still waiting for a device acknowledgment.',
    context: 'Yunxiaoer and Yunzhanggui handled restaurant orders, payments, and store notifications. After an order was processed, store printers and staff still needed to be notified. Disconnections and missing acknowledgments required a decision about retries. I was responsible for architecture setup and core development; this case focuses on orders, payments, and notification handling.',
    flow: [
      { name: 'Business entry', detail: 'Orders and store operations' },
      { name: 'Order service', detail: 'Core business workflow' },
      { name: 'Payment integration', detail: 'Payment gateway connections' },
      { name: 'Device notification', detail: 'Persistent connections, push, and acknowledgments' }
    ],
    decisions: [
      {
        title: 'Separate order workflows from payment integration',
        problem: 'Orders, payments, and risk controls were closely connected. Mixing their responsibilities would make changes and integration work harder to contain.',
        choice: 'Used the order module to coordinate the core workflow, developed the payment gateway, and worked with the risk-control module, keeping business orchestration distinct from external channel integration.',
        benefit: 'Order changes and payment integrations have separate implementation points. Integration checks can examine business state and channel responses independently.'
      },
      {
        title: 'Use persistent connections first, with push as a fallback',
        problem: 'Completing an order did not establish whether the store or its staff had received the notification.',
        choice: 'The notification path consumes new-order messages through RabbitMQ, prioritizes Netty persistent connections, and uses JPush as a fallback for store printing and staff notifications.',
        benefit: 'Persistent connections provide the immediate path and push provides a fallback. Both still need application acknowledgments to establish delivery.'
      },
      {
        title: 'Retry unconfirmed notifications with duplicate controls',
        problem: 'Network changes and device availability could leave notifications unconfirmed, while retries from multiple nodes could create duplicates.',
        choice: 'The notification path uses application acknowledgments to trigger limited retries for unconfirmed orders, with Redis counters restricting repeated JPush notifications across nodes.',
        benefit: 'Missing acknowledgments can trigger limited retries, while Redis counters restrict repeated push attempts across nodes. Sending a notification still does not establish that printing finished.'
      }
    ],
    checks: [
      'Are successful order processing and confirmed device delivery represented as distinct states?',
      'Are retry limits and stopping conditions explicit when a device disconnects or an acknowledgment is missing?',
      'Are duplicate notifications controlled when multiple nodes process the same event?'
    ],
    outcome: 'Combined a persistent-connection-first notification path with push fallback, application acknowledgments, and Redis counters for unconfirmed orders.',
    responsibility: 'Responsible for architecture setup and core development of Yunxiaoer and Yunzhanggui. Led the order module, developed the payment gateway, and contributed to the risk-control module.',
    tags: ['Business architecture', 'Orders / Payments', 'RabbitMQ', 'Netty', 'Redis', 'JPush']
  },
  aigc: {
    title: 'AIGC Production Workflow',
    meta: 'Personal R&D · AI-assisted · Offline engineering prototype',
    thesis: 'When a generation request times out, how can the task recover without reserving the same budget twice?',
    context: 'This is an AI-assisted personal offline prototype. A mock provider simulates submission timeouts, interruptions, and repeated attempts to exercise recovery and budget accounting. Local media is used to check asset versions, review records, and edit assembly. Real provider calls and generated-content quality have not been evaluated.',
    flow: [
      { name: 'Shot ledger', detail: 'Versions, requests, and budgets' },
      { name: 'Simulated execution', detail: 'Submission, polling, and recovery' },
      { name: 'Quality review', detail: 'Technical checks tied to versions' },
      { name: 'Edit assembly', detail: 'Sequencing, mixing, and subtitles' }
    ],
    decisions: [
      {
        title: 'Record each attempt and handle unknown outcomes explicitly',
        problem: 'A request can time out after submission. Retrying immediately may execute the same task again.',
        choice: 'Stored shot versions, request hashes, attempt records, and audit events in SQLite WAL. When a submission outcome is unknown, the prototype retains the budget reservation and enters recovery or reconciliation.',
        benefit: 'Recovery inspects existing attempts before polling, reconciling, or submitting again. An unresolved request keeps its budget reservation.'
      },
      {
        title: 'Check and reserve budgets in one transaction',
        problem: 'Prompt changes, retries, and rejected media can leave cost reporting behind the actual number of attempts.',
        choice: 'Checked project and episode budgets and reserved funds atomically within a transaction, using integer accounting. Retry counts span versions, and attempts rejected by quality checks retain their simulated costs.',
        benefit: 'Concurrent tasks cannot each spend the same remaining budget. Revising a prompt does not reset the accumulated attempt count.'
      },
      {
        title: 'Recheck approvals when media changes',
        problem: 'Valid media files can still fail content review, and replacing an asset can invalidate an earlier approval.',
        choice: 'Used FFmpeg / ffprobe to check dimensions, duration, audio tracks, black frames, and freezes. Content reviews are bound to the request, file, and acceptance context; changes require a new review.',
        benefit: 'Technical checks and content reviews have separate records. Version checks before assembly prevent a new file from inheriting an old file’s approval.'
      }
    ],
    checks: [
      'After an interruption, can recovery distinguish submitted tasks, unknown outcomes, and tasks never submitted?',
      'Do prompt or media changes correctly affect retry limits and review validity?',
      'Do the files, versions, and approvals used in an edit refer to the same valid attempt?'
    ],
    outcome: 'Offline simulations cover unknown submissions, task recovery, budget reservations, and invalidated reviews, alongside local media checks and edit assembly.',
    responsibilityLabel: 'Research scope',
    responsibility: 'Developed with AI assistance to explore generation-task scheduling and failure handling: task records, recovery logic, simulated budget accounting, technical media checks, and edit validation.',
    stage: 'Offline workflow and mock-provider validation are complete. Real providers and generated-content quality have not been evaluated, and the prototype has not been used for commercial delivery.',
    tags: ['Python', 'SQLite WAL', 'FFmpeg / ffprobe', 'State machines', 'Budget reservations', 'Task recovery']
  },
  quant: {
    title: 'Quant Research & Backtesting',
    meta: 'Personal research · AI-assisted · Simulated backtesting prototype',
    thesis: 'Reconcile signals, costs, and cash movements before interpreting a backtest.',
    context: 'This is an AI-assisted personal research prototype. LEAN / C# calculates signals, while an independent Python ledger simulates fills and cash movements. Transaction records are used to check the effects of costs and risk rules. The work focuses on finding calculation discrepancies and preserving experiment conditions; a return chart alone does not establish that a strategy works.',
    flow: [
      { name: 'Market data & signals', detail: 'LEAN / C# calculations' },
      { name: 'Independent ledger', detail: 'Python execution simulation' },
      { name: 'Costs & risk', detail: 'Fees, cash, and constraints' },
      { name: 'Reconciliation', detail: 'Trade records and research reports' }
    ],
    decisions: [
      {
        title: 'Check signals and capital accounting separately',
        problem: 'An engine’s final statistics alone make it difficult to identify whether a discrepancy comes from signals, execution assumptions, or capital calculations.',
        choice: 'Exported structured strategy signals from LEAN / C# for an independent Python ledger to consume and simulate cash and execution. Separate window calculations support row-by-row reconciliation, while the signal stage places no orders.',
        benefit: 'Discrepancies can be investigated in signal windows, execution assumptions, and cash calculations separately. The signal stage places no orders.'
      },
      {
        title: 'Base risk checks on net equity after costs',
        problem: 'Deducting costs in a report without reflecting them in cash and risk decisions can distort research conclusions.',
        choice: 'Distinguished trading equity, net equity, actual cash deductions, and return attribution. The ledger includes commissions, slippage, funding fees, and settlement, with risk controls based on net equity after costs.',
        benefit: 'Costs affect subsequent available funds and risk decisions. Transaction records allow checks for omitted charges, duplicate charges, and incorrect attribution.'
      },
      {
        title: 'Keep inputs, code, and transaction records',
        problem: 'Summary charts alone cannot explain result changes when inputs, parameters, or code are revised.',
        choice: 'Retained individual trades, decision reasons, cost records, and risk events. Scripts connect signal validation, backtesting, and ledger acceptance checks, with hashes for inputs, code, and outputs.',
        benefit: 'A rerun can first check data and code versions, then use trade, cost, and decision records to locate differences.'
      }
    ],
    checks: [
      'Does row-by-row reconciliation reveal missing signals, alignment errors, or duplicate consumption?',
      'Do cost deductions and risk pauses actually change available cash, positions, and subsequent entries?',
      'Can the same inputs, code, and parameters reproduce both detailed records and aggregate results?'
    ],
    outcome: 'Checks strategy signals, simulated execution, and capital accounting separately, with transaction records and hashes identifying each experiment.',
    responsibilityLabel: 'Research scope',
    responsibility: 'An AI-assisted personal research prototype covering signal calculations, an independent capital ledger, risk rules, result reconciliation, and HTML research reports.',
    stage: 'Research and simulated backtesting only, with no brokerage connection or live orders. Backtest results do not establish future returns.',
    tags: ['C# / LEAN', 'Python', 'Independent capital ledger', 'Cost modeling', 'Risk rules', 'Reproducible research']
  },
  telemarketing: {
    title: 'Outbound Calling Platform Modernization',
    meta: 'Qifu Technology (奇富科技) · Development Lead · 2018.04 — 2026.03',
    thesis: 'The monolith needed service decomposition alongside fixes for lock contention, timeouts, and out-of-memory failures.',
    context: 'As manual and automated outbound calling evolved, the monolith encountered lock contention, timeouts, and out-of-memory failures. I led service decomposition and worked on JVM settings, SQL, caching, and hot/cold data separation. The system also uses parallel agent-tag queries. The migration had to preserve business rules and coordinate scheduling, configuration, and releases.',
    flow: [
      { name: 'Calling requests', detail: 'Manual and automated outbound calls' },
      { name: 'Rule validation', detail: 'Call restrictions, blocklists, and limits' },
      { name: 'Service coordination', detail: 'Business calls and task management' },
      { name: 'Data access', detail: 'Caching, queries, and hot/cold separation' }
    ],
    decisions: [
      {
        title: 'Split services while preserving business rules',
        problem: 'Responsibilities within the monolith affected one another, allowing pressure in one area to become a wider runtime problem.',
        choice: 'Led the move from a monolith to microservices and introduced XXL-JOB and Apollo for scheduling and configuration. A dedicated outbound validation service handles call restrictions, blocklists, and phone-number and frequency limits.',
        benefit: 'Outbound validation and business execution can be maintained separately. Rules, error responses, and restrictions still need to be checked after the split.'
      },
      {
        title: 'Query tags in parallel and retain partial results',
        problem: 'Agent-facing tag lookups depended on multiple downstream queries. Sequential waiting and individual failures could both affect result assembly.',
        choice: 'The tag-query path uses a bounded thread pool and CompletableFuture to fetch downstream results in parallel, retaining available information when an individual query fails.',
        benefit: 'Queries can run together, and available information can survive an individual failure. Pool capacity limits concurrency; slow dependencies still need separate checks.'
      },
      {
        title: 'Address memory, query access, and data volume separately',
        problem: 'Lock contention, slow queries, and memory pressure overlapped, so a single configuration adjustment could not address every cause.',
        choice: 'Tuned JVM settings for concurrent access, improved SQL indexes and Redis caching, and separated hot and cold data to address runtime behavior, query access, and data volume individually.',
        benefit: 'JVM settings, indexes, caching, and data separation act in different places. Each needs observation under comparable loads; one faster response does not establish an overall improvement.'
      }
    ],
    checks: [
      'Do business rules, error responses, and restrictions retain their semantics after service decomposition?',
      'Do thread usage and partial-result handling behave as intended when downstream services are slow or fail?',
      'Are JVM, SQL, cache, and hot/cold data changes evaluated under comparable loads?'
    ],
    outcome: 'Delivered service decomposition and scheduling and configuration integrations, with JVM, SQL, caching, and hot/cold data improvements.',
    responsibility: 'Led the monolith-to-microservices migration, covering technical design, core development, and team delivery. Worked with product, QA, and operations on releases and production issues.',
    tags: ['Java / Dubbo', 'Microservices', 'CompletableFuture', 'JVM', 'MySQL / Redis', 'XXL-JOB / Apollo']
  },
  'customer-ai': {
    title: 'AI Customer Support & Knowledge Retrieval',
    meta: 'Qifu Technology (奇富科技) · Contributor to message processing and routing · 2026',
    thesis: 'I contributed to support-message processing and routing based on business context.',
    context: 'Support inquiries need ticket context to choose among clarification, status queries, knowledge retrieval, and human handoff. The platform retains model calls and citations for answer investigation and operational feedback. My contributions were in message processing and routing; the following also describes the wider workflow those modules participate in.',
    flow: [
      { name: 'Message intake', detail: 'Receive inquiries and persist records' },
      { name: 'Scenario routing', detail: 'Rules, classification, and context' },
      { name: 'Knowledge retrieval', detail: 'Relevance scores and thresholds' },
      { name: 'Reply & feedback', detail: 'Citations, calls, and operational records' }
    ],
    decisions: [
      {
        title: 'Persist processing records before calling the model',
        problem: 'Message intake and model calls run at different speeds. After a failure, the system also needs to know which state the task reached.',
        choice: 'The system receives messages through RabbitMQ, persists processing records, and invokes the model asynchronously. Duplicate-message checks, state-conditioned retries, and timeout cleanup manage the task lifecycle.',
        benefit: 'After a model-call failure, task records help determine whether to retry or clear a timed-out state, beyond the response from a single request.'
      },
      {
        title: 'Organize context and routing by support ticket',
        problem: 'Classifying only the latest sentence can miss the support ticket’s background and differences between business scenarios.',
        choice: 'The routing pipeline combines rules, model classification, and knowledge retrieval in stages, with bounded context organized by support ticket. Routes support clarification, status queries, and human handoff.',
        benefit: 'Routing can use ticket history while retaining stage-by-stage decisions, helping locate classification or retrieval errors.'
      },
      {
        title: 'Retain citations, prompts, and model-call details',
        problem: 'The final reply alone cannot explain its source or why a particular model call produced an unsuitable result.',
        choice: 'The system integrates the Bailian knowledge base and uses retrieval scores and thresholds to inform replies. It retains routes, cited passages, prompt versions, model and token information, and operational feedback.',
        benefit: 'An answer can be checked against its cited passages, prompt, and model call to investigate whether an issue arose in retrieval or generation.'
      }
    ],
    checks: [
      'Do duplicate messages, timed-out tasks, and failed retries follow the correct state-dependent paths?',
      'Do missing knowledge, retrieval failures, and insufficient context lead to appropriate routing or feedback?',
      'Can an answer be traced to its knowledge citations, prompt version, and model call?'
    ],
    outcome: 'Contributed to support-message processing and scenario routing. The system uses ticket context and task state to handle duplicate messages, failure retries, and timeout cleanup.',
    responsibility: 'Contributed to support-message processing and routing, using business context to distinguish support scenarios.',
    tags: ['Java 17', 'Spring Boot 3', 'LangChain4j', 'RabbitMQ', 'PostgreSQL', 'RAG / Bailian']
  },
  messaging: {
    title: 'Enterprise Customer Messaging Platform',
    meta: 'Qifu Technology (奇富科技) · Architecture & core development · 2020.05 — 2024.07',
    thesis: 'Kafka accepts the requests, a rule chain validates them, and channel strategies handle dispatch.',
    context: 'Business teams used IVR, SMS, push notifications, and automated calls to reach customers. Requests could arrive in bursts, while channels had different quotas and processing rates. I was responsible for platform architecture and core development, focusing on asynchronous requests, rule composition, and provider integration.',
    flow: [
      { name: 'Request intake', detail: 'Asynchronous Kafka processing' },
      { name: 'Business rules', detail: 'Filtering, rate limits, and validation' },
      { name: 'Channel strategy', detail: 'Channel and provider selection' },
      { name: 'Delivery handling', detail: 'Provider integration and exceptions' }
    ],
    decisions: [
      {
        title: 'Buffer request bursts with Kafka',
        problem: 'Requests could arrive in bursts, while downstream channels had their own processing rates and integration limits.',
        choice: 'Used Kafka to process messaging requests asynchronously, separating request acceptance from downstream execution to buffer concentrated traffic.',
        benefit: 'Intake and channel delivery can proceed at different rates. A queue only buffers that difference; backlog and provider quotas still need to be checked against consumption capacity.'
      },
      {
        title: 'Compose validation with a chain of responsibility',
        problem: 'Combining blocklists, traffic limits, phone-number resolution, and template requirements in one place would make rule changes difficult to manage.',
        choice: 'Led development of a rule engine using a chain of responsibility for blocklist filtering, rate limiting, phone-number resolution, batch splitting, and template validation, composed for each business scenario.',
        benefit: 'Each scenario can select the rules it needs. Changes to the chain still require checks for ordering and data dependencies between number resolution, batch splitting, and template validation.'
      },
      {
        title: 'Select providers within the channel layer',
        problem: 'Channels and SMS providers differed in carrier support, weights, quotas, and availability.',
        choice: 'The platform parses inputs by channel type and dispatches through channel strategies. SMS provider selection considers carrier, weight, and sending quota, with configured exception handling when no channel is available.',
        benefit: 'Business callers submit requests by channel. Carrier matching, provider weights, and quota checks stay within the channel implementation.'
      }
    ],
    checks: [
      'Can queue backlog, consumption rate, and channel quotas be examined together after a request burst?',
      'Do filtering, batch splitting, and template validation retain their intended semantics when rules are recomposed?',
      'Do exhausted provider quotas and unavailable channels lead to explicit exception-handling paths?'
    ],
    outcome: 'Implemented asynchronous Kafka processing, a chain-of-responsibility rule engine, and channel integrations, with SMS provider selection based on carrier, weight, and quota.',
    responsibility: 'Responsible for platform architecture and core development. Led the rule engine, integrated third-party messaging services, and handled channel integration and push-delivery issues.',
    tags: ['Java', 'Kafka', 'Chain of responsibility', 'Channel strategies', 'Asynchronous processing', 'Multiple providers']
  },
  dify: {
    title: 'Dify Self-Service Assistant for Operations',
    meta: 'Qifu Technology (奇富科技) · Project contributor · 2025.05 — 2026.03',
    thesis: 'Let operations query internal systems from 360Teams by translating questions into API calls.',
    context: 'Operations staff regularly asked engineering to look up data, statuses, and business rules. I contributed to a project that used Dify to recognize intent, extract parameters, call existing internal APIs, and return results through a 360Teams bot. This case describes the project workflow; my role was as a contributor.',
    flow: [
      { name: 'Operations question', detail: '360Teams bot' },
      { name: 'Question understanding', detail: 'Intent recognition and parameter extraction' },
      { name: 'Business query', detail: 'Calls to existing internal APIs' },
      { name: 'Response assembly', detail: 'Answers based on query results' }
    ],
    decisions: [
      {
        title: 'Inspect intent, parameters, and API calls separately',
        problem: 'Operations staff describe a business question; internal APIs require a specific operation and explicit parameters.',
        choice: 'The project used Dify to orchestrate intent recognition, parameter extraction, internal API calls, and response assembly as separate steps.',
        benefit: 'When a query fails, the intent and parameters can be checked before examining the API response.'
      },
      {
        title: 'Build replies from internal API results',
        problem: 'Data, statuses, and rules each have their own sources. Language understanding must connect to those business facts.',
        choice: 'Workflows pass extracted business parameters to existing internal APIs and compose replies from the returned results, covering routine operations queries.',
        benefit: 'Business data in a reply has a corresponding API response, making it possible to check for misread or omitted values.'
      },
      {
        title: 'Provide the query entry point in 360Teams',
        problem: 'Even a usable query tool adds friction if staff must search across systems to find the right entry point.',
        choice: 'The project integrated a 360Teams bot so operations staff could ask questions directly, bringing data lookups, status checks, and rule queries into their everyday communication tool.',
        benefit: 'Operations staff can initiate these queries in their existing communication tool without finding a separate system entry point.'
      }
    ],
    checks: [
      'Can the workflow identify information that needs clarification when a question or its parameters are incomplete?',
      'Are API permissions, error responses, and empty results included in pre-release acceptance checks?',
      'Does the answer agree with the business API response, and can that source be checked?'
    ],
    outcome: 'The project combined intent recognition, parameter extraction, and internal API calls in Dify workflows for data, status, and rule queries through 360Teams.',
    responsibility: 'Contributed to the operations self-service query project, working with the team on routine data, status, and business-rule lookup scenarios.',
    tags: ['Dify', 'Intent recognition', 'Parameter extraction', 'Business APIs', 'Workflow orchestration', '360Teams']
  }
};
