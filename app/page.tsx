"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";

const WHATSAPP_NUMBER = "79288496978";
const WHATSAPP_LABEL = "+7 928 849-69-78";

type QuizKey = "age" | "goal" | "format" | "need";
type QuizAnswers = Record<QuizKey, string>;

const quizSteps: Array<{ key: QuizKey; eyebrow: string; title: string; options: string[] }> = [
  { key: "age", eyebrow: "Шаг 1 из 4", title: "Сколько лет ребёнку?", options: ["3–4 года", "5–6 лет", "6–7 лет", "Младшая школа", "Другой возраст"] },
  { key: "goal", eyebrow: "Шаг 2 из 4", title: "Что сейчас важнее всего?", options: ["Подготовка к школе", "Развитие самостоятельности", "Помощь с чтением", "Продлёнка и присмотр", "Творчество", "Пока не знаю, нужна консультация"] },
  { key: "format", eyebrow: "Шаг 3 из 4", title: "Какой формат ближе?", options: ["Группа", "Индивидуальные занятия", "Утро", "День", "После школы", "Пока не знаю"] },
  { key: "need", eyebrow: "Шаг 4 из 4", title: "Что удобно получить первым?", options: ["Подходящее направление", "Расписание", "Стоимость", "Пробное занятие", "Консультацию специалиста"] },
];

const directions = [
  { number: "01", title: "Подготовка к школе", blurb: "Для знакомства с форматом обучения и спокойного перехода к школьным задачам.", tags: ["старший дошкольный возраст", "группа или индивидуально"], tone: "coral", icon: "Aa" },
  { number: "02", title: "Монтессори", blurb: "Среда, в которой ребёнок пробует, выбирает и постепенно учится действовать самостоятельно.", tags: ["дошкольный возраст", "практика и самостоятельность"], tone: "teal", icon: "◒" },
  { number: "03", title: "Скорочтение", blurb: "Направление, чтобы внимательнее посмотреть на чтение и подобрать понятный темп занятий.", tags: ["младшая школа", "индивидуальный подбор"], tone: "lavender", icon: "↗" },
  { number: "04", title: "Творчество", blurb: "Занятия, где можно исследовать материалы, идеи и собственный способ выражаться.", tags: ["дошкольный и младший школьный возраст", "творческие форматы"], tone: "yellow", icon: "✳" },
  { number: "05", title: "Продлёнка", blurb: "Поможем уточнить, подходит ли формат продлёнки под ваш режим и текущую задачу семьи.", tags: ["младшая школа", "условия уточняются"], tone: "navy", icon: "◷" },
];

const faqs = [
  ["С какого возраста можно начать?", "Направление зависит от возраста и задачи ребёнка. Оставьте несколько деталей — подскажем, с чего лучше начать."],
  ["Как понять, какое направление подходит?", "Можно пройти короткий подбор на странице или рассказать о ситуации в WhatsApp. Это будет предварительный ориентир, а детали уточнит педагог."],
  ["Есть ли пробное занятие?", "Запись на пробное посещение — один из основных сценариев заявки. Условия и доступные варианты подскажем при обращении."],
  ["Как узнать расписание?", "Напишите возраст ребёнка и интересующее направление — уточним актуальные варианты расписания."],
  ["Как формируется стоимость?", "Стоимость зависит от выбранного направления и формата. Точную информацию можно запросить вместе с расписанием."],
  ["Можно ли сначала прийти на консультацию?", "Да, в заявке можно выбрать консультацию и описать вопрос, с которым вы хотите прийти."],
  ["Что делать, если ребёнок стесняется?", "Расскажите об этом заранее. Так специалист сможет предложить более бережный способ первого знакомства с занятием."],
  ["Есть ли занятия после школы?", "Для продлёнки и других направлений формат зависит от актуального расписания. Подскажем варианты после уточнения возраста и запроса."],
  ["Как записаться через WhatsApp?", `Нажмите на любую кнопку WhatsApp — сообщение уже будет структурировано. Останется добавить детали и отправить его на ${WHATSAPP_LABEL}.`],
];

