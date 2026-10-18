/// ---- Edit these ----
const LOGIN_URL = ""; // student portal link; leave empty until you have one
const NEWS = [
  { m: "OCT", d: "16", title: "First Quarter Examination Schedule", text: "The schedule for the 1st Quarter Examination is now available. Please be guided accordingly." },
  { m: "OCT", d: "14", title: "Enrollment for SY 2026–2027", text: "Enrollment for next school year will start on October 20, 2026. Please prepare the required documents." },
  { m: "OCT", d: "10", title: "School Event: Nutrition Month Celebration", text: "Join us on October 17, 2026 at the school grounds. Let’s promote healthy living!" },
  { m: "OCT", d: "05", title: "Brigada Eskwela 2026", text: "We are inviting parents, alumni, and volunteers for Brigada Eskwela on October 12, 2026. Together, we can make our school better!" }
];
const SERVICES = [
  ["file", "Online Enrollment", "Apply and check your enrollment status."],
  ["id", "Grades Inquiry", "View your grades and academic records."],
  ["cal", "Request Documents", "Request certificates and other school documents."],
  ["book", "Library Services", "Access our digital and physical library resources."],
  ["heart", "Health Services", "Check health programs and school clinic info."],
  ["help", "FAQs", "Find answers to common questions."]
];
// Tonian’s answers. Replace with your school’s real information.
const FAQ = [
  { keys: ["enroll", "enrollment", "school year", "register", "admission"], a: "Enrollment for SY 2026–2027 starts on October 20, 2026. Please prepare the required documents." },
  { keys: ["requirement", "document", "form 137", "birth", "new student", "bring"], a: "Here are the requirements for new students:\n• PSA Birth Certificate\n• Form 137 (Report Card)\n• 2x2 ID Picture\n• Parent/Guardian’s ID (if applicable)" },
  { keys: ["exam", "quarter", "schedule"], a: "The schedule for the 1st Quarter Examination is now available. Please check the Announcements section." },
  { keys: ["contact", "phone", "email", "reach", "where", "location", "address"], a: "We are in Lawang Bato, Valenzuela City. For phone and email details, please visit the school office." },
  { keys: ["grade", "library", "health", "clinic", "faq", "service"], a: "You can find this under Student Services on this page. For details, please ask the school office." },
  { keys: ["hello", "hi", "hey", "kumusta"], a: "Kumusta! Ask me about enrollment, requirements, or the 1st Quarter Examination schedule." }
];
const FALLBACK = "I’m not sure about that one yet. Please ask the school office, or try one of the suggested questions.";
const CHIPS = ["When is enrollment?", "Requirements for new students", "Exam schedule"];
// --------------------

const $ = id => document.getElementById(id);

// Animation helper: skipped for people who prefer reduced motion
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE = "cubic-bezier(.2,.7,.2,1)";
function anim(el, frames, opts) {
  return reduce || !el ? null : el.animate(frames, Object.assign({ duration: 500, easing: EASE, fill: "backwards" }, opts));
}
const panel = $("panel"), fab = $("fab"), log = $("log"), input = $("input");

NEWS.forEach(n => {
  const li = document.createElement("li");
  li.innerHTML = '<div class="date"><small></small><b></b></div><div><h3></h3><p></p></div><svg class="ic"><use href="#right"/></svg>';
  li.querySelector("small").textContent = n.m;
  li.querySelector("b").textContent = n.d;
  li.querySelector("h3").textContent = n.title;
  li.querySelector("p").textContent = n.text;
  $("ann").appendChild(li);
});
SERVICES.forEach(([ic, t, d]) => {
  const b = document.createElement("button");
  b.type = "button";
  b.innerHTML = '<svg class="ic"><use href="#' + ic + '"/></svg><div><b></b><span></span></div>';
  b.querySelector("b").textContent = t;
  b.querySelector("span").textContent = d;
  b.addEventListener("click", () => { setOpen(true); ask("Tell me about " + t); });
  $("svc").appendChild(b);
});

