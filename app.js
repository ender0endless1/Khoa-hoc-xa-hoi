/* ============ CẤU HÌNH ============ */
const CONFIG = {
  MOD_PASSCODE: "admin123",        // ĐỔI MÃ NÀY. Lưu ý: chỉ là bảo vệ cơ bản phía trình duyệt.
  MAX_FILE_MB: 8,
  ALLOWED_EXT: ["pdf", "doc", "docx"],
  BANNED_WORDS: ["địt","đm","đmm","vcl","vkl","cặc","lồn","cmm","đụ má","mẹ mày","thằng ngu","con chó","cá độ","casino","kiếm tiền nhanh","cho vay nặng lãi","bán dâm","đảo chính bạo lực","giết hết"],
  MAX_LINKS: 2,
  REQUIRE_APPROVAL: true,           // tài liệu mới phải được duyệt trước khi hiển thị
  FLAG_AUTO_HIDE: 3                 // số lượt báo cáo để tự ẩn
};

/* ============ PHÂN LOẠI NGÀNH ============ */
const TAXONOMY = [
  { id:"chinh-tri", name:"Chính trị học", ico:"🏛️", subs:["Lý thuyết chính trị","Chính trị so sánh","Quan hệ quốc tế","Chính sách công","Hành chính công","Bầu cử & đảng phái"] },
  { id:"xa-hoi", name:"Xã hội học", ico:"👥", subs:["Phân tầng & bất bình đẳng","Xã hội học đô thị","Xã hội học nông thôn","Giới & gia đình","Di cư & dân số","Phương pháp nghiên cứu xã hội"] },
  { id:"kinh-te", name:"Kinh tế học", ico:"📈", subs:["Kinh tế chính trị","Kinh tế phát triển","Kinh tế hành vi","Lao động & việc làm","Thương mại quốc tế"] },
  { id:"luat", name:"Luật học", ico:"⚖️", subs:["Luật hiến pháp","Luật hành chính","Luật quốc tế","Quyền con người","Pháp luật & xã hội"] },
  { id:"lich-su", name:"Lịch sử", ico:"📜", subs:["Lịch sử chính trị","Lịch sử tư tưởng","Sử học Việt Nam","Lịch sử thế giới"] },
  { id:"triet-hoc", name:"Triết học & Đạo đức", ico:"🧭", subs:["Triết học chính trị","Đạo đức học","Triết học xã hội","Logic & lập luận"] },
  { id:"nhan-hoc", name:"Nhân học & Văn hóa", ico:"🌏", subs:["Nhân học văn hóa","Dân tộc học","Nghiên cứu tôn giáo","Văn hóa & bản sắc"] },
  { id:"tam-ly", name:"Tâm lý học", ico:"🧠", subs:["Tâm lý xã hội","Tâm lý chính trị","Tâm lý học hành vi"] },
  { id:"truyen-thong", name:"Truyền thông & Báo chí", ico:"📰", subs:["Truyền thông chính trị","Báo chí & công chúng","Truyền thông số","Thông tin sai lệch"] },
  { id:"giao-duc", name:"Giáo dục học", ico:"🎓", subs:["Chính sách giáo dục","Xã hội học giáo dục","Giáo dục công dân"] },
  { id:"moi-truong", name:"Địa lý & Môi trường", ico:"🌱", subs:["Địa chính trị","Chính trị môi trường","Biến đổi khí hậu & xã hội"] },
  { id:"lien-nganh", name:"Nghiên cứu liên ngành", ico:"🔗", inter:true, subs:["Khoa học dữ liệu xã hội","Kinh tế – chính trị quốc tế","Công nghệ, AI & xã hội","Phát triển bền vững","Giới & chính sách","Nghiên cứu khu vực (Đông Nam Á…)","Quản trị toàn cầu","Đạo đức & quản trị AI","Y tế công cộng & xã hội"] }
];
const DOC_TYPES = ["Bài báo khoa học","Luận văn / Luận án","Báo cáo chính sách","Giáo trình / Bài giảng","Sách / Chuyên khảo","Bài tổng quan","Khác"];
const FORUM_CATS = ["Thảo luận chung","Chính trị & Chính sách","Khoa học xã hội","Liên ngành","Phương pháp nghiên cứu","Hỏi đáp học thuật","Góp ý cho diễn đàn"];

