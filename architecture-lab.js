(() => {
  'use strict';
  const root = document.querySelector('#architecture');
  if (!root) return;
  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en');
  if (isEnglish && !window.PORTFOLIO_ARCHITECTURE_SCENARIOS) return;

  const scenarios = {
    business: {
      accent: 'lime', code: '01 / BUSINESS SYSTEMS',
      title: '请求进来以后，怎样确认处理结果？',
      description: '设计推演：以订单通知和营销触达为例，检查请求受理、规则处理、异步执行和终端回执。',
      steps: [
        { code: 'ENTRY', name: '业务入口', hint: '受理 / 完成 / 业务标识', title: '接口返回成功，具体指哪一步？', detail: '收到请求、业务处理完成和终端确认需要分别记录。设计接口时先约定成功响应的含义，并让业务标识关联后续任务。否则调用方超时重试时，很难判断原请求是否已经执行。', checks: ['什么算接收成功，什么算业务完成？', '重复请求如何识别，状态从哪里查询？', '一次请求如何关联到后续处理记录？'] },
        { code: 'RULES', name: '规则与路由', hint: '校验 / 限流 / 路由', title: '规则拆开后，还要检查执行顺序。', detail: '黑名单、频次、模板校验和渠道选择可以分别维护，但不一定能够随意调换顺序。需要检查规则之间的数据依赖、中止条件和拒绝原因，新增渠道时也要确认哪些已有规则仍然适用。', checks: ['规则之间是否存在顺序或数据依赖？', '拒绝原因能否清晰反馈给调用方？', '新增一个渠道，会影响哪些现有模块？'] },
        { code: 'ASYNC', name: '异步执行', hint: '队列 / 重试 / 补偿', title: '队列暂存请求，失败还需要单独处理。', detail: '消息队列允许入口与下游按不同速度处理，但不能消除重复消费、超时和积压。设计中需要明确哪些操作可重试、何时停止，以及如何观察消费速度与渠道处理能力的差距。', checks: ['重复消费会不会重复执行关键业务？', '失败后是重试、补偿，还是转人工处理？', '积压在哪里可见，如何控制继续进入的流量？'] },
        { code: 'FEEDBACK', name: '结果与回执', hint: '发送 / 回执 / 重推', title: '发出通知之后，继续检查回执。', detail: '请求状态、服务处理记录和终端回执分别提供不同的信息。缺少回执时可有限重推并核对业务状态；不能仅凭发送成功，就认定终端已完成打印或其他操作。', checks: ['已发送、已送达和已完成是否区分？', '回执缺失时，如何核对真实业务状态？', '重推次数是否受控，历史尝试能否追查？'] }
      ]
    },
    aigc: {
      accent: 'mint', code: '02 / AIGC WORKFLOW',
      title: '生成中断了，下一步怎么处理？',
      description: 'AI 协作的个人离线原型：用模拟供应商检查任务恢复和预算记账，用本地素材验证质检与剪辑流程。',
      steps: [
        { code: 'PLAN', name: '任务与预算', hint: '镜头 / 版本 / 预占', title: '启动任务前，在事务内检查并预占预算。', detail: '记录镜头版本与请求，将预算检查和预占放进同一事务，防止并发任务重复使用剩余额度。原型使用模拟费用检查这套记账规则，结果未知的尝试继续保留预占。', checks: ['项目与单集预算是否同时检查？', '修改提示词后，重试次数是否继续累计？', '未完成任务的预算占用是否仍被保留？'] },
        { code: 'RECOVER', name: '提交与恢复', hint: '未知状态 / 核对 / 恢复', title: '请求超时后，先查已有尝试。', detail: '模拟供应商用于构造受理前后超时的情况。提交结果未知时保留尝试记录和预算预占；已有任务标识则继续查询，无明确结果则进入对账流程。真实供应商的行为还需要接入验证。', checks: ['是否能区分未提交与提交结果未知？', '已有任务标识时，能否继续查询结果？', '恢复流程会不会盲目重复提交？'] },
        { code: 'QUALITY', name: '质检与审核', hint: '技术检测 / 内容判断', title: '换了素材，旧审核还能用吗？', detail: '技术检测检查尺寸、时长、音轨、黑帧与冻结。内容审核另行记录人物、连续性与表达判断，并关联具体文件和验收上下文。原型验证审核失效机制，生成内容的实际质量仍待评估。', checks: ['检测结果对应哪一份具体媒体文件？', '素材或验收条件变化，旧审核会不会失效？', '技术合格与内容合格是否分别记录？'] },
        { code: 'ASSEMBLE', name: '剪辑与导出', hint: '镜序 / 声音 / 字幕', title: '剪辑前，再核对一次素材版本。', detail: '组装前核对文件版本与审核记录，再处理镜序、音轨和字幕。输出保留素材关联，替换镜头后可以定位需要重新组装和检查的部分；当前验证使用本地媒体。', checks: ['进入剪辑的是否为通过审核的当前版本？', '音轨、字幕和视频时长能否对齐？', '替换一个镜头后，哪些验收需要重新执行？'] }
      ]
    },
    quant: {
      accent: 'blue', code: '03 / QUANT RESEARCH',
      title: '回测结果出来以后，还要检查什么？',
      description: 'AI 协作的个人研究原型：从信号时间、模拟成交、费用和风险规则逐项检查回测，不接入实盘交易。',
      steps: [
        { code: 'SIGNAL', name: '数据与信号', hint: '时间口径 / 信号核对', title: '信号何时可见，何时允许模拟成交？', detail: '行情时间戳、窗口是否完成、允许成交的时点都会影响结果。将信号计算与资金模拟分开，再用独立计算核对信号，检查窗口错位和使用未来数据的可能。', checks: ['是否只使用当时可获得的数据？', '信号时间与模拟成交时间如何对应？', '同一输入能否得到一致的策略信号？'] },
        { code: 'LEDGER', name: '执行与账本', hint: '成交假设 / 结算 / 现金', title: '费用要影响账本中的可用资金。', detail: '信号进入独立账本后，按成交假设计算手续费、滑点和结算。可用现金、交易权益和净权益分别记账，检查成本是否进入后续资金计算，而不只出现在最终报表中。', checks: ['费用扣除是否真的减少可用资金？', '适用的资金费、结算和股息是否分别记录？', '逐笔记录汇总是否等于总账变化？'] },
        { code: 'RISK', name: '风险约束', hint: '净权益 / 风险预算 / 暂停', title: '扣费之后，再判断是否允许继续入场。', detail: '风险检查使用扣费后净权益，并记录暂停或退出的原因。验证时需要沿着后续交易检查：触发限制之后，账本是否仍接受新入场，是否继续增加风险敞口。', checks: ['风险规则依据的是哪一种权益口径？', '暂停期间是否还会增加新的风险敞口？', '风险触发记录能否关联到具体决策？'] },
        { code: 'VERIFY', name: '结果与复现', hint: '逐笔对账 / 哈希 / 报告', title: '保留运行条件，再核对逐笔结果。', detail: '保存输入、代码、参数和交易明细，用哈希标识对应版本。复现时重新计算并逐笔核对费用与资金变化；版本一致本身不能证明计算正确，也不能证明策略有效。', checks: ['输入、代码与输出能否对应同一版本？', '逐笔盈亏与汇总指标是否一致？', '改变成本假设后，结论是否仍然成立？'] }
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
