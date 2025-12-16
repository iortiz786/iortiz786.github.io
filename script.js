const PROFILE = {
  name: "Isaac",
  email: "youremail@example.com",
  github: "https://github.com/iortiz786",
  linkedin: "https://www.linkedin.com/",
  resumePath: "resume.pdf"
};

function $(sel){ return document.querySelector(sel); }
function $all(sel){ return Array.from(document.querySelectorAll(sel)); }

function showToast(msg){
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg || "Done.";
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
  // Brand
  const brandName = $("#brandName");
  if (brandName) brandName.textContent = PROFILE.name;

  const footerName = $("#footerName");
  if (footerName) footerName.textContent = PROFILE.name;

  // Email text + mailto
  const emailText = $("#emailText");
  if (emailText) emailText.textContent = PROFILE.email;

  $all('[data-mailto="1"]').forEach(a => a.setAttribute("href", "mailto:" + PROFILE.email));

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

/* ===== Bottom Sheet ===== */
function initSheet(){
  const fab = $("#fab");
  const sheet = $("#sheet");
  const backdrop = $("#sheetBackdrop");
  if (!fab || !sheet || !backdrop) return;

  const open = () => {
    backdrop.classList.add("show");
    sheet.classList.add("show");
  };
  const close = () => {
    backdrop.classList.remove("show");
    sheet.classList.remove("show");
  };

  fab.addEventListener("click", open);
  backdrop.addEventListener("click", close);

  // swipe-down to close
  let startY = null;
  let currentY = null;

  sheet.addEventListener("touchstart", (e) => {
    startY = e.touches[0].clientY;
    currentY = startY;
  }, {passive:true});

  sheet.addEventListener("touchmove", (e) => {
    if (startY == null) return;
    currentY = e.touches[0].clientY;
    const dy = Math.max(0, currentY - startY);
    if (dy > 0){
      sheet.style.transition = "none";
      sheet.style.transform = `translateX(-50%) translateY(${dy}px)`;
    }
  }, {passive:true});

  sheet.addEventListener("touchend", () => {
    sheet.style.transition = "";
    sheet.style.transform = "";
    if (startY != null && currentY != null){
      const dy = currentY - startY;
      if (dy > 90) close();
    }
    startY = null;
    currentY = null;
  });
}

/* ===== Modal (Project Details) ===== */
function initModal(){
  const modal = $("#modal");
  const backdrop = $("#modalBackdrop");
  const closeBtn = $("#modalClose");

  if (!modal || !backdrop || !closeBtn) return;

  const close = () => {
    backdrop.classList.remove("show");
    modal.classList.remove("show");
  };
  const open = (data) => {
    $("#modalTitle").textContent = data.title || "Project";
    $("#modalMeta").textContent = data.meta || "";
    $("#modalDesc").textContent = data.desc || "";

    const actions = $("#modalActions");
    actions.innerHTML = "";

    if (data.live){
      const a = document.createElement("a");
      a.href = data.live;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "Live";
      actions.appendChild(a);
    }
    if (data.repo){
      const a = document.createElement("a");
      a.href = data.repo;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "Repo";
      actions.appendChild(a);
    }

    // Native share
    const shareBtn = document.createElement("button");
    shareBtn.textContent = "Share";
    shareBtn.addEventListener("click", async () => {
      const url = data.live || location.href;
      if (navigator.share){
        try{
          await navigator.share({ title: data.title || PROFILE.name, text: data.desc || "", url });
        }catch(e){}
      }else{
        await copyToClipboard(url);
        showToast("Link copied.");
      }
    });
    actions.appendChild(shareBtn);

    backdrop.classList.add("show");
    modal.classList.add("show");
  };

  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close);

  // expose global helper
  window.__openProjectModal = open;
}

/* ===== Work page: tap-to-open modal + optional carousel wiring ===== */
function initProjects(){
  // Works if you add data-* attributes to items (below)
  $all("[data-project]").forEach(el => {
    el.addEventListener("click", () => {
      const data = {
        title: el.dataset.title,
        meta: el.dataset.meta,
        desc: el.dataset.desc,
        live: el.dataset.live,
        repo: el.dataset.repo
      };
      if (window.__openProjectModal) window.__openProjectModal(data);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  wireProfile();
  setActiveNav();
  initSheet();
  initModal();
  initProjects();

  // prevent dead "#"
  $all('a[href="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("Link not set yet.");
    });
  });
});