/* ============ LƯU TRỮ ============ */
const LS = {
  get(k, d){ try{ return JSON.parse(localStorage.getItem("ksx_"+k)) ?? d; }catch{ return d; } },
  set(k, v){ localStorage.setItem("ksx_"+k, JSON.stringify(v)); }
};
const DB = { // IndexedDB cho tệp
  open(){ return new Promise((res,rej)=>{ const r=indexedDB.open("ksx_files",1); r.onupgradeneeded=()=>r.result.createObjectStore("f"); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); },
  async put(id, blob){ const db=await this.open(); return new Promise((res,rej)=>{ const t=db.transaction("f","readwrite"); t.objectStore("f").put(blob,id); t.oncomplete=res; t.onerror=()=>rej(t.error); }); },
  async get(id){ const db=await this.open(); return new Promise((res,rej)=>{ const q=db.transaction("f").objectStore("f").get(id); q.onsuccess=()=>res(q.result); q.onerror=()=>rej(q.error); }); },
  async del(id){ const db=await this.open(); return new Promise(res=>{ const t=db.transaction("f","readwrite"); t.objectStore("f").delete(id); t.oncomplete=res; }); }
};

const now = () => Date.now();
const uid = () => Math.random().toString(36).slice(2,10)+now().toString(36);
const esc = s => String(s??"").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmtDate = t => new Date(t).toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"});
const fmtSize = b => b>1048576 ? (b/1048576).toFixed(1)+" MB" : Math.max(1,Math.round(b/1024))+" KB";
const $ = (s,r=document)=>r.querySelector(s);
const field = id => TAXONOMY.find(f=>f.id===id);

function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toast.t); toast.t=setTimeout(()=>t.classList.remove("show"),3200); }

/* ============ DỮ LIỆU MẪU ============ */
function seed(){
  if(LS.get("seeded")) return;
  LS.set("docs", [
    {id:uid(),title:"Nhập môn Lý thuyết Chính trị: các trường phái chính",author:"Ban biên tập",desc:"Bài tổng quan về chủ nghĩa tự do, bảo thủ, xã hội chủ nghĩa và cộng hòa trong tư tưởng chính trị hiện đại.",field:"chinh-tri",sub:"Lý thuyết chính trị",type:"Bài tổng quan",ext:"",size:0,status:"approved",date:now()-86400000*12,downloads:0,flags:0,sample:true},
    {id:uid(),title:"Bất bình đẳng thu nhập và phân tầng xã hội ở Đông Nam Á",author:"Ban biên tập",desc:"Tổng hợp các nghiên cứu về phân tầng xã hội và di động xã hội trong khu vực.",field:"xa-hoi",sub:"Phân tầng & bất bình đẳng",type:"Báo cáo chính sách",ext:"",size:0,status:"approved",date:now()-86400000*8,downloads:0,flags:0,sample:true},
    {id:uid(),title:"Quản trị AI: giao điểm của luật, đạo đức và chính sách công",author:"Ban biên tập",desc:"Khung phân tích liên ngành về điều tiết trí tuệ nhân tạo ở cấp quốc gia và toàn cầu.",field:"lien-nganh",sub:"Đạo đức & quản trị AI",type:"Bài tổng quan",ext:"",size:0,status:"approved",date:now()-86400000*3,downloads:0,flags:0,sample:true}
  ]);
  const t1=uid(), t2=uid();
  LS.set("threads", [
    {id:t1,title:"Làm thế nào để kết hợp phương pháp định lượng và định tính trong nghiên cứu chính sách?",cat:"Phương pháp nghiên cứu",author:"Minh Anh",body:"Mình đang làm đề tài về chính sách nhà ở đô thị và phân vân giữa khảo sát quy mô lớn và phỏng vấn sâu. Mọi người có kinh nghiệm thiết kế nghiên cứu hỗn hợp không?",date:now()-86400000*2,status:"approved",flags:0},
    {id:t2,title:"Nghiên cứu liên ngành: lợi ích và rào cản thực tế",cat:"Liên ngành",author:"Quản trị viên",body:"Chủ đề này dành cho các thảo luận về hợp tác giữa chính trị học, xã hội học, kinh tế và khoa học dữ liệu. Hãy chia sẻ kinh nghiệm của bạn.",date:now()-86400000,status:"approved",flags:0}
  ]);
  LS.set("replies", [
    {id:uid(),thread:t1,author:"Hoàng Lan",body:"Bạn có thể bắt đầu bằng phỏng vấn sâu để xây dựng bảng hỏi, sau đó khảo sát để kiểm chứng trên quy mô lớn (thiết kế tuần tự khám phá).",date:now()-86400000*2+3600000,status:"approved",flags:0}
  ]);
  LS.set("seeded", true);
}

