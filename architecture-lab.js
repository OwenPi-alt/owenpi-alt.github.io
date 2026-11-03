(() => {
  'use strict';
  const root = document.querySelector('#architecture');
  if (!root) return;
  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en');
  if (isEnglish && !window.PORTFOLIO_ARCHITECTURE_SCENARIOS) return;

  const scenarios = {
    business: {
      accent: 'lime', code: '01 / BUSINESS SYSTEMS',
      title: '从收到请求，到知道事情办得怎么样。',
      description: '从业务入口到最终反馈，逐层明确职责、状态和失败后的处理方式。',
      steps: [
        { code: 'ENTRY', name: '业务入口', hint: '契约 / 状态 / 标识', title: '先定义成功，再接入流量。', detail: '收到请求、处理完成与终端确认，是三个不同的状态。先把状态含义、业务标识与接口边界说清楚，后面的重试和追踪才有依据。', checks: ['什么算接收成功，什么算业务完成？', '重复请求如何识别，状态从哪里查询？', '一次请求如何关联到后续处理记录？'] },
        { code: 'RULES', name: '规则与边界', hint: '校验 / 限流 / 路由', title: '把变化留在规则里，把职责留在边界内。', detail: '黑名单、频次、模板和渠道选择各有自己的变化节奏。将规则组织为独立职责，明确输入、输出与中止条件，才能知道请求为什么被拦截、下一步应该交给谁。', checks: ['规则之间是否存在顺序或数据依赖？', '拒绝原因能否清晰反馈给调用方？', '新增一个渠道，会影响哪些现有模块？'] },
        { code: 'ASYNC', name: '异步执行', hint: '解耦 / 重试 / 补偿', title: '异步缓解耦合，也带来状态责任。', detail: '消息队列把请求入口与下游处理分开，但失败并不会因此消失。设计时要继续追问重复消费、处理超时、补偿边界和积压如何被发现，让重试始终有条件、有记录。', checks: ['重复消费会不会重复执行关键业务？', '失败后是重试、补偿，还是转人工处理？', '积压在哪里可见，如何控制继续进入的流量？'] },
        { code: 'FEEDBACK', name: '结果与回执', hint: '追踪 / 确认 / 闭环', title: '系统发出消息，不等于终端完成动作。', detail: '把请求状态、服务处理记录和终端回执分开观察。对未确认的结果采取有限重推与核对，保留失败原因，让业务人员能够判断下一步操作。', checks: ['已发送、已送达和已完成是否区分？', '回执缺失时，如何核对真实业务状态？', '重推次数是否受控，历史尝试能否追查？'] }
      ]
    },
    aigc: {
      accent: 'mint', code: '02 / AIGC WORKFLOW',
      title: '生成中断了，下一步怎么处理？',
      description: '以离线工程原型为线索，拆解预算、任务状态、媒体质检和审核版本之间的关系。',
      steps: [
        { code: 'PLAN', name: '任务与预算', hint: '镜头 / 版本 / 预占', title: '预算进入调度，成本才有控制边界。', detail: '在启动任务前记录镜头版本、请求内容与预算预占。将成本检查与状态变化放进同一事务，才能讨论多个任务并发执行时，预算是否会被重复使用。', checks: ['项目与单集预算是否同时检查？', '修改提示词后，重试次数是否继续累计？', '未完成任务的预算占用是否仍被保留？'] },
        { code: 'RECOVER', name: '提交与恢复', hint: '未知状态 / 核对 / 恢复', title: '结果未知时，先查清楚发生了什么。', detail: '超时可能发生在提交之前，也可能发生在供应商已经受理之后。原型将未知提交状态与普通失败区分，保留尝试记录和预算占用，再进入查询或对账流程。', checks: ['是否能区分未提交与提交结果未知？', '已有任务标识时，能否继续查询结果？', '恢复流程会不会盲目重复提交？'] },
        { code: 'QUALITY', name: '质检与审核', hint: '技术检测 / 内容判断', title: '素材能播放，只是验收的第一层。', detail: '技术检测关注尺寸、时长、音轨、黑帧与冻结；内容审核关注人物、连续性与表达。审核记录应绑定当前素材和上下文，避免新素材沿用旧版本的通过结论。', checks: ['检测结果对应哪一份具体媒体文件？', '素材或验收条件变化，旧审核会不会失效？', '技术合格与内容合格是否分别记录？'] },
        { code: 'ASSEMBLE', name: '剪辑与交付', hint: '镜序 / 声音 / 字幕', title: '从单个镜头，走到可核对的成片。', detail: '在组装前再次核对素材版本与验收结果，随后处理镜序、音轨和字幕。最终输出保留来源关联，方便定位问题镜头与重新组装，避免返工时从头开始。', checks: ['进入剪辑的是否为通过审核的当前版本？', '音轨、字幕和视频时长能否对齐？', '替换一个镜头后，哪些验收需要重新执行？'] }
      ]
    },
    quant: {
      accent: 'blue', code: '03 / QUANT RESEARCH',
      title: '回测结果出来以后，还要检查什么？',
      description: '以研究与模拟回测框架为线索，梳理信号、执行假设、成本、风控与验证的边界。',
      steps: [
        { code: 'SIGNAL', name: '数据与信号', hint: '时间口径 / 信号核对', title: '先说清楚信号在什么时候真正可见。', detail: '数据时间、已完成的行情窗口和可执行时点，会直接改变研究结果。信号计算与资金模拟分开，并通过独立计算方法核对信号，便于发现窗口或时序差异。', checks: ['是否只使用当时可获得的数据？', '信号时间与模拟成交时间如何对应？', '同一输入能否得到一致的策略信号？'] },
        { code: 'LEDGER', name: '执行与账本', hint: '成交假设 / 结算 / 现金', title: '每一次资金变化，都应当落到账上。', detail: '策略信号进入独立账本后，还需要结合成交假设、手续费、滑点和结算规则。区分可用现金、交易权益与项目净权益，避免只在报告中扣成本而不影响真实模拟路径。', checks: ['费用扣除是否真的减少可用资金？', '资金费、结算和股息是否各有记录？', '逐笔记录汇总是否等于总账变化？'] },
        { code: 'RISK', name: '风险约束', hint: '净权益 / 风险预算 / 暂停', title: '风控要约束决策，也要约束资金模型。', detail: '如果风险检查与结果报表使用不同的权益定义，控制规则就可能失真。将扣费后净权益用于风险判断，记录暂停和退出的原因，检查约束是否影响了后续入场。', checks: ['风险规则依据的是哪一种权益口径？', '暂停期间是否还会增加新的风险敞口？', '风险触发记录能否关联到具体决策？'] },
        { code: 'VERIFY', name: '结果与复现', hint: '逐笔对账 / 哈希 / 报告', title: '一份研究报告，应该能够被重新算出来。', detail: '冻结输入、代码版本与关键假设，保留交易、费用和决策明细。用哈希与逐笔核对证明结果对应哪次运行，再讨论不同方案之间的差异。', checks: ['输入、代码与输出能否对应同一版本？', '逐笔盈亏与汇总指标是否一致？', '改变成本假设后，结论是否仍然成立？'] }
      ]
    }
  };
  if (isEnglish) Object.assign(scenarios, window.PORTFOLIO_ARCHITECTURE_SCENARIOS);

  const tabs = [...root.querySelectorAll('[data-lab]')];
  const panel = root.querySelector('#architecture-panel');
  const flow = root.querySelector('.lab-flow');
  const inspector = root.querySelector('.lab-inspector');
  let activeKey = 'business';
  const element = (tag, text, className) => {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    return node;
  };

  const selectStep = index => {
    const step = scenarios[activeKey].steps[index];
    flow.querySelectorAll('button').forEach((button, i) => {
      button.classList.toggle('active', index === i);
      button.setAttribute('aria-pressed', String(index === i));
    });
    const list = element('ul', '', 'lab-checks');
    step.checks.forEach(text => list.append(element('li', text)));
    inspector.replaceChildren(element('span', `DESIGN DECISION / 0${index + 1}`, 'lab-focus-label'), element('h4', step.title), element('p', step.detail), list);
  };

  const selectScenario = key => {
    const scenario = scenarios[key];
    activeKey = key;
    tabs.forEach(tab => {
      const active = tab.dataset.lab === key;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', `lab-tab-${key}`);
    panel.dataset.accent = scenario.accent;
    root.querySelector('#lab-code').textContent = scenario.code;
    root.querySelector('#lab-title').textContent = scenario.title;
    root.querySelector('#lab-description').textContent = scenario.description;
    flow.replaceChildren();
    scenario.steps.forEach((step, index) => {
      const button = element('button', '', 'lab-step');
      button.type = 'button';
      button.dataset.step = String(index);
      const arrow = element('span', index === 3 ? '↗' : '→', 'step-arrow');
      arrow.setAttribute('aria-hidden', 'true');
      button.append(element('span', `0${index + 1} / ${step.code}`, 'step-kicker'), element('strong', step.name), element('small', step.hint), arrow);
      button.addEventListener('click', () => selectStep(index));
      flow.append(button);
    });
    selectStep(0);
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectScenario(tab.dataset.lab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      tabs[next].focus();
      selectScenario(tabs[next].dataset.lab);
    });
  });
  selectScenario('business');
})();