let closing = null;
const popFrom = { opacity: 0, transform: "translateY(16px) scale(.94)" };
function setOpen(o) {
  fab.setAttribute("aria-expanded", String(o));
  if (o) {
    if (closing) { closing.cancel(); closing = null; }
    fab.classList.remove("pulse");
    panel.hidden = false;
    anim(panel, [popFrom, { opacity: 1, transform: "none" }], { duration: 350 });
    if (matchMedia("(min-width:700px)").matches) input.focus();
  } else if (!panel.hidden) {
    closing = anim(panel, [{ opacity: 1, transform: "none" }, popFrom], { duration: 200, easing: "ease-in", fill: "forwards" });
    if (closing) closing.onfinish = () => { panel.hidden = true; closing.cancel(); closing = null; };
    else panel.hidden = true;
  }
}
fab.addEventListener("click", () => setOpen(panel.hidden));
$("close").addEventListener("click", () => { setOpen(false); fab.focus(); });
$("searchBtn").addEventListener("click", () => setOpen(true));
document.addEventListener("keydown", e => { if (e.key === "Escape" && !panel.hidden) setOpen(false); });

function toast(t) {
  const el = $("toast"); el.textContent = t; el.hidden = false;
  clearTimeout(toast.id); toast.id = setTimeout(() => el.hidden = true, 2600);
}
$("loginBtn").addEventListener("click", () => {
  if (LOGIN_URL) window.open(LOGIN_URL, "_blank", "noopener");
  else toast("Student login isn’t available yet.");
});

const time = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
function add(text, who, dots) {
  const row = document.createElement("div");
  row.className = "row " + who;
  const box = document.createElement("div");
  const bub = document.createElement("div");
  bub.className = "bub" + (dots ? " dots" : "");
  if (dots) bub.innerHTML = "<i></i><i></i><i></i>"; else bub.textContent = text;
  const t = document.createElement("span");
  t.className = "t"; t.textContent = time();
  box.append(bub);
  if (!dots) box.append(t);
  if (who === "bot") {
    const a = document.createElement("img");
    a.className = "av"; a.src = $("fab").querySelector("img").src; a.alt = "";
    row.append(a);
  }
  row.append(box);
  log.appendChild(row);
  log.scrollTop = log.scrollHeight;
  anim(row, [{ opacity: 0, transform: "translateY(10px) scale(.96)" }, { opacity: 1, transform: "none" }], { duration: 280 });
  return row;
}
function answer(q) {
  const s = q.toLowerCase();
  let best = null, score = 0;
  for (const f of FAQ) {
    const n = f.keys.filter(k => s.includes(k)).length;
    if (n > score) { score = n; best = f; }
  }
  return best ? best.a : FALLBACK;
}
function ask(q) {
  q = q.trim();
  if (!q) return;
  add(q, "me");
  const typing = add("", "bot", true);
  const a = answer(q);
  setTimeout(() => { typing.remove(); add(a, "bot"); }, reduce ? 300 : 700 + Math.min(a.length * 6, 800));
}
$("form").addEventListener("submit", e => { e.preventDefault(); ask(input.value); input.value = ""; });
CHIPS.forEach(c => {
  const b = document.createElement("button");
  b.type = "button"; b.className = "chip"; b.textContent = c;
  b.addEventListener("click", () => ask(c));
  $("chips").appendChild(b);
});
add("Hi! I’m Tonian ⭐\nYour school assistant. How can I help you today?", "bot");

// ---- Page animations ----
if (!reduce) {
  // Hero entrance
  [".eyebrow", ".hero h1", ".hero p", ".cta"].forEach((s, i) =>
    anim(document.querySelector(s), [{ opacity: 0, transform: "translateY(22px)" }, { opacity: 1, transform: "none" }], { duration: 700, delay: 150 + i * 130 }));
  anim(document.querySelector(".hero .photo"), [{ transform: "scale(1.12)", opacity: 0.4 }, { transform: "scale(1)", opacity: 1 }], { duration: 1800 });

  // Reveal cards and sections as they scroll into view
  const seen = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      seen.unobserve(el);
      const i = Math.min(Array.from(el.parentNode.children).indexOf(el), 5);
      el.classList.remove("pre");
      anim(el, [{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "none" }], { delay: i * 90 });
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".val, .card, .ann li, .svc button, .about > div").forEach(el => {
    el.classList.add("pre");
    seen.observe(el);
  });
}

// Open Tonian after the page settles (wide screens), or nudge the button on small ones
setTimeout(() => {
  if (matchMedia("(min-width:1100px)").matches) setOpen(true);
  else if (panel.hidden && !reduce) fab.classList.add("pulse");
}, 900);