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
    ai: { core: 'AI', caption: 'INTO BUSINESS', nodes: ['LangChain4j', 'RAG', 'RabbitMQ', '百炼知识库', 'Dify', 'PostgreSQL'], description: '让模型理解上下文，让知识检索进入业务流程。' }
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
      document.querySelector('.result-count').textContent = `${visibleCount} 个项目`;
    });
  });

  const projects = {
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
      for (const [heading, content] of [['业务场景', project.context], ['技术思路', project.decisions], ['我的职责', project.responsibility]]) {
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
    document.querySelectorAll('#home, #about, #projects, #stack, #experience, #contact').forEach(section => sectionObserver.observe(section));
  }
})();
