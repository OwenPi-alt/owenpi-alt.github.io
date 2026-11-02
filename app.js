(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealElements.forEach(element => observer.observe(element));
    document.documentElement.classList.add('motion-ready');
  }

  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');
  const setMenu = open => {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
    mobileNav.hidden = !open;
  };
  menuButton.addEventListener('click', () => setMenu(mobileNav.hidden));
  mobileNav.addEventListener('click', event => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileNav.hidden) {
      setMenu(false);
      menuButton.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header') && !mobileNav.hidden) setMenu(false);
  });
  window.matchMedia('(min-width: 651px)').addEventListener('change', event => {
    if (event.matches) setMenu(false);
  });

  const graphModes = {
    backend: { core: 'Java', caption: 'THE CORE', nodes: ['Spring Boot', 'Microservices', 'Kafka', 'Redis', 'Docker', 'MySQL'], description: '以 Java 为核心，连接服务、数据与交付。' },
    fullstack: { core: 'Web', caption: 'END TO END', nodes: ['Vue', 'Java API', '业务流程', 'MySQL', 'Docker', 'Python'], description: '从交互页面、业务接口，到数据和部署，贯通产品交付。' },
    ai: { core: 'AI', caption: 'INTO BUSINESS', nodes: ['LangChain4j', 'RAG', '任务编排', '百炼知识库', 'Dify', 'FFmpeg'], description: '连接知识、模型与内容工作流，关注过程可控与结果可追踪。' },
    quant: { core: 'Quant', caption: 'RESEARCH SYSTEM', nodes: ['LEAN / C#', '策略信号', 'Python', '风险规则', '成本账本', '研究报告'], description: '策略、账本与验证分层，让研究结果能够解释和复现。' }
  };
  document.querySelectorAll('[data-graph]').forEach(button => {
    button.addEventListener('click', () => {
      const mode = graphModes[button.dataset.graph];
      document.querySelectorAll('[data-graph]').forEach(other => {
        const active = other === button;
        other.classList.toggle('active', active);
        other.setAttribute('aria-pressed', String(active));
      });
      document.querySelector('#graph-stage').dataset.mode = button.dataset.graph;
      document.querySelector('#core-label').textContent = mode.core;
      document.querySelector('#core-caption').textContent = mode.caption;
      document.querySelector('#graph-description').textContent = mode.description;
      mode.nodes.forEach((text, index) => { document.querySelector(`#node-${index + 1}`).textContent = text; });
    });
  });

  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(other => {
        const active = other === button;
        other.classList.toggle('active', active);
        other.setAttribute('aria-pressed', String(active));
      });
      let visibleCount = 0;
      document.querySelectorAll('.project-card').forEach(card => {
        const visible = button.dataset.filter === 'all' || card.dataset.category === button.dataset.filter;
        card.hidden = !visible;
        if (visible) {
          card.classList.add('visible');
          visibleCount += 1;
        }
      });
      document.querySelector('.result-count').textContent = `${visibleCount} 个案例`;
    });
  });

  const projects = {
    commerce: {
      title: '餐饮订单与支付系统', meta: '百味云 · 资深软件工程师 / 技术组长 · 2016.10 — 2018.04',
      context: '围绕云小二、云掌柜的餐饮业务，组织订单处理、支付接入和终端消息通知，让前台操作能够进入完整的业务流程。',
      decisions: ['以订单模块组织核心业务流程，梳理订单与支付网关之间的职责，并参与风控模块协作。', '使用 Netty 长连接与极光 Push 推送订单消息，将订单处理与终端触达分开考虑。', '系统通知链路结合应用回执、有限重推与重复控制处理未确认消息，区分服务端处理与终端反馈。'],
      responsibility: '负责云小二、云掌柜的架构搭建与核心开发，主导订单模块，承担支付网关开发并参与风控模块。',
      tags: ['业务架构', '订单模块', '支付网关', 'Netty', '极光 Push', '消息通知']
    },
    aigc: {
      title: 'AIGC 内容生产工作流', meta: '个人研发 · AI 协作 · 离线工程原型',
      context: '内容生产往往包含多轮生成、重试、审核和剪辑。这个原型将镜头任务、预算、文件版本与审核记录组织成持久化流程，验证复杂生成任务的工程控制方式。',
      decisions: ['状态先持久化：用 SQLite WAL 记录任务、尝试与审计事件。提交结果未知时进入恢复或对账状态，避免将超时直接当作失败重提。', '预算进入调度：在事务中完成预算检查与预占，使用整数记账；重试次数跨版本累计，保留质检淘汰任务的模拟费用。', '技术质检与内容审核分开：FFmpeg / ffprobe 检查时长、尺寸、音轨、黑帧和冻结；审核记录绑定请求与资产版本，条件变化后旧审核失效。'],
      responsibilityLabel: '研发范围',
      responsibility: 'AI 协作完成的个人工程原型，覆盖任务台账、恢复、技术质检与剪辑验证。展示重点是流程编排和工程约束设计。',
      stage: '已完成离线流程与模拟供应商验证；真实模型接入与生成质量评估属于后续集成阶段。',
      tags: ['Python', 'SQLite WAL', 'FFmpeg / ffprobe', '状态机', '预算预占', '任务恢复']
    },
    quant: {
      title: '量化策略研究与回测框架', meta: '个人研究 · AI 协作 · Quant Research Engineering',
      context: '将行情数据、策略信号、成本假设和资金变化放进可核对的研究流程，关注结果能否复现、费用是否正确计入、风险规则是否真实作用于账本。',
      decisions: ['信号与账本解耦：LEAN / C# 生成结构化策略信号，独立 Python 账本模拟资金与成交路径，并逐行交叉核对信号输出。', '成本与风险使用一致资金模型：区分交易权益、净权益、现金扣款与收益归因，将手续费、滑点、资金费与结算纳入账本，风险控制基于扣费后净权益。', '结果可以复现：保留交易明细、决策原因、费用与风险记录，通过输入、代码与输出哈希及逐笔对账追踪结果来源。'],
      responsibilityLabel: '研发范围',
      responsibility: 'AI 协作完成的个人量化研究原型，覆盖信号计算、独立资金账本、风险规则、结果核对与 HTML 研究报告。',
      stage: '当前为研究与模拟回测框架，尚未接入券商账户或实盘下单；此处展示软件工程能力与研究方法。',
      tags: ['C# / LEAN', 'Python', '回测引擎', '成本账本', '风险约束', '可复现研究']
    },
    telemarketing: {
      title: '电销系统架构改造', meta: '奇富科技 · 开发 Leader · 2018.04 — 2026.03',
      context: '面向人工和机器人外呼业务，原单体系统出现锁竞争、超时与 OOM，需要同时处理架构演进和运行稳定性问题。',
      decisions: ['主导单体应用向微服务拆分，梳理服务职责，支撑业务继续迭代。', '引入 XXL-JOB 管理分布式任务，通过 Apollo 统一配置。', '围绕并发访问中的锁竞争与超时，调整 JVM 参数，优化 SQL 索引与 Redis 缓存，并进行冷热数据分离。'],
      responsibility: '承担技术方案、核心开发和团队交付，协同产品、测试与运维处理迭代和线上问题。',
      tags: ['Java', '微服务', 'JVM', 'MySQL', 'Redis', 'XXL-JOB', 'Apollo']
    },
    'customer-ai': {
      title: 'AI 客服与知识检索平台', meta: '奇富科技 · 参与咨询消息与路由模块开发',
      context: '面向用户咨询和运营客服，结合业务上下文与知识库生成建议答复，支持信息澄清、状态查询和人工分流。',
      decisions: ['通过 RabbitMQ 接收咨询消息，保存处理记录，再异步调用模型并写回回复。', '接入百炼知识库，结合检索得分与命中阈值组织答复。', '保存引用片段、Prompt 版本和模型调用信息，为问题追踪和运营反馈提供依据。'],
      responsibility: '参与咨询消息与路由模块开发，结合业务上下文区分咨询场景。项目经历涉及失败重试、超时状态清理与重复提交控制。',
      tags: ['Java 17', 'Spring Boot 3', 'LangChain4j', 'RabbitMQ', 'PostgreSQL', 'RAG']
    },
    messaging: {
      title: '集团营销触达平台', meta: '奇富科技 · 架构与核心开发 · 2020.05 — 2024.07',
      context: '为集团业务提供 IVR、短信、Push、机器人等触达渠道，处理集中请求与多种渠道的接入差异。',
      decisions: ['用 Kafka 异步处理触达请求，缓解集中流量对下游服务的冲击。', '主导规则引擎开发，以责任链组织黑名单过滤、流量限流、手机号获取、批次拆分与模板校验。', '对接第三方消息服务，处理渠道接入与推送问题。'],
      responsibility: '负责平台架构与核心开发，主导规则引擎开发，并处理渠道接入中的技术问题。',
      tags: ['Java', 'Kafka', '责任链', '异步处理', '多渠道接入']
    },
    dify: {
      title: 'Dify 运营自助答疑', meta: '奇富科技 · 参与项目建设 · 2025.05 — 2026.03',
      context: '运营频繁请求研发查数据、查状态和查规则，项目通过问答入口连接已有业务接口，让查询进入自助流程。',
      decisions: ['使用 Dify 编排意图识别、参数抽取、内部接口调用和结果回复。', '接入 360Teams 机器人，供运营通过日常沟通工具直接提问。', '围绕数据、状态和规则查询组织问答流程。'],
      responsibility: '参与运营自助查询项目建设，围绕运营日常的数据、状态与规则查询场景协作推进。',
      tags: ['Dify', '工作流', '业务 API', '360Teams']
    }
  };
  const dialog = document.querySelector('#project-dialog');
  const dialogContent = document.querySelector('#dialog-content');
  let dialogTrigger;
  const appendText = (tag, text, className) => {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  document.querySelectorAll('[data-project]').forEach(button => {
    button.addEventListener('click', () => {
      const project = projects[button.dataset.project];
      if (!project) return;
      dialogTrigger = button;
      dialogContent.replaceChildren();
      const title = appendText('h2', project.title);
      title.id = 'dialog-title';
      dialogContent.append(title, appendText('p', project.meta, 'dialog-meta'));
      for (const [heading, content] of [['问题与场景', project.context], ['架构取舍与实现', project.decisions], [project.responsibilityLabel || '我的职责', project.responsibility]]) {
        const block = appendText('section', '', 'dialog-block');
        block.append(appendText('h3', heading));
        if (Array.isArray(content)) {
          const list = document.createElement('ul');
          content.forEach(item => list.append(appendText('li', item)));
          block.append(list);
        } else {
          block.append(appendText('p', content));
        }
        dialogContent.append(block);
      }
      if (project.stage) {
        const stage = appendText('div', '', 'dialog-stage');
        stage.append(appendText('strong', '当前阶段'), appendText('p', project.stage));
        dialogContent.append(stage);
      }
      const tags = appendText('div', '', 'tags');
      project.tags.forEach(tag => tags.append(appendText('span', tag)));
      dialogContent.append(tags);
      dialog.showModal();
      document.body.classList.add('dialog-open');
      dialog.scrollTop = 0;
    });
  });
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    dialogTrigger?.focus({ preventScroll: true });
  });

  document.querySelector('#copy-email').addEventListener('click', async () => {
    const email = document.querySelector('#contact-email').textContent.trim();
    const status = document.querySelector('#copy-status');
    try {
      await navigator.clipboard.writeText(email);
      status.textContent = '邮箱已复制，欢迎发送项目需求。';
    } catch {
      status.textContent = `请复制邮箱：${email}`;
    }
  });
  document.querySelector('#copy-link').addEventListener('click', async () => {
    const url = document.querySelector('link[rel="canonical"]').href;
    const status = document.querySelector('#copy-status');
    try {
      await navigator.clipboard.writeText(url);
      status.textContent = '主页链接已复制，可以分享了。';
    } catch {
      status.textContent = `请复制这个地址：${url}`;
    }
  });
  document.querySelector('#year').textContent = new Date().getFullYear();

  if ('IntersectionObserver' in window) {
    const navLinks = [...document.querySelectorAll('.desktop-nav a')];
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-18% 0px -65% 0px' });
    document.querySelectorAll('#home, #services, #about, #projects, #stack, #delivery, #experience, #contact').forEach(section => sectionObserver.observe(section));
  }
})();
