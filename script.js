// ======= EDIT THIS ONCE =======
const PROFILE = {
  name: "Isaac",
  email: "youremail@example.com",
  github: "https://github.com/",
  linkedin: "https://www.linkedin.com/",
  resumePath: "resume.pdf" // upload resume.pdf into repo root to enable
};

function $(sel){ return document.querySelector(sel); }
function $all(sel){ return Array.from(document.querySelectorAll(sel)); }

function setText(sel, text){
  const el = $(sel);
  if (el) el.textContent = text;
}

function showToast(msg){
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg || "Copied.";
  t.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove("show"), 1400);
}

async function copyToClipboard(text){
  try{
    await navigator.clipboard.writeText(text);
    showToast("Email copied.");
  }catch(e){
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast("Email copied.");
  }
}

function setActiveNav(){
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  $all(".navlinks a").forEach(a => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === path) a.classList.add("active");
  });
}

function wireProfile(){
  // Title / brand
  document.title = document.title.replace("YOUR NAME", PROFILE.name);
  setText("#brandName", PROFILE.name);
  setText("#footerName", PROFILE.name);

  // Email
  const emailText = $("#emailText");
  if (emailText) emailText.textContent = PROFILE.email;

  const mailto = $all('[data-mailto="1"]');
  mailto.forEach(a => a.setAttribute("href", "mailto:" + PROFILE.email));

  // External links
  const gh = $("#ghLink"); if (gh) gh.href = PROFILE.github;
  const li = $("#liLink"); if (li) li.href = PROFILE.linkedin;

  // Resume
  const res = $("#resumeLink");
  if (res){
    res.href = PROFILE.resumePath || "#";
    res.addEventListener("click", (e) => {
      if (!PROFILE.resumePath || PROFILE.resumePath === "#"){
        e.preventDefault();
        showToast("Upload resume.pdf first.");
      }
    });
  }

  // Copy email buttons
  $all('[data-copy-email="1"]').forEach(btn => {
    btn.addEventListener("click", () => copyToClipboard(PROFILE.email));
  });

  // Year
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", () => {
  wireProfile();
  setActiveNav();

  // prevent dead links that are still "#"
  $all('a[href="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("Link not set yet.");
    });
  });
});