/* ============ KIỂM DUYỆT CƠ BẢN ============ */
const strip = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D").toLowerCase();
function moderate(text){
  const reasons=[]; const raw=text.toLowerCase(); const plain=strip(text);
  for(const w of CONFIG.BANNED_WORDS){
    const a=w.toLowerCase(), b=strip(w);
    if(raw.includes(a) || plain.includes(b)){ reasons.push("Chứa từ ngữ không phù hợp"); break; }
  }
  const links=(text.match(/https?:\/\/|www\./gi)||[]).length;
  if(links>CONFIG.MAX_LINKS) reasons.push("Quá nhiều liên kết (nghi spam)");
  if(/(.)\1{9,}/.test(text)) reasons.push("Ký tự lặp bất thường");
  const letters=text.replace(/[^A-Za-zÀ-ỹ]/g,"");
  if(letters.length>30 && letters.replace(/[^A-ZÀ-Ỹ]/g,"").length/letters.length>0.7) reasons.push("Viết hoa toàn bộ");
  return {ok:reasons.length===0, reasons};
}
function rateLimit(key, ms=20000){
  const last=LS.get("rl_"+key,0);
  if(now()-last<ms){ toast("Vui lòng đợi vài giây trước khi gửi tiếp."); return false; }
  LS.set("rl_"+key, now()); return true;
}
const isMod = () => sessionStorage.getItem("ksx_mod")==="1";
function syncMod(){ document.body.classList.toggle("is-mod", isMod()); }