const initialAnswers: QuizAnswers = { age: "", goal: "", format: "", need: "" };

function track(event: string, payload: Record<string, string> = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("smart-childhood-analytics", { detail: { event, ...payload } }));
  const w = window as Window & { dataLayer?: Array<Record<string, unknown>>; gtag?: (...args: unknown[]) => void };
  w.dataLayer?.push({ event, ...payload });
  w.gtag?.("event", event, payload);
}

function recommendation(answers: QuizAnswers) {
  if (answers.goal === "Подготовка к школе") return directions[0];
  if (answers.goal === "Развитие самостоятельности") return directions[1];
  if (answers.goal === "Помощь с чтением") return directions[2];
  if (answers.goal === "Творчество") return directions[3];
  if (answers.goal === "Продлёнка и присмотр" || answers.format === "После школы") return directions[4];
  if (answers.age === "3–4 года") return directions[1];
  if (answers.age === "Младшая школа") return directions[2];
  return directions[0];
}

function buildWhatsAppMessage(values: Record<string, string>, answers?: QuizAnswers) {
  return [
    "Новая заявка с сайта «Умное детство».",
    `Возраст ребёнка: ${values.age || answers?.age || "не указано"}`,
    `Задача: ${answers?.goal || values.goal || "не указано"}`,
    `Выбранное направление: ${values.goal || (answers ? recommendation(answers).title : "не указано")}`,
    `Желаемый формат: ${answers?.format || "не указано"}`,
    `Имя: ${values.name || "не указано"}`,
    `Контакт: ${values.contact || "не указано"}`,
    values.time ? `Удобное время связи: ${values.time}` : "",
    values.comment ? `Комментарий: ${values.comment}` : "",
  ].filter(Boolean).join("\n");
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [answers, setAnswers] = useState<QuizAnswers>(initialAnswers);
  const [quizStep, setQuizStep] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizName, setQuizName] = useState("");
  const [quizContact, setQuizContact] = useState("");
  const [quizChildAge, setQuizChildAge] = useState("");
  const [quizSent, setQuizSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formSent, setFormSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", contact: "", age: "", goal: "", time: "", comment: "" });
  const result = useMemo(() => recommendation(answers), [answers]);

  useEffect(() => { track("quiz_view"); }, []);

  function startQuiz() {
    setQuizStarted(true);
    setQuizComplete(false);
    setQuizStep(0);
    track("quiz_start");
    scrollToId("quiz");
  }

  function chooseQuizOption(option: string) {
    const step = quizSteps[quizStep];
    const next = { ...answers, [step.key]: option };
    setAnswers(next);
    if (quizStep < quizSteps.length - 1) {
      setQuizStep((current) => current + 1);
      return;
    }
    setQuizComplete(true);
    setQuizChildAge(next.age);
    track("quiz_complete", { age: next.age, goal: next.goal, format: next.format, need: next.need });
  }

  function openWhatsApp(values: Record<string, string> = {}, quiz?: QuizAnswers) {
    const message = buildWhatsAppMessage(values, quiz);
    track("whatsapp_click", { source: values.source || "cta" });
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  function submitQuiz(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || !quizName || !quizContact) return;
    setIsSubmitting(true);
    setQuizSent(true);
    track("trial_click", { source: "quiz_result" });
    openWhatsApp({ name: quizName, contact: quizContact, age: quizChildAge, goal: result.title, source: "quiz_result" }, answers);
    window.setTimeout(() => setIsSubmitting(false), 1200);
  }

  function submitMainForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || !form.name || !form.contact) return;
    setIsSubmitting(true);
    setFormSent(true);
    track("form_submit", { direction: form.goal || "not_selected" });
    openWhatsApp({ ...form, source: "main_form" });
    window.setTimeout(() => setIsSubmitting(false), 1200);
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Умное детство — на главную"><span className="brand-mark" aria-hidden="true">✳</span><span><strong>Умное детство</strong><small>центр развития</small></span></a>
        <nav className="desktop-nav" aria-label="Основная навигация"><a href="#directions">Направления</a><a href="#how">Как выбрать</a><a href="#faq">Вопросы</a></nav>
        <a className="header-phone" href={`tel:${WHATSAPP_NUMBER}`}>{WHATSAPP_LABEL}</a>
      </header>

      <section className="hero section-wrap" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> Краснодар · для детей и родителей</p>
          <h1>Развитие ребёнка —<br /><em>под его возраст</em><br />и задачу</h1>
          <p className="hero-lead">Подготовка к школе, Монтессори, скорочтение, творчество и продлёнка. Ответьте на несколько вопросов — подскажем, с чего лучше начать.</p>
          <div className="hero-actions"><button className="button button-primary" type="button" onClick={startQuiz}>Подобрать направление <span aria-hidden="true">↗</span></button><button className="button button-quiet" type="button" onClick={() => { track("trial_click", { source: "hero" }); openWhatsApp({ source: "hero" }); }}>Записаться на пробное занятие</button></div>
          <div className="hero-proof" aria-label="Доверие и формат"><div className="rating-badge"><strong>5,0</strong><span className="stars" aria-hidden="true">★★★★★</span><small>в 2ГИС · 37 оценок</small></div><div className="proof-divider" /><p><span className="tiny-check">✓</span> Подбор программы<br />по возрасту и цели ребёнка</p></div>
        </div>
        <div className="hero-visual" aria-label="Иллюстрация атмосферы развивающего занятия"><div className="visual-label visual-label-top">пространство<br />для интереса</div><div className="visual-photo"><Image src="/hero-atmosphere.webp" alt="Тёплая иллюстрация учебного пространства с материалами для занятий" width={1536} height={1024} priority /><div className="visual-sticker">интерес<br /><span>начинается<br />с вопроса</span></div></div><div className="visual-caption"><span>01</span><span>Ищем подходящий<br />первый шаг вместе</span></div></div>
      </section>

      <section className="section-wrap quiz-section" id="quiz">
        <div className="section-intro quiz-intro"><p className="eyebrow">Короткий подбор · 1 минута</p><h2>С чего лучше начать?</h2><p>Не нужно разбираться во всех направлениях заранее. Ответьте на четыре вопроса — получите предварительный ориентир и понятный следующий шаг.</p></div>
        <div className={`quiz-card ${quizStarted ? "is-started" : ""}`}>
          {!quizStarted && !quizComplete ? <div className="quiz-start"><div className="quiz-orbit" aria-hidden="true"><span>?</span><i /><i /><i /></div><div><span className="card-kicker">Подбор без переписки вслепую</span><h3>Ответьте про возраст,<br />задачу и формат</h3><p>В конце можно сразу запросить расписание, стоимость или пробное занятие.</p><button className="button button-dark" type="button" onClick={startQuiz}>Начать подбор <span aria-hidden="true">→</span></button></div><div className="quiz-start-aside"><span>4</span><small>вопроса<br />вместо десятков<br />сообщений</small></div></div> : quizComplete ? <div className="quiz-result"><div className="result-icon" aria-hidden="true">✓</div><div className="result-copy"><span className="card-kicker">Предварительный ориентир</span><h3>Вам может подойти<br /><em>{result.title}</em></h3><p>{result.blurb} Это предварительный ориентир. Педагог уточнит детали и предложит подходящий формат.</p><div className="result-summary"><span>{answers.age}</span><span>{answers.goal}</span><span>{answers.format}</span></div></div><form className="mini-form" onSubmit={submitQuiz}><label>Имя родителя<input value={quizName} onChange={(event) => setQuizName(event.target.value)} placeholder="Как к вам обращаться" required /></label><label>Телефон или WhatsApp<input value={quizContact} onChange={(event) => setQuizContact(event.target.value)} placeholder="+7 ___ ___-__-__" type="tel" required /></label><label>Возраст ребёнка <span>необязательно</span><input value={quizChildAge} onChange={(event) => setQuizChildAge(event.target.value)} placeholder="Например, 5 лет" /></label><label className="consent"><input type="checkbox" required /> <span>Соглашаюсь на обработку персональных данных</span></label><button className="button button-primary" type="submit" disabled={isSubmitting}>{quizSent ? "Заявка подготовлена ✓" : "Узнать расписание и стоимость →"}</button><button className="text-button" type="button" onClick={() => { track("trial_click", { source: "quiz_result_secondary" }); openWhatsApp({ name: quizName, contact: quizContact, age: quizChildAge, goal: result.title, source: "quiz_result_secondary" }, answers); }}>Записаться на пробное занятие</button></form></div> : <div className="quiz-flow"><div className="quiz-progress"><span style={{ width: `${((quizStep + 1) / quizSteps.length) * 100}%` }} /></div><div className="quiz-heading"><span className="card-kicker">{quizSteps[quizStep].eyebrow}</span><span className="quiz-step-number">0{quizStep + 1}</span><h3>{quizSteps[quizStep].title}</h3></div><div className="quiz-options">{quizSteps[quizStep].options.map((option) => <button className={`quiz-option ${answers[quizSteps[quizStep].key] === option ? "selected" : ""}`} key={option} type="button" onClick={() => chooseQuizOption(option)}><span>{option}</span><b aria-hidden="true">↗</b></button>)}</div>{quizStep > 0 && <button className="text-button back-button" type="button" onClick={() => setQuizStep((current) => current - 1)}>← Вернуться к предыдущему вопросу</button>}</div>}
        </div>
      </section>

      <section className="section-wrap directions-section" id="directions"><div className="section-heading-row"><div><p className="eyebrow">Направления</p><h2>Есть задача —<br /><em>найдём формат</em></h2></div><p className="heading-note">Каждое направление можно обсудить отдельно: расскажите, что сейчас важно ребёнку, а мы подскажем, с чего начать.</p></div><div className="directions-grid">{directions.map((item) => <article className={`direction-card tone-${item.tone}`} key={item.title}><div className="direction-top"><span className="direction-number">{item.number}</span><span className="direction-icon" aria-hidden="true">{item.icon}</span></div><h3>{item.title}</h3><p>{item.blurb}</p><div className="direction-tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><button className="card-link" type="button" onClick={() => { setForm((current) => ({ ...current, goal: item.title })); track("direction_click", { direction: item.title }); scrollToId("contact"); }}>Уточнить детали <span aria-hidden="true">↗</span></button></article>)}</div></section>

      <section className="how-section" id="how"><div className="section-wrap"><div className="section-heading-row"><div><p className="eyebrow light">Как выбрать</p><h2>Вам не нужно<br /><em>разбираться одному</em></h2></div><p className="heading-note light-note">Наша задача — услышать вашу ситуацию и перевести её в понятный следующий шаг.</p></div><div className="steps-grid"><div className="step-item"><span>01</span><div><h3>Вы рассказываете</h3><p>Возраст и то, что сейчас важно ребёнку и семье.</p></div></div><div className="step-item"><span>02</span><div><h3>Мы сопоставляем</h3><p>Предлагаем подходящее направление и возможный формат.</p></div></div><div className="step-item"><span>03</span><div><h3>Вы решаете</h3><p>Получаете расписание, стоимость и можете записаться на пробное занятие.</p></div></div></div></div></section>

      <section className="trust-section section-wrap"><div className="trust-card"><div className="trust-main"><p className="eyebrow">Доверие</p><div className="trust-rating"><strong>5,0</strong><span><b>★★★★★</b><small>рейтинг в 2ГИС</small></span></div><p className="trust-copy">37 оценок родителей уже собрали о центре свой опыт. Познакомьтесь с направлением, которое подходит вашей семье.</p><a className="underlined-link" href="https://2gis.ru/krasnodar" target="_blank" rel="noreferrer">Открыть карточку в 2ГИС <span>↗</span></a></div><div className="trust-quote"><span className="quote-mark">“</span><p>Выбираем не «самое популярное», а то, что имеет смысл именно для вашего ребёнка сейчас.</p><span className="quote-caption">подход «Умного детства»</span></div><div className="trust-note"><span className="note-dot" /><p>Фотографии помещений, реальные отзывы и информация о педагогах появятся после согласования с центром.</p></div></div></section>

      <section className="faq-section section-wrap" id="faq"><div className="section-heading-row"><div><p className="eyebrow">FAQ</p><h2>Частые вопросы<br /><em>родителей</em></h2></div><p className="heading-note">Если не нашли ответ — напишите в WhatsApp. Сформируем сообщение с контекстом, чтобы вам не пришлось начинать с «Здравствуйте».</p></div><div className="faq-list">{faqs.map(([question, answer], index) => <div className={`faq-item ${openFaq === index ? "open" : ""}`} key={question}><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}><span>{question}</span><i aria-hidden="true">+</i></button>{openFaq === index && <p>{answer}</p>}</div>)}</div></section>

      <section className="contact-section section-wrap" id="contact"><div className="contact-card"><div className="contact-copy"><p className="eyebrow light">Следующий шаг</p><h2>Подберём направление<br /><em>под вашу задачу</em></h2><p>Оставьте контакт — уточним детали и подскажем ближайший подходящий вариант.</p><div className="contact-meta"><span>Краснодар</span><span className="meta-line" /><a href={`tel:${WHATSAPP_NUMBER}`}>{WHATSAPP_LABEL}</a></div></div>{formSent ? <div className="success-state"><div className="success-icon">✓</div><h3>Спасибо! Заявка подготовлена.</h3><p>Мы открыли WhatsApp со всеми выбранными деталями. Осталось отправить сообщение — так центру будет проще быстро сориентироваться.</p><button className="button button-light" type="button" onClick={() => setFormSent(false)}>Отправить ещё одну заявку</button></div> : <form className="contact-form" onSubmit={submitMainForm}><div className="form-grid"><label>Имя родителя<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Как к вам обращаться" required /></label><label>Телефон или WhatsApp<input value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} placeholder="+7 ___ ___-__-__" type="tel" required /></label><label>Возраст ребёнка<input value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} placeholder="Например, 5 лет" /></label><label>Интересующее направление<select value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })}><option value="">Выберите направление</option>{directions.map((item) => <option key={item.title} value={item.title}>{item.title}</option>)}</select></label><label>Удобное время связи<input value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} placeholder="Например, после 18:00" /></label><label>Комментарий<textarea value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} placeholder="Что важно учесть?" rows={1} /></label></div><label className="consent light-consent"><input type="checkbox" required /> <span>Соглашаюсь на обработку персональных данных</span></label><button className="button button-coral" type="submit" disabled={isSubmitting}>{isSubmitting ? "Готовим сообщение…" : "Открыть WhatsApp с заявкой →"}</button><p className="form-caption">Сообщение будет структурировано: возраст, задача, направление, формат и ваши контакты.</p></form>}</div></section>

      <footer className="site-footer section-wrap"><div className="footer-brand"><a className="brand" href="#top"><span className="brand-mark" aria-hidden="true">✳</span><span><strong>Умное детство</strong><small>центр развития</small></span></a><p>Краснодар · подбор занятия под возраст и задачу ребёнка</p></div><div className="footer-links"><a href="#directions">Направления</a><a href="#faq">Вопросы</a><a href="#contact">Записаться</a><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">WhatsApp ↗</a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} «Умное детство»</span><a href="#contact">Политика конфиденциальности</a></div></footer>
      <a className="floating-whatsapp" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" aria-label="Написать в WhatsApp" onClick={() => track("whatsapp_click", { source: "floating_button" })}><span aria-hidden="true">W</span><small>Написать<br />в WhatsApp</small></a>
    </main>
  );
}
