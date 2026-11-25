// Shared ATS checker logic. Each page sets window.ATS_CONFIG before this file loads:
// { keywords: [...], atsSystems: "...", sampleJob: "...", sampleResume: "..." }
(function(){
  const STOP = new Set(("a an the and or of to in for on with at by from as is are was were be been have has had will would can could should your you we our they he she it this that these those not no do does did but if then than so such very more most other some any all each when where who whom which what how why i me my we our you your he she it its they them their his her our us him them".split(" ")));
  function norm(s){ return (s||"").toLowerCase(); }
  function words(s){ return norm(s).replace(/[^a-z0-9+.#\/\s-]/g," ").split(/\s+/).filter(Boolean); }
  function extractJDKeywords(jd){
    const freq={};
    words(jd).forEach(w=>{ if(w.length>3 && !STOP.has(w)) freq[w]=(freq[w]||0)+1; });
    return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,25).map(e=>e[0]);
  }
  function containsPhrase(text, phrase){
    const t=" "+norm(text).replace(/[^a-z0-9\s]/g," ")+" ";
    const p=" "+phrase.toLowerCase().replace(/[^a-z0-9\s]/g," ").trim()+" ";
    return t.includes(p);
  }
  function check(){
    const resumeEl=document.getElementById("resumeText");
    const jdEl=document.getElementById("jobText");
    const resume=resumeEl ? resumeEl.value : "";
    const jd=jdEl ? jdEl.value : "";
    if(!resume.trim() || resume.trim().length<80){
      alert("Please paste your resume text first (at least a few lines). You can also upload a PDF, or click 'Load sample resume'.");
      return;
    }
    if(!jd.trim()){
      alert("Please paste the job description too — the checker compares your resume against it.");
      return;
    }
    const cfg=window.ATS_CONFIG||{};
    const baseKeywords=(cfg.keywords||[]).slice();
    const jdKeywords=extractJDKeywords(jd);
    // Merge: configured keywords first, then JD-derived words not already covered
    const allKeywords=[];
    baseKeywords.forEach(k=>{ if(!allKeywords.includes(k)) allKeywords.push(k); });
    jdKeywords.forEach(k=>{
      const title=k.charAt(0).toUpperCase()+k.slice(1);
      if(!allKeywords.some(x=>x.toLowerCase()===k)) allKeywords.push(title);
    });
    const matched=[], missing=[];
    allKeywords.forEach(k=>{
      if(containsPhrase(resume,k)) matched.push(k); else missing.push(k);
    });
    const kwScore = allKeywords.length ? Math.round(matched.length/allKeywords.length*100) : 0;

    // Formatting checks
    const checks=[];
    const hasEmail=/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(resume);
    checks.push({label:"Contact details — email and phone present", ok:hasEmail && /(\d[\s\-().]{0,2}){7,}/.test(resume), tip:"Add your email and phone number at the top. ATS needs them to parse your contact block."});
    const sections=["experience","education","skills"];
    const foundSections=sections.filter(s=>norm(resume).includes(s));
    checks.push({label:"Standard sections — Experience, Education, Skills", ok:foundSections.length>=2, tip:"Use plain headings: Experience, Education, Skills. Creative headings confuse the parser."});
    checks.push({label:"Dates present (years like 2022–2025)", ok:/(19|20)\d{2}/.test(resume), tip:"Add years for every job and degree, e.g. 2022–2025."});
    const bullets=(resume.match(/^[•\-\*]\s/mg)||[]).length + (resume.match(/•/g)||[]).length;
    checks.push({label:"Bullet points used for achievements", ok:bullets>=3, tip:"Use 3–6 bullet points per role, starting with an action verb."});
    const wc=words(resume).length;
    checks.push({label:"Length — "+wc+" words (aim for 400–800 words, 1–2 pages)", ok:wc>=300 && wc<=900, tip: wc<300?"Your resume is too short — add more detail to each role.":"Your resume is very long — cut it to 1–2 pages."});
    const hasTable=/\|.*\|/.test(resume);
    checks.push({label:"No tables, text boxes or graphics that block parsing", ok:!hasTable, tip:"Remove tables, columns, icons and text boxes. ATS reads plain single-column text best."});
    const fmtScore=Math.round(checks.filter(c=>c.ok).length/checks.length*100);
    const total=Math.round(kwScore*0.6 + fmtScore*0.4);

    // Render
    const res=document.getElementById("results");
    if(res) res.classList.remove("hidden");
    const circle=document.getElementById("scoreCircle");
    const num=document.getElementById("scoreNum");
    if(num) num.textContent=total;
    if(circle){
      circle.classList.remove("score-good","score-mid","score-low");
      circle.classList.add(total>=75 ? "score-good" : total>=50 ? "score-mid" : "score-low");
    }
    const verdict=document.getElementById("verdict");
    if(verdict) verdict.textContent = total>=75 ? "Strong match — this resume should pass most ATS filters for this job. Fix the missing keywords below to push it higher."
      : total>=50 ? "Good start — you are close. Add the missing keywords and fix the formatting checks below before you apply."
      : "Needs work — many keywords and formatting issues are likely to get this resume filtered out. Work through the missing keywords first.";
    const matchedEl=document.getElementById("matchedList");
    if(matchedEl) matchedEl.innerHTML = matched.length ? matched.map(k=>'<span class="chip ok">✓ '+escapeHtml(k)+'</span>').join("") : "<p>No configured keywords matched yet.</p>";
    const missingEl=document.getElementById("missingList");
    if(missingEl) missingEl.innerHTML = missing.length ? missing.map(k=>'<span class="chip miss">✕ '+escapeHtml(k)+'</span>').join("") : "<p>Excellent — no missing keywords from this list.</p>";
    const kwSummary=document.getElementById("kwSummary");
    if(kwSummary) kwSummary.textContent = matched.length+" of "+allKeywords.length+" keywords matched ("+kwScore+"%)";
    const checkEl=document.getElementById("checkList");
    if(checkEl) checkEl.innerHTML = checks.map(c=>'<li><span class="'+(c.ok?"pass":"fail")+'">'+(c.ok?"✓ PASS":"✕ FIX")+'</span> — '+escapeHtml(c.label)+(c.ok?"":'<br><span class="muted small">'+escapeHtml(c.tip)+'</span>')+'</li>').join("");
    if(res) res.scrollIntoView({behavior:"smooth"});
  }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m])); }
  function loadSample(kind){
    const cfg=window.ATS_CONFIG||{};
    if(kind==="job"){ const el=document.getElementById("jobText"); if(el) el.value=cfg.sampleJob||""; }
    if(kind==="resume"){ const el=document.getElementById("resumeText"); if(el) el.value=cfg.sampleResume||""; }
  }
  async function handlePdf(input){
    const file=input.files && input.files[0];
    if(!file) return;
    const status=document.getElementById("pdfStatus");
    if(status) status.textContent="Reading PDF…";
    try{
      if(typeof pdfjsLib==="undefined"){ if(status) status.textContent="PDF reader failed to load. Please paste your resume text instead."; return; }
      pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      const buf=await file.arrayBuffer();
      const pdf=await pdfjsLib.getDocument({data:buf}).promise;
      let text="";
      for(let i=1;i<=pdf.numPages;i++){
        const page=await pdf.getPage(i);
        const content=await page.getTextContent();
        text+=content.items.map(it=>it.str).join(" ")+"\n";
      }
      const el=document.getElementById("resumeText");
      if(el) el.value=text.trim();
      if(status) status.textContent="PDF loaded — "+pdf.numPages+" page(s), "+text.trim().split(/\s+/).length+" words extracted. Check the text, then paste the job description and click Check.";
    }catch(e){
      if(status) status.textContent="Could not read this PDF. Please paste your resume text instead.";
    }
  }
  document.addEventListener("DOMContentLoaded",()=>{
    const btn=document.getElementById("checkBtn");
    if(btn) btn.addEventListener("click",check);
    const sj=document.getElementById("loadSampleJob");
    if(sj) sj.addEventListener("click",()=>loadSample("job"));
    const sr=document.getElementById("loadSampleResume");
    if(sr) sr.addEventListener("click",()=>loadSample("resume"));
    const pdf=document.getElementById("pdfFile");
    if(pdf) pdf.addEventListener("change",()=>handlePdf(pdf));
  });
})();