/* ============ ROUTER ============ */
const routes = {
  "": home, "library": library, "taxonomy": taxonomy, "forum": forum,
  "upload": upload, "mod": modPanel, "thread": threadView
};
function router(){
  const h = location.hash.replace(/^#\/?/,"");
  const [path, ...rest] = h.split("/");
  const [name, qs] = (path||"").split("?");
  const params = new URLSearchParams(qs||"");
  document.querySelectorAll("nav a").forEach(a=>a.classList.toggle("active", a.dataset.r===(name||"home")));
  $("#nav").classList.remove("open");
  (routes[name]||home)(params, rest);
  window.scrollTo(0,0);
}

/* ============ TRANG CHỦ ============ */
function home(){
  const docs=LS.get("docs",[]).filter(d=>d.status==="approved");
  const th=LS.get("threads",[]).filter(t=>t.status==="approved");
  const rp=LS.get("replies",[]).filter(r=>r.status==="approved");
  const latest=[...docs].sort((a,b)=>b.date-a.date).slice(0,3);
  $("#app").innerHTML=`
  <section class="hero">
    <h1>Nơi gặp gỡ của chính trị học, khoa học xã hội và nghiên cứu liên ngành</h1>
    <p>Chia sẻ tài liệu học thuật, tra cứu theo ngành – chuyên ngành, và tham gia thảo luận có trách nhiệm cùng cộng đồng nghiên cứu.</p>
    <div class="btns"><a class="btn gold" href="#/library">Khám phá thư viện</a><a class="btn ghost" href="#/upload">Đóng góp tài liệu</a></div>
  </section>
  <div class="stats">
    <div class="stat"><b>${docs.length}</b>Tài liệu</div>
    <div class="stat"><b>${TAXONOMY.length}</b>Lĩnh vực</div>
    <div class="stat"><b>${th.length}</b>Chủ đề thảo luận</div>
    <div class="stat"><b>${rp.length+th.length}</b>Bài viết</div>
  </div>
  <section class="block">
    <div class="section-head"><h2>Các lĩnh vực</h2><a href="#/taxonomy">Xem đầy đủ phân loại →</a></div>
    <div class="grid">${TAXONOMY.map(f=>`
      <a class="card hover" href="#/library?field=${f.id}"><div class="ico">${f.ico}</div><h3>${esc(f.name)}</h3>
      <p class="muted">${f.subs.length} chuyên ngành${f.inter?" · liên ngành":""}</p></a>`).join("")}</div>
  </section>
  <section class="block">
    <div class="section-head"><h2>Tài liệu mới</h2><a href="#/library">Tất cả tài liệu →</a></div>
    <div class="doc-list">${latest.map(docCard).join("")||'<div class="empty">Chưa có tài liệu.</div>'}</div>
  </section>`;
  bindDocActions();
}

/* ============ THƯ VIỆN ============ */
function docCard(d){
  const f=field(d.field);
  const cls=d.ext==="pdf"?"pdf":"word";
  return `<article class="card doc">
    <div class="file ${d.ext?cls:""}">${d.ext?d.ext.toUpperCase():"MẪU"}</div>
    <div style="flex:1;min-width:0">
      <h3>${esc(d.title)}</h3>
      <div><span class="tag">${f?esc(f.name):""}</span><span class="tag ${f&&f.inter?"inter":""}">${esc(d.sub)}</span><span class="tag">${esc(d.type)}</span>
      ${d.status==="pending"?'<span class="tag pending">Chờ duyệt</span>':""}</div>
      <p>${esc(d.desc)}</p>
      <div class="meta">${esc(d.author)} · ${fmtDate(d.date)}${d.size?" · "+fmtSize(d.size):""}${d.ext?" · "+d.downloads+" lượt tải":""}</div>
      <div class="actions">
        ${d.ext?`<button class="btn small" data-dl="${d.id}">⬇ Tải xuống</button>`:""}
        <button class="btn small ghost" data-flag="${d.id}">⚑ Báo cáo</button>
        ${isMod()?`<button class="btn small danger" data-del="${d.id}">Xóa</button>`:""}
      </div>
    </div></article>`;
}
function bindDocActions(){
  document.querySelectorAll("[data-dl]").forEach(b=>b.onclick=async()=>{
    const id=b.dataset.dl; const blob=await DB.get(id); const docs=LS.get("docs",[]); const d=docs.find(x=>x.id===id);
    if(!blob||!d) return toast("Không tìm thấy tệp (tệp lưu trên trình duyệt đã đăng tải).");
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=d.title.replace(/[^\w\- ]+/g,"").slice(0,60)+"."+d.ext; a.click();
    d.downloads++; LS.set("docs",docs); setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  });
  document.querySelectorAll("[data-flag]").forEach(b=>b.onclick=()=>flagItem("docs",b.dataset.flag));
  document.querySelectorAll("[data-del]").forEach(b=>b.onclick=async()=>{
    if(!confirm("Xóa tài liệu này?")) return;
    LS.set("docs",LS.get("docs",[]).filter(d=>d.id!==b.dataset.del)); await DB.del(b.dataset.del); router();
  });
}
function flagItem(key,id){
  const list=LS.get(key,[]); const it=list.find(x=>x.id===id); if(!it) return;
  const done=LS.get("flagged",[]); if(done.includes(id)) return toast("Bạn đã báo cáo nội dung này.");
  it.flags=(it.flags||0)+1;
  if(it.flags>=CONFIG.FLAG_AUTO_HIDE && it.status==="approved") it.status="pending";
  LS.set(key,list); LS.set("flagged",[...done,id]); toast("Đã gửi báo cáo tới ban kiểm duyệt."); router();
}
function library(p){
  const f=p.get("field")||"", s=p.get("sub")||"", q=(p.get("q")||"").toLowerCase(), t=p.get("type")||"";
  const fld=field(f);
  let docs=LS.get("docs",[]).filter(d=>d.status==="approved");
  if(f) docs=docs.filter(d=>d.field===f);
  if(s) docs=docs.filter(d=>d.sub===s);
  if(t) docs=docs.filter(d=>d.type===t);
  if(q) docs=docs.filter(d=>(d.title+" "+d.desc+" "+d.author).toLowerCase().includes(q));
  docs.sort((a,b)=>b.date-a.date);
  $("#app").innerHTML=`
  <h1 class="page-title">Thư viện tài liệu</h1>
  <form class="toolbar" id="flt">
    <input name="q" placeholder="Tìm theo tiêu đề, tác giả, nội dung…" value="${esc(p.get("q")||"")}">
    <select name="field"><option value="">Tất cả lĩnh vực</option>${TAXONOMY.map(x=>`<option value="${x.id}" ${x.id===f?"selected":""}>${esc(x.name)}</option>`).join("")}</select>
    <select name="sub"><option value="">Tất cả chuyên ngành</option>${(fld?fld.subs:[]).map(x=>`<option ${x===s?"selected":""}>${esc(x)}</option>`).join("")}</select>
    <select name="type"><option value="">Mọi loại</option>${DOC_TYPES.map(x=>`<option ${x===t?"selected":""}>${esc(x)}</option>`).join("")}</select>
    <button class="btn">Lọc</button>
  </form>
  <p class="muted">${docs.length} tài liệu</p>
  <div class="doc-list">${docs.map(docCard).join("")||'<div class="empty card">Không có tài liệu phù hợp. <a href="#/upload">Hãy đóng góp tài liệu đầu tiên!</a></div>'}</div>`;
  const form=$("#flt");
  form.field.onchange=()=>{ form.sub.value=""; form.requestSubmit(); };
  form.sub.onchange=form.type.onchange=()=>form.requestSubmit();
  form.onsubmit=e=>{ e.preventDefault(); const u=new URLSearchParams(); new FormData(form).forEach((v,k)=>v&&u.set(k,v)); location.hash="#/library?"+u; };
  bindDocActions();
}

/* ============ PHÂN LOẠI ============ */
function taxonomy(){
  const docs=LS.get("docs",[]).filter(d=>d.status==="approved");
  const cnt=(f,s)=>docs.filter(d=>d.field===f&&(!s||d.sub===s)).length;
  $("#app").innerHTML=`
  <h1 class="page-title">Phân loại ngành & chuyên ngành</h1>
  <p class="muted" style="max-width:700px">Chọn một chuyên ngành để xem tài liệu. Mục “Nghiên cứu liên ngành” dành cho các đề tài giao thoa giữa nhiều lĩnh vực.</p>
  <div class="tax-grid">${TAXONOMY.map(f=>`
    <div class="card tax-card ${f.inter?"inter-box":""}">
      <h3><span class="ico">${f.ico}</span><a href="#/library?field=${f.id}" style="text-decoration:none">${esc(f.name)}</a> <span class="muted">(${cnt(f.id)})</span></h3>
      <ul>${f.subs.map(s=>`<li><a href="#/library?field=${f.id}&sub=${encodeURIComponent(s)}">${esc(s)} <span class="muted">(${cnt(f.id,s)})</span></a></li>`).join("")}</ul>
    </div>`).join("")}</div>`;
}

/* ============ TẢI LÊN ============ */
function upload(){
  $("#app").innerHTML=`
  <h1 class="page-title">Đóng góp tài liệu</h1>
  <form class="form" id="upForm">
    <div class="notice">Chỉ nhận tệp <b>PDF, DOC, DOCX</b> tối đa ${CONFIG.MAX_FILE_MB} MB. Chỉ đăng tải tài liệu bạn có quyền chia sẻ. ${CONFIG.REQUIRE_APPROVAL?"Tài liệu sẽ hiển thị sau khi được kiểm duyệt.":""}</div>
    <div id="upErr"></div>
    <label>Tiêu đề *</label><input name="title" maxlength="160" required>
    <div class="row2"><div><label>Tác giả / Nguồn *</label><input name="author" maxlength="80" required></div>
    <div><label>Loại tài liệu *</label><select name="type">${DOC_TYPES.map(x=>`<option>${x}</option>`).join("")}</select></div></div>
    <div class="row2"><div><label>Lĩnh vực *</label><select name="field" id="fSel">${TAXONOMY.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("")}</select></div>
    <div><label>Chuyên ngành *</label><select name="sub" id="sSel"></select></div></div>
    <label>Mô tả ngắn *</label><textarea name="desc" maxlength="800" required placeholder="Tóm tắt nội dung, phương pháp, kết luận chính…"></textarea>
    <label>Tệp tài liệu *</label><input type="file" name="file" accept=".pdf,.doc,.docx" required>
    <p class="hint">Tệp được lưu trong trình duyệt (chế độ demo). Xem README để kết nối máy chủ thật.</p>
    <p><button class="btn gold" style="margin-top:12px">Gửi tài liệu</button></p>
  </form>`;
  const fSel=$("#fSel"), sSel=$("#sSel");
  const fill=()=>sSel.innerHTML=field(fSel.value).subs.map(s=>`<option>${esc(s)}</option>`).join("");
  fSel.onchange=fill; fill();
  $("#upForm").onsubmit=async e=>{
    e.preventDefault();
    const fd=new FormData(e.target), file=fd.get("file"), err=$("#upErr");
    const fail=m=>err.innerHTML=`<div class="notice err">${m}</div>`;
    const ext=(file.name.split(".").pop()||"").toLowerCase();
    if(!CONFIG.ALLOWED_EXT.includes(ext)) return fail("Định dạng tệp không được hỗ trợ.");
    if(file.size>CONFIG.MAX_FILE_MB*1048576) return fail(`Tệp vượt quá ${CONFIG.MAX_FILE_MB} MB.`);
    // kiểm tra "magic bytes" để chắc chắn đúng loại tệp
    const head=new Uint8Array(await file.slice(0,8).arrayBuffer());
    const isPDF=head[0]===0x25&&head[1]===0x50&&head[2]===0x44&&head[3]===0x46;
    const isZip=head[0]===0x50&&head[1]===0x4B;
    const isOle=head[0]===0xD0&&head[1]===0xCF;
    if((ext==="pdf"&&!isPDF)||(ext==="docx"&&!isZip)||(ext==="doc"&&!isOle)) return fail("Nội dung tệp không khớp với phần mở rộng.");
    const m=moderate([fd.get("title"),fd.get("desc"),fd.get("author")].join(" \n "));
    if(!m.ok) return fail("Không thể gửi: "+m.reasons.join("; ")+". Vui lòng chỉnh sửa nội dung.");
    if(!rateLimit("upload",30000)) return;
    const id=uid();
    await DB.put(id,file);
    const docs=LS.get("docs",[]);
    docs.push({id,title:fd.get("title").trim(),author:fd.get("author").trim(),desc:fd.get("desc").trim(),field:fd.get("field"),sub:fd.get("sub"),type:fd.get("type"),ext,size:file.size,status:CONFIG.REQUIRE_APPROVAL&&!isMod()?"pending":"approved",date:now(),downloads:0,flags:0});
    LS.set("docs",docs);
    toast(CONFIG.REQUIRE_APPROVAL&&!isMod()?"Đã gửi! Tài liệu đang chờ kiểm duyệt.":"Đã đăng tải thành công.");
    location.hash="#/library";
  };
}

/* ============ DIỄN ĐÀN ============ */
function forum(p){
  const cat=p.get("cat")||"";
  let th=LS.get("threads",[]).filter(t=>t.status==="approved");
  if(cat) th=th.filter(t=>t.cat===cat);
  const rp=LS.get("replies",[]).filter(r=>r.status==="approved");
  th.sort((a,b)=>lastAct(b,rp)-lastAct(a,rp));
  $("#app").innerHTML=`
  <div class="section-head page-title"><h1 style="margin:0">Diễn đàn</h1><button class="btn gold" id="newT">+ Chủ đề mới</button></div>
  <div class="notice">Quy tắc: tôn trọng người tham gia, tranh luận bằng lập luận và dẫn chứng, không công kích cá nhân, không spam, không kích động bạo lực hay thù ghét.</div>
  <div class="tabs"><button class="${!cat?"on":""}" data-c="">Tất cả</button>${FORUM_CATS.map(c=>`<button class="${c===cat?"on":""}" data-c="${esc(c)}">${esc(c)}</button>`).join("")}</div>
  <div id="newForm"></div>
  <div class="list-card">${th.map(t=>{const n=rp.filter(r=>r.thread===t.id).length; return `
    <a class="thread" href="#/thread/${t.id}"><div class="count"><b>${n}</b>trả lời</div>
    <div style="flex:1;min-width:0"><h3 style="margin:0 0 4px">${esc(t.title)}</h3><span class="tag">${esc(t.cat)}</span><span class="meta">${esc(t.author)} · ${fmtDate(t.date)}</span></div></a>`}).join("")||'<div class="empty">Chưa có chủ đề nào.</div>'}</div>`;
  document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>location.hash=b.dataset.c?"#/forum?cat="+encodeURIComponent(b.dataset.c):"#/forum");
  $("#newT").onclick=()=>{
    $("#newForm").innerHTML=`<form class="form" style="margin-bottom:20px;max-width:none" id="tf"><div id="tErr"></div>
      <div class="row2"><div><label>Tên hiển thị *</label><input name="author" maxlength="40" required value="${esc(LS.get("nick",""))}"></div>
      <div><label>Chuyên mục</label><select name="cat">${FORUM_CATS.map(c=>`<option ${c===cat?"selected":""}>${esc(c)}</option>`).join("")}</select></div></div>
      <label>Tiêu đề *</label><input name="title" maxlength="140" required>
      <label>Nội dung *</label><textarea name="body" maxlength="5000" required></textarea>
      <p><button class="btn gold">Đăng chủ đề</button></p></form>`;
    $("#tf").onsubmit=e=>{
      e.preventDefault(); const fd=new FormData(e.target);
      const m=moderate(fd.get("title")+" \n "+fd.get("body")+" \n "+fd.get("author"));
      if(!m.ok) return $("#tErr").innerHTML=`<div class="notice err">Không thể đăng: ${m.reasons.join("; ")}.</div>`;
      if(!rateLimit("post")) return;
      LS.set("nick",fd.get("author").trim());
      const list=LS.get("threads",[]); const id=uid();
      list.push({id,title:fd.get("title").trim(),cat:fd.get("cat"),author:fd.get("author").trim(),body:fd.get("body").trim(),date:now(),status:"approved",flags:0});
      LS.set("threads",list); location.hash="#/thread/"+id;
    };
  };
}
const lastAct=(t,rp)=>Math.max(t.date,...rp.filter(r=>r.thread===t.id).map(r=>r.date));

function threadView(p,rest){
  const id=rest[0]; const t=LS.get("threads",[]).find(x=>x.id===id&&(x.status==="approved"||isMod()));
  if(!t){ $("#app").innerHTML='<div class="empty card" style="margin-top:30px">Chủ đề không tồn tại hoặc đang chờ kiểm duyệt. <a href="#/forum">Quay lại diễn đàn</a></div>'; return; }
  const rp=LS.get("replies",[]).filter(r=>r.thread===id&&(r.status==="approved"||isMod())).sort((a,b)=>a.date-b.date);
  $("#app").innerHTML=`
  <p class="crumb"><a href="#/forum">← Diễn đàn</a></p>
  <h1 class="page-title" style="margin-top:12px">${esc(t.title)}</h1>
  <span class="tag">${esc(t.cat)}</span>
  <div class="post op" style="margin-top:12px"><div class="who">${esc(t.author)} <span class="meta">· ${fmtDate(t.date)}</span></div>${esc(t.body)}
    <div class="actions"><button class="btn small ghost" data-ft="${t.id}">⚑ Báo cáo</button>${isMod()?`<button class="btn small danger" data-dt="${t.id}">Xóa chủ đề</button>`:""}</div></div>
  <h3>${rp.length} trả lời</h3>
  ${rp.map(r=>`<div class="post"><div class="who">${esc(r.author)} <span class="meta">· ${fmtDate(r.date)}</span></div>${esc(r.body)}
    <div class="actions"><button class="btn small ghost" data-fr="${r.id}">⚑ Báo cáo</button>${isMod()?`<button class="btn small danger" data-dr="${r.id}">Xóa</button>`:""}</div></div>`).join("")}
  <form class="form" style="max-width:none" id="rf"><div id="rErr"></div>
    <label>Tên hiển thị *</label><input name="author" maxlength="40" required value="${esc(LS.get("nick",""))}">
    <label>Trả lời *</label><textarea name="body" maxlength="3000" required></textarea>
    <p><button class="btn">Gửi trả lời</button></p></form>`;
  $("[data-ft]").onclick=()=>flagItem("threads",id);
  document.querySelectorAll("[data-fr]").forEach(b=>b.onclick=()=>flagItem("replies",b.dataset.fr));
  const dt=$("[data-dt]"); if(dt) dt.onclick=()=>{ if(confirm("Xóa chủ đề?")){ LS.set("threads",LS.get("threads",[]).filter(x=>x.id!==id)); location.hash="#/forum"; } };
  document.querySelectorAll("[data-dr]").forEach(b=>b.onclick=()=>{ LS.set("replies",LS.get("replies",[]).filter(x=>x.id!==b.dataset.dr)); router(); });
  $("#rf").onsubmit=e=>{
    e.preventDefault(); const fd=new FormData(e.target);
    const m=moderate(fd.get("body")+" \n "+fd.get("author"));
    if(!m.ok) return $("#rErr").innerHTML=`<div class="notice err">Không thể gửi: ${m.reasons.join("; ")}.</div>`;
    if(!rateLimit("post")) return;
    LS.set("nick",fd.get("author").trim());
    const l=LS.get("replies",[]); l.push({id:uid(),thread:id,author:fd.get("author").trim(),body:fd.get("body").trim(),date:now(),status:"approved",flags:0});
    LS.set("replies",l); router();
  };
}

/* ============ KIỂM DUYỆT ============ */
function modPanel(){
  if(!isMod()){
    $("#app").innerHTML=`<h1 class="page-title">Khu vực kiểm duyệt</h1><form class="form" id="lg"><label>Mã quản trị</label><input type="password" name="c" required><p><button class="btn" style="margin-top:12px">Đăng nhập</button></p>
    <p class="hint">Chế độ demo: mã được kiểm tra trong trình duyệt. Khi triển khai thật, hãy dùng xác thực phía máy chủ.</p></form>`;
    $("#lg").onsubmit=e=>{ e.preventDefault(); if(e.target.c.value===CONFIG.MOD_PASSCODE){ sessionStorage.setItem("ksx_mod","1"); syncMod(); router(); } else toast("Sai mã."); };
    return;
  }
  const docs=LS.get("docs",[]).filter(d=>d.status==="pending");
  const th=LS.get("threads",[]).filter(d=>d.status==="pending");
  const rp=LS.get("replies",[]).filter(d=>d.status==="pending");
  $("#app").innerHTML=`
  <div class="section-head page-title"><h1 style="margin:0">Hàng chờ kiểm duyệt</h1><button class="btn ghost small" id="out">Đăng xuất</button></div>
  <h2>Tài liệu (${docs.length})</h2><div class="doc-list">${docs.map(d=>docCard(d)+`<div class="actions" style="margin:-6px 0 6px"><button class="btn small ok" data-ap="docs:${d.id}">✓ Duyệt</button></div>`).join("")||'<div class="empty card">Không có tài liệu chờ duyệt.</div>'}</div>
  <h2 style="margin-top:32px">Chủ đề (${th.length})</h2>${th.map(t=>`<div class="post"><b>${esc(t.title)}</b><br>${esc(t.body)}<div class="actions"><button class="btn small ok" data-ap="threads:${t.id}">✓ Duyệt</button><button class="btn small danger" data-rm="threads:${t.id}">Xóa</button></div></div>`).join("")||'<div class="empty card">Không có.</div>'}
  <h2 style="margin-top:32px">Trả lời (${rp.length})</h2>${rp.map(t=>`<div class="post">${esc(t.body)}<div class="actions"><button class="btn small ok" data-ap="replies:${t.id}">✓ Duyệt</button><button class="btn small danger" data-rm="replies:${t.id}">Xóa</button></div></div>`).join("")||'<div class="empty card">Không có.</div>'}
  <h2 style="margin-top:32px">Từ cấm hiện tại</h2><p class="muted">Chỉnh trong <code>CONFIG.BANNED_WORDS</code> ở app.js.</p><p>${CONFIG.BANNED_WORDS.map(w=>`<span class="tag flag">${esc(w)}</span>`).join("")}</p>`;
  $("#out").onclick=()=>{ sessionStorage.removeItem("ksx_mod"); syncMod(); location.hash="#/"; };
  document.querySelectorAll("[data-ap]").forEach(b=>b.onclick=()=>{ const [k,id]=b.dataset.ap.split(":"); const l=LS.get(k,[]); const it=l.find(x=>x.id===id); it.status="approved"; it.flags=0; LS.set(k,l); router(); });
  document.querySelectorAll("[data-rm]").forEach(b=>b.onclick=()=>{ const [k,id]=b.dataset.rm.split(":"); LS.set(k,LS.get(k,[]).filter(x=>x.id!==id)); router(); });
  document.querySelectorAll("[data-del]").forEach(()=>{});
  bindDocActions();
}

/* ============ KHỞI ĐỘNG ============ */
seed(); syncMod();
$("#menuBtn").onclick=()=>$("#nav").classList.toggle("open");
window.addEventListener("hashchange",router);
router();
