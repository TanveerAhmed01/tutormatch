// ─── API CONFIGURATION ───────────────────────────────────────────────────────
const API_BASE_URL = 'https://tutormatch-beige.vercel.app'

// Make it globally available for all fetch calls
window.API_BASE_URL = API_BASE_URL

// Log for debugging
console.log('✅ API_BASE_URL set to:', API_BASE_URL)
import { useState, useRef, useEffect } from "react";

// ─── THEME ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#0A0E1A", surface: "#111827", card: "#161D2F", border: "#1E293B",
  accent: "#6EE7B7", alt: "#818CF8", gold: "#F59E0B",
  text: "#F1F5F9", muted: "#64748B", danger: "#F87171",
};

const SUBJECTS = ["Computer Science","Mathematics","Physics","Biology","History","Economics","Chemistry","Psychology"];
const AVATARS  = ["👩‍💻","👨‍🔬","👩‍⚕️","👨‍💼","👩‍🏫","👨‍🎓","👩‍🔭","👨‍🏫","👩‍💼","👨‍💻"];
const SLOTS    = ["Mon 9am","Mon 2pm","Mon 6pm","Tue 10am","Tue 4pm","Wed 9am","Wed 2pm","Wed 6pm","Thu 11am","Thu 5pm","Fri 10am","Fri 3pm","Sat 10am","Sat 2pm","Sun 11am"];

const PLANS = [
  { id:"free",  name:"Free",  price:0,      color:C.muted,  features:["5 AI questions/day","MCQ only","1 subject","Basic analytics"],                                              cta:"Get Started",     popular:false },
  { id:"pro",   name:"Pro",   price:200,    color:C.accent, features:["Unlimited AI questions","MCQ + Short + Essay","All subjects","PDF/PPT uploads","Full analytics","Priority AI"], cta:"Start Free Trial",popular:true  },
  { id:"team",  name:"Team",  price:500,   color:C.alt,    features:["Everything in Pro","Up to 10 users","Shared question banks","Teacher dashboard","Export reports","Custom branding"], cta:"Contact Sales",   popular:false },
];

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${C.bg};color:${C.text};font-family:'DM Sans',sans-serif;overflow-x:hidden}
  ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:${C.surface}}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
  button{cursor:pointer;border:none;font-family:inherit}input,textarea,select{font-family:inherit}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
  @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(110,231,183,.15)}50%{box-shadow:0 0 40px rgba(110,231,183,.38)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  .fadeUp{animation:fadeUp .45s ease forwards}
  .glow{animation:glow 2s ease-in-out infinite}
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const inp = () => ({
  background:C.surface, border:`1px solid ${C.border}`, color:C.text,
  borderRadius:8, padding:"11px 14px", fontSize:14, width:"100%",
  outline:"none", transition:"border-color .2s",
});
const fa = e => { e.target.style.borderColor=C.accent; };
const fb = e => { e.target.style.borderColor=C.border; };
const lbl = {fontSize:12,color:C.muted,textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:8};

function Dots() {
  return (
    <span style={{display:"flex",gap:5,alignItems:"center"}}>
      {[0,1,2].map(i=>(
        <span key={i} style={{width:7,height:7,borderRadius:"50%",background:C.accent,
          animation:`pulse 1.2s ease-in-out ${i*.2}s infinite`,display:"inline-block"}}/>
      ))}
    </span>
  );
}

function Badge({children,color=C.accent}){
  return(
    <span style={{background:color+"22",color,border:`1px solid ${color}44`,
      padding:"2px 10px",borderRadius:99,fontSize:11,fontFamily:"'DM Mono',monospace",
      fontWeight:500,letterSpacing:1,textTransform:"uppercase",whiteSpace:"nowrap"}}>
      {children}
    </span>
  );
}

function Btn({children,onClick,variant="primary",disabled=false,full=false,style:sx={}}){
  const base={padding:"12px 24px",borderRadius:10,fontWeight:700,fontSize:14,fontFamily:"'Syne',sans-serif",transition:"all .2s",width:full?"100%":"auto",opacity:disabled?.6:1,cursor:disabled?"not-allowed":"pointer",...sx};
  const map={
    primary:{...base,background:C.accent,color:"#0A0E1A",border:"none"},
    secondary:{...base,background:"transparent",color:C.accent,border:`1px solid ${C.accent}`},
    ghost:{...base,background:"transparent",color:C.muted,border:`1px solid ${C.border}`},
    alt:{...base,background:C.alt,color:"#fff",border:"none"},
  };
  return <button onClick={!disabled?onClick:undefined} style={map[variant]||map.primary}>{children}</button>;
}

// ─── STORAGE ─────────────────────────────────────────────────────────────────
const SK  = "tutormatch-users-v1";
const MK  = "tutormatch-messages-v1";
const AK  = "tutormatch-analytics-v1";

function loadUsers(){ try{ const r=localStorage.getItem(SK); return r?JSON.parse(r):[]; }catch{ return []; } }
function saveUsers(u){ try{ localStorage.setItem(SK,JSON.stringify(u)); }catch{} }
function loadMessages(){ try{ const r=localStorage.getItem(MK); return r?JSON.parse(r):{}; }catch{ return {}; } }
function saveMessages(m){ try{ localStorage.setItem(MK,JSON.stringify(m)); }catch{} }
function loadAnalytics(){ try{ const r=localStorage.getItem(AK); return r?JSON.parse(r):{}; }catch{ return {}; } }
function saveAnalytics(a){ try{ localStorage.setItem(AK,JSON.stringify(a)); }catch{} }
function recordQuizResult(userId, topic, score, total){
  const all = loadAnalytics();
  const prev = all[userId]||[];
  all[userId] = [...prev, { date: new Date().toISOString(), topic, score, total }];
  saveAnalytics(all);
}

// conversationKey: always sort IDs so A→B and B→A use same key
function convKey(a,b){ return [a,b].sort().join("_"); }

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({onAuth}){
  const [mode,setMode]   = useState("landing");
  const [role,setRole]   = useState(null);
  const [error,setError] = useState("");
  const [info,setInfo]   = useState("");
  const [form,setForm]   = useState({name:"",email:"",password:"",subjects:[],rate:"",bio:"",slots:[],experience:""});

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const tog = (k,v) => set(k, form[k].includes(v)?form[k].filter(x=>x!==v):[...form[k],v]);

  const handleLogin = () => {
    setError(""); setInfo("");
    const u = loadUsers().find(u=>u.email===form.email&&u.password===form.password);
    if(!u){ setError("Invalid email or password."); return; }
    onAuth(u);
  };

  const handleForgotPassword = () => {
    setError(""); setInfo("");
    if(!form.email.trim()){ setError("Enter your email address first."); return; }
    const u = loadUsers().find(u=>u.email===form.email);
    if(!u){ setError("No account found with that email."); return; }
    // In a real app this would send an email. Here we show their password hint.
    setInfo(`Password reset: your password is "${u.password.slice(0,2)}${"•".repeat(u.password.length-2)}". Please check your email for a reset link.`);
  };

  const handleRegister = () => {
    setError("");
    if(!form.name||!form.email||!form.password){ setError("Please fill all required fields."); return; }
    if(form.password.length<6){ setError("Password must be at least 6 characters."); return; }
    if(role==="tutor"&&!form.subjects.length){ setError("Select at least one subject."); return; }
    if(role==="tutor"&&!form.rate){ setError("Please enter your hourly rate."); return; }
    if(role==="tutor"&&!form.bio){ setError("Please add a short bio."); return; }
    const users = loadUsers();
    if(users.find(u=>u.email===form.email)){ setError("Email already registered."); return; }
    const ai = users.filter(u=>u.role==="tutor").length % AVATARS.length;
    const newUser = {
      id:Date.now(), role, name:form.name, email:form.email, password:form.password,
      ...(role==="tutor"&&{subjects:form.subjects,rate:parseFloat(form.rate)||500,bio:form.bio,slots:form.slots.length?form.slots:[SLOTS[0],SLOTS[4],SLOTS[8]],experience:form.experience,avatar:AVATARS[ai],rating:null,reviews:0,badge:null}),
    };
    saveUsers([...users,newUser]);
    onAuth(newUser);
  };

  // ── Landing ──
  if(mode==="landing") return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div className="fadeUp" style={{textAlign:"center",marginBottom:48}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:44,letterSpacing:-1}}>
          Tutor<span style={{color:C.accent}}>Match</span>
        </div>
        <p style={{color:C.muted,marginTop:10,fontSize:16}}>The AI-powered learning platform</p>
      </div>
      <div className="fadeUp" style={{display:"flex",gap:22,flexWrap:"wrap",justifyContent:"center",marginBottom:40}}>
        {[
          {icon:"🎓",title:"I'm a Student",desc:"Find tutors, generate practice questions, and track your progress.",color:C.accent,r:"student"},
          {icon:"📚",title:"I'm a Tutor",desc:"Register your profile and get matched with students who need your expertise.",color:C.alt,r:"tutor"},
        ].map(({icon,title,desc,color,r})=>(
          <div key={r} onClick={()=>{setRole(r);setMode("reg-"+r);}}
            style={{background:C.card,border:`2px solid ${C.border}`,borderRadius:20,padding:"34px 30px",textAlign:"center",width:268,cursor:"pointer",transition:"all .25s"}}
            onMouseOver={e=>{e.currentTarget.style.borderColor=color;e.currentTarget.style.transform="translateY(-4px)";}}
            onMouseOut={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="translateY(0)";}}>
            <div style={{fontSize:50,marginBottom:14}}>{icon}</div>
            <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:19,color}}>{title}</h3>
            <p style={{color:C.muted,fontSize:13,marginTop:8,lineHeight:1.6}}>{desc}</p>
            <div style={{marginTop:18,background:color+"22",color,border:`1px solid ${color}44`,padding:"7px 18px",borderRadius:8,fontSize:13,fontWeight:700,display:"inline-block"}}>Register →</div>
          </div>
        ))}
      </div>
      <p style={{color:C.muted,fontSize:14}}>Already have an account? <span onClick={()=>setMode("login")} style={{color:C.accent,cursor:"pointer",fontWeight:600}}>Sign in</span></p>
    </div>
  );

  // ── Login ──
  if(mode==="login") return(
    <Shell title="Welcome back" sub="Sign in to your Tutor Match account" onBack={()=>setMode("landing")}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div><label style={lbl}>Email</label><input value={form.email} onChange={e=>set("email",e.target.value)} placeholder="you@email.com" style={inp()} onFocus={fa} onBlur={fb}/></div>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <label style={{...lbl,marginBottom:0}}>Password</label>
            <span onClick={handleForgotPassword} style={{fontSize:12,color:C.accent,cursor:"pointer",fontWeight:500}}>Forgot password?</span>
          </div>
          <input type="password" value={form.password} onChange={e=>set("password",e.target.value)} placeholder="••••••••" style={inp()} onFocus={fa} onBlur={fb}/>
        </div>
        {error&&<p style={{color:C.danger,fontSize:13}}>{error}</p>}
        {info&&<div style={{background:C.accent+"15",border:`1px solid ${C.accent}44`,borderRadius:8,padding:"10px 13px",fontSize:13,color:C.accent,lineHeight:1.5}}>{info}</div>}
        <Btn full onClick={handleLogin}>Sign In</Btn>
        <p style={{textAlign:"center",color:C.muted,fontSize:13}}>No account? <span onClick={()=>setMode("landing")} style={{color:C.accent,cursor:"pointer",fontWeight:600}}>Register here</span></p>
      </div>
    </Shell>
  );

  // ── Register Student ──
  if(mode==="reg-student") return(
    <Shell title="Create Student Account" sub="Start learning with AI-powered tools" onBack={()=>setMode("landing")}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div><label style={lbl}>Full Name *</label><input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Your name" style={inp()} onFocus={fa} onBlur={fb}/></div>
        <div><label style={lbl}>Email *</label><input value={form.email} onChange={e=>set("email",e.target.value)} placeholder="you@email.com" style={inp()} onFocus={fa} onBlur={fb}/></div>
        <div><label style={lbl}>Password *</label><input type="password" value={form.password} onChange={e=>set("password",e.target.value)} placeholder="Min. 6 characters" style={inp()} onFocus={fa} onBlur={fb}/></div>
        {error&&<p style={{color:C.danger,fontSize:13}}>{error}</p>}
        <Btn full onClick={handleRegister}>Create Student Account 🎓</Btn>
        <p style={{textAlign:"center",color:C.muted,fontSize:13}}>Have an account? <span onClick={()=>setMode("login")} style={{color:C.accent,cursor:"pointer",fontWeight:600}}>Sign in</span></p>
      </div>
    </Shell>
  );

  // ── Register Tutor ──
  if(mode==="reg-tutor") return(
    <Shell title="Register as a Tutor" sub="Set up your profile and get matched with students" onBack={()=>setMode("landing")} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div><label style={lbl}>Full Name *</label><input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Your name" style={inp()} onFocus={fa} onBlur={fb}/></div>
        <div><label style={lbl}>Email *</label><input value={form.email} onChange={e=>set("email",e.target.value)} placeholder="you@email.com" style={inp()} onFocus={fa} onBlur={fb}/></div>
        <div><label style={lbl}>Password *</label><input type="password" value={form.password} onChange={e=>set("password",e.target.value)} placeholder="Min. 6 chars" style={inp()} onFocus={fa} onBlur={fb}/></div>
        <div><label style={lbl}>Hourly Rate (৳ Taka) *</label><input type="number" value={form.rate} onChange={e=>set("rate",e.target.value)} placeholder="e.g. 500" style={inp()} onFocus={fa} onBlur={fb}/></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>Short Bio *</label><textarea value={form.bio} onChange={e=>set("bio",e.target.value)} rows={3} placeholder="e.g. MSc Computer Science. 3 years tutoring experience in algorithms..." style={{...inp(),resize:"vertical",lineHeight:1.6}} onFocus={fa} onBlur={fb}/></div>
        <div style={{gridColumn:"1/-1"}}><label style={lbl}>Experience / Qualifications</label><input value={form.experience} onChange={e=>set("experience",e.target.value)} placeholder="e.g. PhD candidate, former teacher..." style={inp()} onFocus={fa} onBlur={fb}/></div>
        <div style={{gridColumn:"1/-1"}}>
          <label style={lbl}>Subjects You Teach * <span style={{color:C.muted,fontWeight:400,fontSize:11,textTransform:"none"}}>(select all that apply)</span></label>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:4}}>
            {SUBJECTS.map(s=>{const on=form.subjects.includes(s);return(
              <button key={s} onClick={()=>tog("subjects",s)} style={{padding:"7px 13px",borderRadius:8,fontSize:13,fontWeight:600,background:on?C.accent+"22":C.surface,color:on?C.accent:C.muted,border:`1px solid ${on?C.accent+"66":C.border}`,transition:"all .2s"}}>{s}</button>
            );})}
          </div>
        </div>
        <div style={{gridColumn:"1/-1"}}>
          <label style={lbl}>Available Time Slots <span style={{color:C.muted,fontWeight:400,fontSize:11,textTransform:"none"}}>(pick your recurring slots)</span></label>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:4}}>
            {SLOTS.map(s=>{const on=form.slots.includes(s);return(
              <button key={s} onClick={()=>tog("slots",s)} style={{padding:"6px 11px",borderRadius:7,fontSize:12,fontWeight:500,background:on?C.alt+"22":C.surface,color:on?C.alt:C.muted,border:`1px solid ${on?C.alt+"66":C.border}`,transition:"all .2s"}}>{s}</button>
            );})}
          </div>
        </div>
      </div>
      {error&&<p style={{color:C.danger,fontSize:13,marginTop:12}}>{error}</p>}
      <Btn full onClick={handleRegister} style={{marginTop:18}}>Register as Tutor 📚</Btn>
      <p style={{textAlign:"center",color:C.muted,fontSize:13,marginTop:12}}>Have an account? <span onClick={()=>setMode("login")} style={{color:C.accent,cursor:"pointer",fontWeight:600}}>Sign in</span></p>
    </Shell>
  );

  return null;
}

function Shell({title,sub,onBack,children,wide=false}){
  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 16px"}}>
      <div className="fadeUp" style={{width:"100%",maxWidth:wide?680:440}}>
        <button onClick={onBack} style={{background:"none",color:C.muted,fontSize:13,marginBottom:22,display:"flex",alignItems:"center",gap:6}}>← Back</button>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:26,marginBottom:4}}>{title}</div>
        <p style={{color:C.muted,fontSize:14,marginBottom:24}}>{sub}</p>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:26}}>{children}</div>
      </div>
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function NavBar({page,setPage,plan,user,onLogout}){
  // Tutors: home, profile, messages
  // Students: home, generate, quiz, tutors, analytics, pricing, messages
  const links = user?.role==="tutor"
    ? ["home","profile","messages"]
    : ["home","generate","quiz","tutors","analytics","pricing","messages"];
  return(
    <nav style={{position:"sticky",top:0,zIndex:100,background:C.bg+"ee",backdropFilter:"blur(16px)",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",height:60,gap:12}}>
      <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:21}}>
          Tutor<span style={{color:C.accent}}>Match</span>
        </span>
        {plan!=="free"&&user?.role!=="tutor"&&<Badge color={plan==="pro"?C.accent:C.alt}>{plan}</Badge>}
      </div>
      <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
        {links.map(l=>(
          <button key={l} onClick={()=>setPage(l)} style={{background:page===l?C.accent+"18":"transparent",color:page===l?C.accent:C.muted,border:page===l?`1px solid ${C.accent}33`:"1px solid transparent",padding:"6px 13px",borderRadius:8,fontSize:13,fontWeight:500,textTransform:"capitalize",transition:"all .2s"}}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:13,fontWeight:600}}>{user?.name}</div>
          <div style={{fontSize:11,color:C.muted,textTransform:"capitalize"}}>{user?.role}</div>
        </div>
        <button onClick={onLogout} style={{background:C.surface,border:`1px solid ${C.border}`,color:C.muted,padding:"6px 13px",borderRadius:8,fontSize:12}}>Sign Out</button>
      </div>
    </nav>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomePage({setPage,user}){
  const isTutor = user?.role==="tutor";

  const studentFeatures=[
    {icon:"🧠",title:"AI Question Generator",desc:"Upload PDFs or PPTs and instantly generate MCQs, short-answer, and essay questions."},
    {icon:"🎯",title:"AI Tutor Matching",desc:"Describe your goals and AI matches you with registered tutors instantly."},
    {icon:"⚡",title:"Adaptive Quizzes",desc:"AI adjusts difficulty in real-time based on your answers."},
    {icon:"💬",title:"Direct Messaging",desc:"Chat directly with your tutor to ask questions and plan sessions."},
  ];

  const tutorFeatures=[
    {icon:"🎯",title:"Smart Profile Matching",desc:"Students are matched to you by AI based on your subjects and expertise."},
    {icon:"💬",title:"Direct Messaging",desc:"Chat with students directly to discuss their needs and schedule sessions."},
    {icon:"📅",title:"Availability Management",desc:"Set your recurring slots so students can book sessions that fit your schedule."},
    {icon:"🌟",title:"Build Your Reputation",desc:"Earn ratings and reviews as you help students succeed."},
  ];

  const features = isTutor ? tutorFeatures : studentFeatures;

  return(
    <div style={{padding:"0 28px 80px",maxWidth:1060,margin:"0 auto"}}>
      <div className="fadeUp" style={{textAlign:"center",padding:"68px 0 52px"}}>
        <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"clamp(34px,5.5vw,66px)",lineHeight:1.06}}>
          {isTutor ? <>Welcome,<br/><span style={{color:C.accent}}>{user.name}!</span></> : <>Study Smarter.<br/><span style={{color:C.accent}}>Not Harder.</span></>}
        </h1>
        <p style={{color:C.muted,fontSize:16,marginTop:16,maxWidth:500,margin:"16px auto 0",lineHeight:1.6}}>
          {isTutor
            ? "Your tutor profile is live. Students can now find and book sessions with you."
            : "Upload your lecture slides, let AI generate practice questions, and ace your exams."}
        </p>
        {!isTutor&&(
          <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:30,flexWrap:"wrap"}}>
            <Btn onClick={()=>setPage("generate")}>Generate Questions →</Btn>
            <Btn variant="alt" onClick={()=>setPage("tutors")}>Find a Tutor 🎯</Btn>
          </div>
        )}
        {isTutor&&(
          <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:30,flexWrap:"wrap"}}>
            <Btn onClick={()=>setPage("profile")}>Edit My Profile →</Btn>
            <Btn variant="secondary" onClick={()=>setPage("messages")}>View Messages 💬</Btn>
          </div>
        )}
      </div>

      {!isTutor&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:C.border,borderRadius:14,overflow:"hidden",marginBottom:50}}>
          {[["12,000+","Students"],["98%","Pass Rate"],["500K+","Questions"]].map(([n,l])=>(
            <div key={l} style={{background:C.card,padding:22,textAlign:"center"}}>
              <div style={{fontSize:28,fontWeight:800,fontFamily:"'Syne',sans-serif",color:C.accent}}>{n}</div>
              <div style={{color:C.muted,fontSize:13,marginTop:3}}>{l}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16}}>
        {features.map((f,i)=>(
          <div key={i} className="fadeUp" style={{animationDelay:`${i*.09}s`,background:C.card,border:`1px solid ${C.border}`,borderRadius:13,padding:24,transition:"border-color .2s",cursor:"default"}}
            onMouseOver={e=>e.currentTarget.style.borderColor=C.accent+"66"}
            onMouseOut={e=>e.currentTarget.style.borderColor=C.border}>
            <span style={{fontSize:32}}>{f.icon}</span>
            <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,marginTop:11}}>{f.title}</h3>
            <p style={{color:C.muted,fontSize:13,marginTop:6,lineHeight:1.6}}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MESSAGES / CHAT PAGE ─────────────────────────────────────────────────────
function MessagesPage({user}){
  const [allUsers]             = useState(()=>loadUsers());
  const [messages,setMessages] = useState(()=>loadMessages());
  const [activeConv,setActiveConv] = useState(null);
  const [text,setText]         = useState("");
  const [attachPreview,setAttachPreview] = useState(null); // {name,type,data,isImage}
  const bottomRef              = useRef(null);
  const fileInputRef           = useRef(null);
  const imgInputRef            = useRef(null);

  const contacts = allUsers.filter(u=>{
    if(u.id===user.id) return false;
    const key = convKey(user.id, u.id);
    const hasChat = messages[key]&&messages[key].length>0;
    if(user.role==="student") return u.role==="tutor";
    return hasChat;
  });

  const activeUser = allUsers.find(u=>u.id===activeConv);
  const chatKey    = activeConv ? convKey(user.id, activeConv) : null;
  const chat       = chatKey ? (messages[chatKey]||[]) : [];

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"});
  },[chat.length, activeConv]);

  // Read file as base64 data URL
  const readFile = (file) => new Promise((resolve,reject)=>{
    const r = new FileReader();
    r.onload = ()=>resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

  const handleAttachFile = async(e)=>{
    const file = e.target.files[0];
    if(!file) return;
    const isImage = file.type.startsWith("image/");
    const isAllowed = isImage || file.type==="application/pdf" ||
      file.name.match(/\.pptx?$/i) || file.name.match(/\.docx?$/i);
    if(!isAllowed){ alert("Only images, PDF, PPT, and DOC files are supported."); return; }
    // Warn if file > 2MB
    if(file.size > 2*1024*1024){ alert("File is too large. Please use files under 2MB."); return; }
    const data = await readFile(file);
    setAttachPreview({ name:file.name, type:file.type, data, isImage });
    e.target.value="";
  };

  const clearAttach = ()=>setAttachPreview(null);

  const sendMessage = ()=>{
    if(!text.trim()&&!attachPreview) return;
    if(!chatKey) return;
    const msg = {
      id:Date.now(), from:user.id,
      text:text.trim()||"",
      time:new Date().toISOString(),
      ...(attachPreview&&{attach:{name:attachPreview.name,type:attachPreview.type,data:attachPreview.data,isImage:attachPreview.isImage}}),
    };
    const updated = {...messages,[chatKey]:[...(messages[chatKey]||[]),msg]};
    setMessages(updated);
    saveMessages(updated);
    setText("");
    setAttachPreview(null);
  };

  const formatTime = iso=>{
    const d=new Date(iso);
    return d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
  };

  const lastMsg = (otherId)=>{
    const key=convKey(user.id,otherId);
    const msgs=messages[key]||[];
    return msgs[msgs.length-1]||null;
  };

  const unreadCount = (otherId)=>{
    const key=convKey(user.id,otherId);
    return (messages[key]||[]).filter(m=>m.from!==user.id&&!m.read).length;
  };

  // File type icon
  const fileIcon = (type,name)=>{
    if(name?.match(/\.pptx?$/i)) return "📊";
    if(name?.match(/\.docx?$/i)) return "📄";
    if(type?.includes("pdf"))     return "📕";
    return "📎";
  };

  const tutors = allUsers.filter(u=>u.role==="tutor");

  return(
    <div style={{display:"flex",height:"calc(100vh - 60px)",overflow:"hidden"}}>
      {/* Sidebar */}
      <div style={{width:280,flexShrink:0,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",background:C.card}}>
        <div style={{padding:"18px 16px 12px",borderBottom:`1px solid ${C.border}`}}>
          <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16}}>Messages</h3>
          <p style={{color:C.muted,fontSize:12,marginTop:3}}>
            {user.role==="student"?`${tutors.length} tutor${tutors.length!==1?"s":""} available`:"Your conversations"}
          </p>
        </div>
        <div style={{flex:1,overflowY:"auto"}}>
          {contacts.length===0&&(
            <div style={{padding:24,textAlign:"center",color:C.muted,fontSize:13}}>
              {user.role==="tutor"?"No student messages yet.":"No tutors registered yet."}
            </div>
          )}
          {contacts.map(c=>{
            const last=lastMsg(c.id);
            const unread=unreadCount(c.id);
            const active=activeConv===c.id;
            const lastPreview = last ? (last.attach ? (last.attach.isImage?"📷 Photo":fileIcon(last.attach.type,last.attach.name)+" "+last.attach.name) : last.text) : "Start a conversation";
            return(
              <div key={c.id} onClick={()=>setActiveConv(c.id)}
                style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:active?C.accent+"10":"transparent",borderLeft:active?`3px solid ${C.accent}`:"3px solid transparent",transition:"all .15s"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:C.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,border:`1px solid ${C.border}`}}>
                    {c.role==="tutor"?c.avatar:"🎓"}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontWeight:600,fontSize:14,color:active?C.accent:C.text}}>{c.name}</span>
                      {unread>0&&<span style={{background:C.accent,color:"#0A0E1A",borderRadius:99,fontSize:10,fontWeight:700,padding:"1px 7px",minWidth:18,textAlign:"center"}}>{unread}</span>}
                    </div>
                    <div style={{fontSize:12,color:C.muted,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {c.role==="tutor"&&<span style={{color:C.alt,fontSize:11}}>{(c.subjects||[]).slice(0,2).join(", ")} · </span>}
                      {lastPreview}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      {!activeConv?(
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,color:C.muted}}>
          <span style={{fontSize:52}}>💬</span>
          <p style={{fontWeight:600,fontSize:16,color:C.text}}>Select a conversation</p>
          <p style={{fontSize:13}}>{user.role==="student"?"Pick a tutor from the list to start chatting":"Waiting for student messages"}</p>
        </div>
      ):(
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {/* Header */}
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,background:C.card}}>
            <div style={{width:40,height:40,borderRadius:"50%",background:C.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,border:`1px solid ${C.border}`}}>
              {activeUser?.role==="tutor"?activeUser.avatar:"🎓"}
            </div>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15}}>{activeUser?.name}</div>
              <div style={{fontSize:12,color:C.muted,textTransform:"capitalize"}}>
                {activeUser?.role==="tutor"?`৳${activeUser.rate}/hr · ${(activeUser.subjects||[]).slice(0,2).join(", ")}`:"Student"}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{flex:1,overflowY:"auto",padding:"20px 20px 8px",display:"flex",flexDirection:"column",gap:10}}>
            {chat.length===0&&(
              <div style={{textAlign:"center",color:C.muted,fontSize:13,marginTop:40}}>
                <div style={{fontSize:40,marginBottom:10}}>👋</div>
                <p>Start the conversation with {activeUser?.name}!</p>
                {user.role==="student"&&activeUser?.role==="tutor"&&(
                  <p style={{marginTop:6,color:C.muted,fontSize:12}}>Tutor charges ৳{activeUser?.rate}/hr · You can share files and images here</p>
                )}
              </div>
            )}
            {chat.map((msg,i)=>{
              const isMe=msg.from===user.id;
              const sender=allUsers.find(u=>u.id===msg.from);
              return(
                <div key={msg.id} style={{display:"flex",flexDirection:isMe?"row-reverse":"row",gap:8,alignItems:"flex-end"}}>
                  {!isMe&&(
                    <div style={{width:30,height:30,borderRadius:"50%",background:C.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>
                      {sender?.role==="tutor"?sender.avatar:"🎓"}
                    </div>
                  )}
                  <div style={{maxWidth:"68%",display:"flex",flexDirection:"column",gap:4}}>
                    {/* Attachment */}
                    {msg.attach&&(
                      <div style={{background:isMe?C.accent+"22":C.card,border:`1px solid ${isMe?C.accent+"55":C.border}`,borderRadius:12,overflow:"hidden"}}>
                        {msg.attach.isImage?(
                          <img src={msg.attach.data} alt={msg.attach.name} style={{maxWidth:260,maxHeight:200,display:"block",objectFit:"cover"}}
                            onError={e=>{e.target.style.display="none";}} />
                        ):(
                          <a href={msg.attach.data} download={msg.attach.name} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",textDecoration:"none"}}>
                            <span style={{fontSize:24}}>{fileIcon(msg.attach.type,msg.attach.name)}</span>
                            <div>
                              <div style={{fontSize:13,fontWeight:600,color:isMe?C.accent:C.text,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{msg.attach.name}</div>
                              <div style={{fontSize:11,color:C.muted,marginTop:2}}>Click to download</div>
                            </div>
                          </a>
                        )}
                      </div>
                    )}
                    {/* Text */}
                    {msg.text&&(
                      <div style={{background:isMe?C.accent:C.card,color:isMe?"#0A0E1A":C.text,padding:"10px 14px",borderRadius:isMe?"14px 14px 4px 14px":"14px 14px 14px 4px",fontSize:14,lineHeight:1.5,border:isMe?"none":`1px solid ${C.border}`}}>
                        {msg.text}
                      </div>
                    )}
                    <div style={{fontSize:10,color:C.muted,textAlign:isMe?"right":"left"}}>{formatTime(msg.time)}</div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef}/>
          </div>

          {/* Attach preview bar */}
          {attachPreview&&(
            <div style={{padding:"8px 16px",borderTop:`1px solid ${C.border}`,background:C.surface,display:"flex",alignItems:"center",gap:10}}>
              {attachPreview.isImage?(
                <img src={attachPreview.data} alt="" style={{height:48,width:48,objectFit:"cover",borderRadius:6,border:`1px solid ${C.border}`}}/>
              ):(
                <div style={{display:"flex",alignItems:"center",gap:8,background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 12px"}}>
                  <span style={{fontSize:20}}>{fileIcon(attachPreview.type,attachPreview.name)}</span>
                  <span style={{fontSize:13,color:C.text,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{attachPreview.name}</span>
                </div>
              )}
              <button onClick={clearAttach} style={{background:C.danger+"22",color:C.danger,border:`1px solid ${C.danger}44`,borderRadius:6,padding:"4px 10px",fontSize:12,fontWeight:600}}>Remove ×</button>
            </div>
          )}

          {/* Input bar */}
          <div style={{padding:"10px 14px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,alignItems:"flex-end",background:C.card}}>
            {/* Image attach */}
            <button onClick={()=>imgInputRef.current?.click()} title="Send image"
              style={{background:C.surface,border:`1px solid ${C.border}`,color:C.muted,borderRadius:8,width:38,height:38,fontSize:18,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}
              onMouseOver={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accent;}}
              onMouseOut={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>
              🖼
            </button>
            <input ref={imgInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleAttachFile}/>

            {/* File attach */}
            <button onClick={()=>fileInputRef.current?.click()} title="Send file"
              style={{background:C.surface,border:`1px solid ${C.border}`,color:C.muted,borderRadius:8,width:38,height:38,fontSize:18,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}
              onMouseOver={e=>{e.currentTarget.style.borderColor=C.alt;e.currentTarget.style.color=C.alt;}}
              onMouseOut={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>
              📎
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf,.ppt,.pptx,.doc,.docx" style={{display:"none"}} onChange={handleAttachFile}/>

            {/* Text input */}
            <textarea
              value={text}
              onChange={e=>setText(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}}
              placeholder={`Message ${activeUser?.name}... (Enter to send)`}
              rows={1}
              style={{...inp(),flex:1,resize:"none",lineHeight:1.5,maxHeight:110,overflowY:"auto",padding:"9px 13px"}}
              onFocus={fa} onBlur={fb}
            />

            {/* Send */}
            <button onClick={sendMessage} disabled={!text.trim()&&!attachPreview}
              style={{background:(text.trim()||attachPreview)?C.accent:C.border,color:(text.trim()||attachPreview)?"#0A0E1A":C.muted,padding:"9px 18px",borderRadius:9,fontWeight:700,fontSize:14,fontFamily:"'Syne',sans-serif",flexShrink:0,transition:"all .2s",minHeight:38}}>
              Send ↑
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
// ─── TUTOR PROFILE PAGE (tutor users) ────────────────────────────────────────
function TutorProfilePage({user,onUpdateUser}){
  const [editing,setEditing]=useState(false);
  const [form,setForm]=useState({bio:user.bio||"",rate:user.rate||500,subjects:user.subjects||[],slots:user.slots||[],experience:user.experience||""});
  const [saved,setSaved]=useState(false);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const tog=(k,v)=>set(k,form[k].includes(v)?form[k].filter(x=>x!==v):[...form[k],v]);

  const save=()=>{
    const users=loadUsers();
    saveUsers(users.map(u=>u.id===user.id?{...u,...form}:u));
    onUpdateUser({...user,...form});
    setEditing(false);setSaved(true);
    setTimeout(()=>setSaved(false),2500);
  };

  return(
    <div style={{padding:"40px 28px 80px",maxWidth:740,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div>
          <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:24}}>My Tutor Profile</h2>
          <p style={{color:C.muted,marginTop:4,fontSize:13}}>This is what students see when you appear as a match.</p>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {saved&&<Badge color={C.accent}>✓ Saved!</Badge>}
          {!editing&&<Btn variant="secondary" onClick={()=>setEditing(true)}>Edit Profile</Btn>}
        </div>
      </div>

      <div style={{background:C.card,border:`1px solid ${editing?C.alt:C.border}`,borderRadius:16,overflow:"hidden",marginBottom:20,transition:"border-color .3s"}}>
        <div style={{background:`linear-gradient(135deg,${C.alt}22,${C.accent}22)`,padding:26,display:"flex",gap:18,alignItems:"center"}}>
          <div style={{width:68,height:68,borderRadius:"50%",background:C.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,border:`2px solid ${C.accent}44`}}>{user.avatar}</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:21}}>{user.name}</div>
            <div style={{color:C.muted,fontSize:13,marginTop:3}}>{(editing?form.subjects:user.subjects||[]).join(" · ")||"No subjects yet"}</div>
            <div style={{display:"flex",gap:14,marginTop:8,flexWrap:"wrap"}}>
              <span style={{color:C.accent,fontWeight:700}}>৳{editing?form.rate:user.rate}/hr</span>
              {user.rating?<span style={{color:C.gold}}>★ {user.rating} ({user.reviews} reviews)</span>:<span style={{color:C.muted,fontSize:12}}>No reviews yet</span>}
            </div>
          </div>
          <Badge color={C.alt}>Tutor</Badge>
        </div>
        <div style={{padding:22}}>
          {editing?(
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div><label style={lbl}>Bio</label><textarea value={form.bio} onChange={e=>set("bio",e.target.value)} rows={3} style={{...inp(),resize:"vertical",lineHeight:1.6}} onFocus={fa} onBlur={fb}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div><label style={lbl}>Hourly Rate (৳ Taka)</label><input type="number" value={form.rate} onChange={e=>set("rate",e.target.value)} style={inp()} onFocus={fa} onBlur={fb}/></div>
                <div><label style={lbl}>Experience</label><input value={form.experience} onChange={e=>set("experience",e.target.value)} placeholder="Qualifications, years..." style={inp()} onFocus={fa} onBlur={fb}/></div>
              </div>
              <div>
                <label style={lbl}>Subjects</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {SUBJECTS.map(s=>{const on=form.subjects.includes(s);return <button key={s} onClick={()=>tog("subjects",s)} style={{padding:"6px 12px",borderRadius:7,fontSize:12,fontWeight:600,background:on?C.accent+"22":C.surface,color:on?C.accent:C.muted,border:`1px solid ${on?C.accent+"66":C.border}`,transition:"all .2s"}}>{s}</button>;})}
                </div>
              </div>
              <div>
                <label style={lbl}>Available Slots</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {SLOTS.map(s=>{const on=form.slots.includes(s);return <button key={s} onClick={()=>tog("slots",s)} style={{padding:"6px 11px",borderRadius:7,fontSize:12,fontWeight:500,background:on?C.alt+"22":C.surface,color:on?C.alt:C.muted,border:`1px solid ${on?C.alt+"66":C.border}`,transition:"all .2s"}}>{s}</button>;})}
                </div>
              </div>
              <div style={{display:"flex",gap:10}}>
                <Btn onClick={save}>Save Changes</Btn>
                <Btn variant="ghost" onClick={()=>setEditing(false)}>Cancel</Btn>
              </div>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><div style={{...lbl,marginBottom:5}}>Bio</div><p style={{color:C.muted,fontSize:14,lineHeight:1.6}}>{user.bio||"No bio added yet."}</p></div>
              {user.experience&&<div><div style={{...lbl,marginBottom:5}}>Experience</div><p style={{color:C.muted,fontSize:14}}>{user.experience}</p></div>}
              <div>
                <div style={{...lbl,marginBottom:8}}>Available Slots</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {(user.slots||[]).map(s=><span key={s} style={{padding:"6px 13px",borderRadius:7,fontSize:12,background:C.alt+"18",color:C.alt,border:`1px solid ${C.alt}44`}}>{s}</span>)}
                  {!(user.slots||[]).length&&<span style={{color:C.muted,fontSize:13}}>No slots set</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{background:C.accent+"0d",border:`1px solid ${C.accent}22`,borderRadius:11,padding:16}}>
        <p style={{color:C.accent,fontSize:13,fontWeight:600,marginBottom:3}}>💡 Tips for more bookings</p>
        <p style={{color:C.muted,fontSize:13,lineHeight:1.6}}>A detailed bio, competitive rate, and multiple available slots dramatically increase your AI match score. Keep your profile complete!</p>
      </div>
    </div>
  );
}

// ─── TUTOR MATCH PAGE ─────────────────────────────────────────────────────────
function TutorMatchPage({plan,setPage,user}){
  const [step,setStep]         = useState("form");
  const [formData,setFormData] = useState({subject:"",level:"",goals:"",budget:"",availability:""});
  const [matches,setMatches]   = useState([]);
  const [loading,setLoading]   = useState(false);
  const [selected,setSelected] = useState(null);
  const [booked,setBooked]     = useState(null);
  const [chosenSlot,setChosenSlot] = useState(null);
  const [tutors,setTutors]     = useState([]);

  useEffect(()=>{ setTutors(loadUsers().filter(u=>u.role==="tutor")); },[]);

  const handleMatch = async()=>{
    if(!formData.subject||!formData.goals) return;
    setLoading(true); setStep("matching");
    const list = tutors.map(t=>`ID ${t.id}: ${t.name} | Subjects: ${(t.subjects||[]).join(", ")} | Rate: ৳${t.rate}/hr | Bio: ${t.bio||"N/A"}`).join("\n");
    const prompt=`Match this student to best registered tutors.
STUDENT: Subject: ${formData.subject}, Level: ${formData.level||"any"}, Goals: ${formData.goals}, Budget: ${formData.budget||"flexible"}, Availability: ${formData.availability||"flexible"}
TUTORS:\n${list}
Return ONLY JSON: {"matches":[{"tutorId":ID,"matchScore":0-100,"reason":"one sentence"}]}
Up to 3 tutors, best fit first.`;
    try{
      const res=await fetch(window.API_BASE_URL + "/api/match-tutors",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:prompt})});
      const data=await res.json();
      const raw=data.content?.find(b=>b.type==="text")?.text||"{}";
      const parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());
      const m=(parsed.matches||[]).map(x=>({...tutors.find(t=>t.id===x.tutorId),matchScore:x.matchScore,reason:x.reason})).filter(x=>x.id);
      setMatches(m.length?m:tutors.slice(0,3).map((t,i)=>({...t,matchScore:85-i*10,reason:"Registered tutor with relevant expertise."})));
    }catch{
      setMatches(tutors.slice(0,3).map((t,i)=>({...t,matchScore:85-i*10,reason:"Recommended based on subject alignment."})));
    }
    setLoading(false); setStep("results");
  };

  if(booked) return(
    <div style={{padding:"80px 28px",maxWidth:500,margin:"0 auto",textAlign:"center"}}>
      <div className="fadeUp" style={{background:C.card,border:`1px solid ${C.accent}44`,borderRadius:20,padding:44}}>
        <div style={{fontSize:58}}>🎉</div>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:26,marginTop:14}}>Session Booked!</h2>
        <p style={{color:C.muted,marginTop:8}}>Your session with <strong style={{color:C.text}}>{booked.name}</strong> is confirmed.</p>
        <div style={{margin:"18px auto",background:C.accent+"18",border:`1px solid ${C.accent}44`,borderRadius:10,padding:"12px 22px",display:"inline-block"}}>
          <span style={{color:C.accent,fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{chosenSlot}</span>
        </div>
        <div style={{color:C.muted,fontSize:13}}>৳{booked.rate}/hr · Message your tutor to confirm details.</div>
        <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:24,flexWrap:"wrap"}}>
          <Btn onClick={()=>setPage("messages")}>Message Tutor 💬</Btn>
          <Btn variant="ghost" onClick={()=>{setBooked(null);setStep("form");setMatches([]);}}>Find Another</Btn>
        </div>
      </div>
    </div>
  );

  if(selected) return(
    <div style={{padding:"40px 28px 80px",maxWidth:660,margin:"0 auto"}}>
      <button onClick={()=>{setSelected(null);setChosenSlot(null);}} style={{background:"none",color:C.muted,fontSize:13,marginBottom:18}}>← Back to matches</button>
      <div className="fadeUp" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,overflow:"hidden"}}>
        <div style={{background:`linear-gradient(135deg,${C.alt}22,${C.accent}22)`,padding:26,display:"flex",gap:18,alignItems:"center"}}>
          <div style={{width:68,height:68,borderRadius:"50%",background:C.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,border:`2px solid ${C.accent}44`,flexShrink:0}}>{selected.avatar}</div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:21}}>{selected.name}</h2>
              {selected.badge&&<Badge color={C.accent}>{selected.badge}</Badge>}
            </div>
            <div style={{color:C.muted,fontSize:13,marginTop:3}}>{(selected.subjects||[]).join(" · ")}</div>
            <div style={{display:"flex",gap:14,marginTop:8,flexWrap:"wrap"}}>
              {selected.rating&&<span style={{color:C.gold}}>★ {selected.rating} ({selected.reviews})</span>}
              <span style={{color:C.accent,fontWeight:700}}>৳{selected.rate}/hr</span>
            </div>
          </div>
          <div style={{width:56,height:56,borderRadius:"50%",border:`3px solid ${C.accent}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:14,fontWeight:800,color:C.accent,fontFamily:"'Syne',sans-serif"}}>{selected.matchScore}%</span>
            <span style={{fontSize:9,color:C.muted}}>MATCH</span>
          </div>
        </div>
        <div style={{padding:22,display:"flex",flexDirection:"column",gap:16}}>
          <div style={{background:C.alt+"12",border:`1px solid ${C.alt}33`,borderRadius:9,padding:"10px 13px"}}>
            <span style={{fontSize:11,color:C.alt,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>🤖 AI Insight</span>
            <p style={{fontSize:13,color:C.muted,marginTop:5,lineHeight:1.6}}>{selected.reason}</p>
          </div>
          {selected.bio&&<div><div style={lbl}>About</div><p style={{color:C.muted,fontSize:14,lineHeight:1.6}}>{selected.bio}</p></div>}
          {selected.experience&&<div><div style={lbl}>Experience</div><p style={{color:C.muted,fontSize:14}}>{selected.experience}</p></div>}
          <div>
            <div style={lbl}>Available Slots — pick one</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {(selected.slots||[]).map(s=>(
                <button key={s} onClick={()=>setChosenSlot(s)} style={{padding:"8px 15px",borderRadius:8,fontSize:13,fontWeight:500,background:chosenSlot===s?C.accent+"22":C.surface,color:chosenSlot===s?C.accent:C.text,border:`1px solid ${chosenSlot===s?C.accent:C.border}`,transition:"all .2s"}}>{s}</button>
              ))}
              {!(selected.slots||[]).length&&<span style={{color:C.muted,fontSize:13}}>No slots listed.</span>}
            </div>
          </div>
          <button onClick={()=>{if(chosenSlot)setBooked(selected);}} style={{width:"100%",padding:13,borderRadius:10,fontWeight:800,fontSize:14,fontFamily:"'Syne',sans-serif",background:chosenSlot?C.accent:C.border,color:chosenSlot?"#0A0E1A":C.muted,cursor:chosenSlot?"pointer":"not-allowed",transition:"all .2s",border:"none"}}>{chosenSlot?`Book — ${chosenSlot}`:"Select a slot to continue"}</button>
          <button onClick={()=>setPage("messages")} style={{width:"100%",padding:12,borderRadius:10,fontWeight:700,fontSize:14,fontFamily:"'Syne',sans-serif",background:"transparent",color:C.alt,border:`1px solid ${C.alt}`,transition:"all .2s"}}>💬 Message This Tutor</button>
        </div>
      </div>
    </div>
  );

  if(step==="matching") return(
    <div style={{padding:"90px 28px",maxWidth:440,margin:"0 auto",textAlign:"center"}}>
      <div style={{fontSize:46,marginBottom:18}}>🤖</div>
      <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:21}}>Finding your best match...</h3>
      <p style={{color:C.muted,marginTop:7,fontSize:14}}>Scanning {tutors.length} registered tutor{tutors.length!==1?"s":""} against your needs.</p>
      <div style={{marginTop:24,display:"flex",justifyContent:"center"}}><Dots/></div>
      {["Scanning registered tutors...","Checking subject alignment...","Scoring compatibility...","Ranking matches..."].map((t,i)=>(
        <div key={t} className="fadeUp" style={{animationDelay:`${i*.5}s`,color:C.muted,fontSize:13,marginTop:9}}>✓ {t}</div>
      ))}
    </div>
  );

  if(step==="results") return(
    <div style={{padding:"40px 28px 80px",maxWidth:780,margin:"0 auto"}}>
      <div style={{marginBottom:22}}>
        <Badge color={C.accent}>AI Matched</Badge>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:24,marginTop:8}}>Your Top Matches</h2>
        <p style={{color:C.muted,marginTop:4}}>Ranked from {tutors.length} registered tutor{tutors.length!==1?"s":""} by AI compatibility score.</p>
      </div>
      {!matches.length?(
        <div style={{background:C.card,border:`2px dashed ${C.border}`,borderRadius:13,padding:44,textAlign:"center"}}>
          <span style={{fontSize:38}}>😕</span>
          <p style={{color:C.muted,marginTop:10}}>No tutors found for that subject yet.</p>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          {matches.map((t,i)=>(
            <div key={t.id} className="fadeUp" style={{animationDelay:`${i*.08}s`,background:C.card,border:`1px solid ${i===0?C.accent+"55":C.border}`,borderRadius:13,padding:20,display:"flex",gap:16,alignItems:"flex-start",position:"relative",overflow:"hidden"}}>
              {i===0&&<div style={{position:"absolute",top:0,right:0,background:C.accent,color:"#0A0E1A",fontSize:10,fontWeight:800,padding:"3px 11px",borderRadius:"0 13px 0 9px",letterSpacing:1}}>BEST MATCH</div>}
              <div style={{width:52,height:52,borderRadius:"50%",background:C.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0,border:`2px solid ${i===0?C.accent+"55":C.border}`}}>{t.avatar}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                  <span style={{fontWeight:700,fontSize:15,fontFamily:"'Syne',sans-serif"}}>{t.name}</span>
                  {t.badge&&<Badge color={C.gold}>{t.badge}</Badge>}
                </div>
                <div style={{color:C.muted,fontSize:12,marginTop:2}}>{(t.subjects||[]).join(" · ")}</div>
                <div style={{marginTop:7,background:C.alt+"10",borderLeft:`3px solid ${C.alt}`,padding:"6px 10px",borderRadius:"0 7px 7px 0",fontSize:13,color:C.muted,lineHeight:1.5}}>🤖 {t.reason}</div>
                <div style={{display:"flex",gap:14,marginTop:8,flexWrap:"wrap"}}>
                  {t.rating&&<span style={{fontSize:13}}>★ <strong style={{color:C.gold}}>{t.rating}</strong> <span style={{color:C.muted}}>({t.reviews})</span></span>}
                  <span style={{fontSize:13,color:C.accent,fontWeight:700}}>৳{t.rate}/hr</span>
                  {(t.slots||[]).length>0&&<span style={{fontSize:13,color:C.muted}}>🗓 {t.slots[0]}{t.slots.length>1?` +${t.slots.length-1} more`:""}</span>}
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:9,flexShrink:0}}>
                <div style={{width:50,height:50,borderRadius:"50%",border:`3px solid ${t.matchScore>=85?C.accent:t.matchScore>=70?C.gold:C.muted}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:13,fontWeight:800,fontFamily:"'Syne',sans-serif",color:t.matchScore>=85?C.accent:t.matchScore>=70?C.gold:C.text}}>{t.matchScore}%</span>
                </div>
                <button onClick={()=>{setSelected(t);setChosenSlot(null);}} style={{background:i===0?C.accent:"transparent",color:i===0?"#0A0E1A":C.accent,border:`1px solid ${C.accent}`,padding:"7px 14px",borderRadius:8,fontWeight:700,fontSize:13,fontFamily:"'Syne',sans-serif",whiteSpace:"nowrap"}}>View & Book</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <button onClick={()=>{setStep("form");setMatches([]);}} style={{marginTop:18,background:"transparent",color:C.muted,fontSize:13,padding:"7px 14px",borderRadius:8,border:`1px solid ${C.border}`}}>← Search Again</button>
    </div>
  );

  const noTutors = tutors.length===0;
  return(
    <div style={{padding:"40px 28px 80px",maxWidth:640,margin:"0 auto"}}>
      <div style={{marginBottom:24}}>
        <Badge color={C.alt}>AI-Powered Matching</Badge>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:26,marginTop:10}}>Find Your Perfect Tutor</h2>
        <p style={{color:C.muted,marginTop:6,lineHeight:1.6}}>
          Tell us what you need. AI scans all <strong style={{color:C.text}}>{tutors.length} registered tutor{tutors.length!==1?"s":""}</strong> and ranks them by compatibility.
        </p>
      </div>
      {noTutors&&(
        <div style={{background:C.gold+"12",border:`1px solid ${C.gold}44`,borderRadius:11,padding:"13px 16px",marginBottom:20,display:"flex",gap:10,alignItems:"flex-start"}}>
          <span style={{fontSize:20}}>⚠️</span>
          <p style={{color:C.gold,fontSize:13,lineHeight:1.5}}>No tutors have registered yet. Share the platform — once tutors sign up, they appear here instantly.</p>
        </div>
      )}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,padding:24,display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div><label style={lbl}>Subject *</label>
            <select value={formData.subject} onChange={e=>setFormData(f=>({...f,subject:e.target.value}))} style={inp()} onFocus={fa} onBlur={fb}>
              <option value="">Select subject...</option>{SUBJECTS.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Your Level</label>
            <select value={formData.level} onChange={e=>setFormData(f=>({...f,level:e.target.value}))} style={inp()} onFocus={fa} onBlur={fb}>
              <option value="">Select level...</option>
              {["GCSE / A-Level","Undergraduate Yr 1-2","Undergraduate Yr 3-4","Postgraduate","Professional"].map(l=><option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div><label style={lbl}>What do you want to achieve? *</label>
          <textarea value={formData.goals} onChange={e=>setFormData(f=>({...f,goals:e.target.value}))} rows={3} placeholder="e.g. I need help with binary trees before my exam next week..." style={{...inp(),resize:"vertical",lineHeight:1.6}} onFocus={fa} onBlur={fb}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div><label style={lbl}>Budget</label>
            <select value={formData.budget} onChange={e=>setFormData(f=>({...f,budget:e.target.value}))} style={inp()} onFocus={fa} onBlur={fb}>
              <option value="">Any budget</option><option>Under ৳500/hr</option><option>৳500–৳1000/hr</option><option>৳1000+/hr</option>
            </select>
          </div>
          <div><label style={lbl}>Availability</label>
            <select value={formData.availability} onChange={e=>setFormData(f=>({...f,availability:e.target.value}))} style={inp()} onFocus={fa} onBlur={fb}>
              <option value="">Flexible</option><option>Weekday mornings</option><option>Weekday evenings</option><option>Weekends only</option>
            </select>
          </div>
        </div>
        <button onClick={handleMatch} disabled={!formData.subject||!formData.goals||noTutors} className="glow"
          style={{background:formData.subject&&formData.goals&&!noTutors?C.accent:C.border,color:formData.subject&&formData.goals&&!noTutors?"#0A0E1A":C.muted,padding:13,borderRadius:10,fontWeight:800,fontSize:14,fontFamily:"'Syne',sans-serif",cursor:formData.subject&&formData.goals&&!noTutors?"pointer":"not-allowed",transition:"all .2s",border:"none"}}>
          {noTutors?"No Registered Tutors Yet":"🤖 Match Me with a Tutor"}
        </button>
      </div>
    </div>
  );
}

// ─── GENERATE PAGE ────────────────────────────────────────────────────────────
function GeneratePage({plan,setPage}){
  const [subject,setSubject]=useState("Computer Science");
  const [topic,setTopic]=useState("");
  const [qType,setQType]=useState("mcq");
  const [difficulty,setDifficulty]=useState("medium");
  const [count,setCount]=useState(5);
  const [loading,setLoading]=useState(false);
  const [questions,setQuestions]=useState([]);
  const [error,setError]=useState("");
  const [dailyUsed,setDailyUsed]=useState(2);
  const [uploadedFile,setUploadedFile]=useState(null);
  const [uploadMode,setUploadMode]=useState("topic");
  const [dragOver,setDragOver]=useState(false);
  const fileRef=useRef(null);
  const dailyLimit=plan==="free"?5:Infinity;

  const readB64=file=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
  const handleFile=async file=>{
    if(!file)return;
    if(plan==="free"){setError("File upload is a Pro feature.");return;}
    if(!file.type.includes("pdf")&&!file.name.match(/\.pptx?$/i)){setError("PDF or PPTX only.");return;}
    setError("");
    const base64=await readB64(file);
    setUploadedFile({name:file.name,base64,mediaType:file.type.includes("pdf")?"application/pdf":"application/vnd.openxmlformats-officedocument.presentationml.presentation"});
    setTopic(file.name.replace(/\.[^.]+$/,"").replace(/[-_]/g," "));
  };

  const handleGenerate=async()=>{
    if(uploadMode==="topic"&&!topic.trim()){setError("Enter a topic.");return;}
    if(uploadMode==="file"&&!uploadedFile){setError("Upload a file first.");return;}
    if(plan==="free"&&dailyUsed>=dailyLimit){setError("Daily limit reached. Upgrade to Pro!");return;}
    setError("");setLoading(true);setQuestions([]);
    const tl={mcq:"multiple-choice (MCQ)",short:"short-answer",essay:"essay"}[qType];
    const spec=`Return ONLY a JSON array:\n- MCQ: {"q":"...","options":["A)...","B)...","C)...","D)..."],"answer":"A"}\n- Short: {"q":"...","answer":"..."}\n- Essay: {"q":"...","guidance":"Key points..."}`;
    try{
      const messages=uploadMode==="file"&&uploadedFile
        ?[{role:"user",content:[{type:"document",source:{type:"base64",media_type:uploadedFile.mediaType,data:uploadedFile.base64}},{type:"text",text:`Generate ${count} ${tl} questions at ${difficulty} difficulty from this file.\n${spec}`}]}]
        :[{role:"user",content:`Generate ${count} ${tl} questions on "${topic}" in ${subject} at ${difficulty} difficulty.\n${spec}`}];
      const prompt = uploadMode==="file"&&uploadedFile
  ? `Generate ${count} ${tl} questions at ${difficulty} difficulty from the uploaded file. Return ONLY JSON array: [{"q":"...","options":["A)...","B)...","C)...","D)..."],"answer":"A"}]`
  : `Generate ${count} ${tl} questions on "${topic}" in ${subject} at ${difficulty} difficulty. Return ONLY JSON array: [{"q":"...","options":["A)...","B)...","C)...","D)..."],"answer":"A"}]`;

const res=await fetch(window.API_BASE_URL + "/api/generate-questions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:prompt})});
      const data=await res.json();
      const raw=data.content?.find(b=>b.type==="text")?.text||"[]";
      setQuestions(JSON.parse(raw.replace(/```json|```/g,"").trim()));
      setDailyUsed(d=>d+1);
    }catch{setError("Failed to generate. Try again.");}
    setLoading(false);
  };

  return(
    <div style={{padding:"40px 28px 80px",maxWidth:960,margin:"0 auto"}}>
      <div style={{marginBottom:22}}>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:24}}>AI Question Generator</h2>
        <p style={{color:C.muted,marginTop:4}}>Enter a topic or upload lecture slides.</p>
        {plan==="free"&&<div style={{marginTop:12,background:C.gold+"15",border:`1px solid ${C.gold}44`,borderRadius:9,padding:"9px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:C.gold,fontSize:13}}>Free plan: {Math.max(0,dailyLimit-dailyUsed)} questions remaining today</span>
          <span style={{color:C.gold,fontSize:13,cursor:"pointer",textDecoration:"underline"}} onClick={()=>setPage("pricing")}>Upgrade →</span>
        </div>}
      </div>
      <div style={{display:"flex",gap:0,marginBottom:18,background:C.surface,borderRadius:9,padding:4,width:"fit-content",border:`1px solid ${C.border}`}}>
        {[["topic","✏️  Topic"],["file","📎  Upload File"]].map(([m,l])=>(
          <button key={m} onClick={()=>{setUploadMode(m);setError("");}} style={{padding:"7px 18px",borderRadius:7,fontSize:13,fontWeight:600,background:uploadMode===m?C.accent:"transparent",color:uploadMode===m?"#0A0E1A":C.muted,transition:"all .2s"}}>{l}</button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"330px 1fr",gap:20,alignItems:"start"}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,padding:20,display:"flex",flexDirection:"column",gap:15}}>
          {uploadMode==="file"&&(
            <div>
              <label style={{...lbl,marginBottom:7}}>Upload {plan==="free"&&<span style={{color:C.gold}}>🔒 Pro</span>}</label>
              {uploadedFile?(
                <div style={{background:C.accent+"12",border:`1px solid ${C.accent}44`,borderRadius:9,padding:"11px 13px",display:"flex",alignItems:"center",gap:9}}>
                  <span style={{fontSize:18}}>{uploadedFile.name.includes("pdf")?"📄":"📊"}</span>
                  <div style={{flex:1,minWidth:0}}><p style={{fontSize:13,fontWeight:600,color:C.accent,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{uploadedFile.name}</p></div>
                  <button onClick={()=>{setUploadedFile(null);setTopic("");}} style={{background:"none",color:C.muted,fontSize:18}}>×</button>
                </div>
              ):(
                <div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0]);}} onClick={()=>plan!=="free"&&fileRef.current?.click()} style={{border:`2px dashed ${dragOver?C.accent:C.border}`,borderRadius:9,padding:"22px 14px",textAlign:"center",background:dragOver?C.accent+"08":C.surface,cursor:plan==="free"?"not-allowed":"pointer",transition:"all .2s"}}>
                  <div style={{fontSize:26,marginBottom:5}}>📎</div>
                  <p style={{fontSize:13,fontWeight:500}}>{plan==="free"?"Pro feature only":"Drag & drop or click"}</p>
                  <p style={{fontSize:11,color:C.muted,marginTop:3}}>PDF or PPTX</p>
                  {plan!=="free"&&<input ref={fileRef} type="file" accept=".pdf,.ppt,.pptx" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>}
                </div>
              )}
            </div>
          )}
          <div>
            <label style={lbl}>{uploadMode==="file"?"Topic Label":"Topic / Chapter"}</label>
            <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder={uploadMode==="file"?"Auto-filled...":"e.g. Binary Trees..."} style={inp()} onFocus={fa} onBlur={fb}/>
          </div>
          {uploadMode==="topic"&&(
            <div>
              <label style={lbl}>Subject</label>
              <select value={subject} onChange={e=>setSubject(e.target.value)} style={inp()}>
                {(plan==="free"?[SUBJECTS[0]]:SUBJECTS).map(s=><option key={s}>{s}</option>)}
              </select>
              {plan==="free"&&<p style={{fontSize:11,color:C.muted,marginTop:4}}>Upgrade to unlock all subjects</p>}
            </div>
          )}
          <div>
            <label style={lbl}>Question Type</label>
            <div style={{display:"flex",gap:7}}>
              {[["mcq","MCQ"],["short","Short"],["essay","Essay"]].map(([v,l])=>{const locked=plan==="free"&&v!=="mcq";return <button key={v} onClick={()=>!locked&&setQType(v)} style={{flex:1,padding:"7px 3px",borderRadius:7,fontSize:11,fontWeight:600,background:qType===v?C.accent+"22":C.surface,color:qType===v?C.accent:locked?C.muted:C.text,border:`1px solid ${qType===v?C.accent+"66":C.border}`,opacity:locked?.5:1,cursor:locked?"not-allowed":"pointer"}}>{l}{locked?" 🔒":""}</button>;})}
            </div>
          </div>
          <div>
            <label style={lbl}>Difficulty</label>
            <div style={{display:"flex",gap:7}}>
              {["easy","medium","hard"].map(d=><button key={d} onClick={()=>setDifficulty(d)} style={{flex:1,padding:"7px",borderRadius:7,fontSize:12,fontWeight:600,textTransform:"capitalize",background:difficulty===d?C.alt+"22":C.surface,color:difficulty===d?C.alt:C.text,border:`1px solid ${difficulty===d?C.alt+"66":C.border}`}}>{d}</button>)}
            </div>
          </div>
          <div>
            <label style={lbl}>Questions: {count}</label>
            <input type="range" min={1} max={plan==="free"?5:20} value={count} onChange={e=>setCount(+e.target.value)} style={{width:"100%",marginTop:4,accentColor:C.accent}}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted}}><span>1</span><span>{plan==="free"?"5 (free)":"20"}</span></div>
          </div>
          {error&&<p style={{color:C.danger,fontSize:13}}>{error}</p>}
          <button onClick={handleGenerate} disabled={loading} className="glow" style={{background:C.accent,color:"#0A0E1A",padding:12,borderRadius:10,fontWeight:800,fontSize:14,fontFamily:"'Syne',sans-serif",opacity:loading?.7:1,border:"none"}}>
            {loading?"Generating...":uploadMode==="file"&&uploadedFile?"✨ Generate from File":"✨ Generate Questions"}
          </button>
        </div>
        <div>
          {loading&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,padding:28,textAlign:"center"}}><Dots/><p style={{color:C.muted,marginTop:7,fontSize:14}}>AI is crafting your questions...</p></div>}
          {!loading&&!questions.length&&<div style={{background:C.card,border:`2px dashed ${C.border}`,borderRadius:13,padding:50,textAlign:"center"}}><span style={{fontSize:44}}>{uploadMode==="file"?"📂":"📝"}</span><p style={{color:C.text,fontWeight:600,marginTop:12,fontSize:14}}>{uploadMode==="file"?"Upload a file and generate questions":"Enter a topic and hit Generate"}</p><p style={{color:C.muted,marginTop:5,fontSize:13}}>Questions appear here</p></div>}
          <div style={{display:"flex",flexDirection:"column",gap:13}}>
            {questions.map((q,i)=>(
              <div key={i} className="fadeUp" style={{animationDelay:`${i*.07}s`,background:C.card,border:`1px solid ${C.border}`,borderRadius:11,padding:17}}>
                <div style={{display:"flex",gap:9,alignItems:"flex-start"}}>
                  <span style={{minWidth:24,height:24,background:C.accent+"22",color:C.accent,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,fontFamily:"'DM Mono',monospace",flexShrink:0}}>Q{i+1}</span>
                  <div style={{flex:1}}>
                    <p style={{fontWeight:500,lineHeight:1.5}}>{q.q}</p>
                    {q.options&&<div style={{marginTop:9,display:"flex",flexDirection:"column",gap:5}}>{q.options.map((o,j)=><div key={j} style={{padding:"7px 10px",borderRadius:7,fontSize:13,background:o.startsWith(q.answer)?C.accent+"18":C.surface,border:`1px solid ${o.startsWith(q.answer)?C.accent+"55":C.border}`,color:o.startsWith(q.answer)?C.accent:C.text}}>{o}</div>)}</div>}
                    {q.answer&&!q.options&&<div style={{marginTop:7,padding:"8px 12px",background:C.accent+"10",borderRadius:7,borderLeft:`3px solid ${C.accent}`,fontSize:13,color:C.muted}}><strong style={{color:C.accent}}>Answer: </strong>{q.answer}</div>}
                    {q.guidance&&<div style={{marginTop:7,padding:"8px 12px",background:C.alt+"10",borderRadius:7,borderLeft:`3px solid ${C.alt}`,fontSize:13,color:C.muted}}><strong style={{color:C.alt}}>Guidance: </strong>{q.guidance}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── QUIZ PAGE ────────────────────────────────────────────────────────────────
function QuizPage({user}){
  const [topic,setTopic]=useState("");
  const [started,setStarted]=useState(false);
  const [questions,setQuestions]=useState([]);
  const [current,setCurrent]=useState(0);
  const [selected,setSelected]=useState(null);
  const [score,setScore]=useState(0);
  const [finished,setFinished]=useState(false);
  const [loading,setLoading]=useState(false);
  const [feedback,setFeedback]=useState(null);

  const startQuiz=async()=>{
    if(!topic.trim())return;setLoading(true);
    try{const res=await fetch(window.API_BASE_URL + "/api/generate-questions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:`Generate 6 MCQ questions on "${topic}". Return ONLY JSON array: [{"q":"...","options":["A)...","B)...","C)...","D)..."],"answer":"A"}]`})});
      const data=await res.json();
      const raw=data.content?.find(b=>b.type==="text")?.text||"[]";
      setQuestions(JSON.parse(raw.replace(/```json|```/g,"").trim()));
      setStarted(true);setCurrent(0);setScore(0);setFinished(false);setSelected(null);setFeedback(null);
    }catch{}
    setLoading(false);
  };

  const handleSelect=opt=>{
    if(selected)return;setSelected(opt);
    const ok=opt.startsWith(questions[current].answer);
    if(ok)setScore(s=>s+1);
    setFeedback(ok?"✅ Correct!":"❌ Correct: "+questions[current].answer);
  };

  const pct=questions.length?Math.round((score/questions.length)*100):0;

  if(!started)return(
    <div style={{padding:"60px 28px",maxWidth:500,margin:"0 auto",textAlign:"center"}}>
      <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:24}}>Adaptive Quiz Mode</h2>
      <p style={{color:C.muted,marginTop:7}}>Enter a topic and test yourself with AI questions.</p>
      <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. Photosynthesis, Recursion..." style={{...inp(),marginTop:22,fontSize:15}} onFocus={fa} onBlur={fb} onKeyDown={e=>e.key==="Enter"&&startQuiz()}/>
      <Btn full style={{marginTop:11}} onClick={startQuiz}>{loading?"Building Quiz...":"Start Quiz ⚡"}</Btn>
      {loading&&<div style={{marginTop:11,display:"flex",justifyContent:"center"}}><Dots/></div>}
    </div>
  );

  if(finished)return(
    <div style={{padding:"60px 28px",maxWidth:420,margin:"0 auto",textAlign:"center"}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:40}}>
        <div style={{fontSize:56}}>{pct>=80?"🏆":pct>=50?"📈":"💪"}</div>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:30,marginTop:12}}>{pct}%</h2>
        <p style={{color:C.muted,marginTop:5}}>{score}/{questions.length} correct</p>
        <p style={{color:pct>=80?C.accent:C.gold,marginTop:9,fontWeight:600}}>{pct>=80?"Excellent!":pct>=50?"Good effort!":"Review and try again!"}</p>
        <Btn full style={{marginTop:20}} onClick={()=>{setStarted(false);setTopic("");}}>New Quiz</Btn>
      </div>
    </div>
  );

  const q=questions[current];
  return(
    <div style={{padding:"40px 28px",maxWidth:600,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <span style={{color:C.muted,fontSize:13,fontFamily:"'DM Mono',monospace"}}>Q {current+1}/{questions.length}</span>
        <Badge color={C.accent}>Score: {score}</Badge>
      </div>
      <div style={{height:4,background:C.border,borderRadius:4,marginBottom:24}}>
        <div style={{height:"100%",background:C.accent,borderRadius:4,width:`${((current+1)/questions.length)*100}%`,transition:"width .4s"}}/>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:24}}>
        <p style={{fontSize:15,fontWeight:500,lineHeight:1.6,marginBottom:18}}>{q.q}</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {q.options?.map((opt,i)=>{
            const isSel=selected===opt,isCorr=opt.startsWith(q.answer);
            let bg=C.surface,bdr=C.border,col=C.text;
            if(selected){if(isCorr){bg=C.accent+"20";bdr=C.accent;col=C.accent;}else if(isSel){bg=C.danger+"20";bdr=C.danger;col=C.danger;}}
            return <button key={i} onClick={()=>handleSelect(opt)} style={{background:bg,border:`1px solid ${bdr}`,color:col,padding:"10px 13px",borderRadius:8,textAlign:"left",fontSize:14,fontWeight:500,transition:"all .2s"}}>{opt}</button>;
          })}
        </div>
        {feedback&&<div style={{marginTop:12,padding:"9px 13px",background:C.surface,borderRadius:8,fontSize:14,color:C.muted}}>{feedback}</div>}
        {selected&&<Btn style={{marginTop:14}} onClick={()=>{if(current+1>=questions.length){if(user?.id) recordQuizResult(user.id, topic, score, questions.length); setFinished(true);}else{setCurrent(c=>c+1);setSelected(null);setFeedback(null);}}}>{current+1>=questions.length?"See Results":"Next →"}</Btn>}
      </div>
    </div>
  );
}

// ─── ANALYTICS PAGE ───────────────────────────────────────────────────────────
function AnalyticsPage({plan,setPage,user}){
  const [results,setResults] = useState([]);

  useEffect(()=>{
    const all = loadAnalytics();
    setResults(all[user?.id]||[]);
  },[user?.id]);

  // ── Computed stats ──
  const totalQuizzes   = results.length;
  const totalQuestions = results.reduce((s,r)=>s+r.total,0);
  const avgScore       = totalQuizzes ? Math.round(results.reduce((s,r)=>s+Math.round((r.score/r.total)*100),0)/totalQuizzes) : null;

  // Streak: count consecutive days ending today that have at least one quiz
  const streak = (() => {
    if(!results.length) return 0;
    const days = [...new Set(results.map(r=>r.date.slice(0,10)))].sort().reverse();
    let count=0, cur=new Date(); cur.setHours(0,0,0,0);
    for(const d of days){
      const dd=new Date(d); dd.setHours(0,0,0,0);
      const diff=(cur-dd)/(1000*60*60*24);
      if(diff<=1){ count++; cur=dd; } else break;
    }
    return count;
  })();

  // Last 14 calendar days for trend chart
  const last14 = Array.from({length:14},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-(13-i)); d.setHours(0,0,0,0);
    const key = d.toISOString().slice(0,10);
    const dayResults = results.filter(r=>r.date.slice(0,10)===key);
    const pct = dayResults.length ? Math.round(dayResults.reduce((s,r)=>s+Math.round((r.score/r.total)*100),0)/dayResults.length) : null;
    return {label:`D${i+1}`, pct};
  });

  // Subject breakdown: group by topic, average score
  const subjectMap = {};
  results.forEach(r=>{
    const t = r.topic||"Other";
    if(!subjectMap[t]) subjectMap[t]={total:0,count:0};
    subjectMap[t].total += Math.round((r.score/r.total)*100);
    subjectMap[t].count += 1;
  });
  const subjects = Object.entries(subjectMap).map(([topic,{total,count}])=>({topic,avg:Math.round(total/count)})).sort((a,b)=>b.avg-a.avg).slice(0,6);

  // Recent quiz history
  const recent = [...results].reverse().slice(0,8);

  const noData = totalQuizzes===0;

  return(
    <div style={{padding:"40px 28px 80px",maxWidth:920,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:24}}>Analytics Dashboard</h2>
          <p style={{color:C.muted,marginTop:4,fontSize:13}}>Live data from your quiz sessions.</p>
        </div>
        {totalQuizzes>0&&<Badge color={C.accent}>{totalQuizzes} quiz{totalQuizzes!==1?"zes":""} completed</Badge>}
      </div>

      {noData&&(
        <div style={{background:C.card,border:`2px dashed ${C.border}`,borderRadius:13,padding:48,textAlign:"center",marginTop:20}}>
          <div style={{fontSize:48}}>📊</div>
          <p style={{fontWeight:600,fontSize:16,marginTop:14,color:C.text}}>No data yet</p>
          <p style={{color:C.muted,fontSize:13,marginTop:6}}>Complete a quiz in the Quiz page and your performance will appear here automatically.</p>
          <Btn style={{marginTop:20}} onClick={()=>setPage("quiz")}>Take a Quiz →</Btn>
        </div>
      )}

      {!noData&&<>
        {/* Stat cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginTop:22}}>
          {[
            [avgScore!==null?`${avgScore}%`:"—","Avg Score"],
            [totalQuizzes,"Quizzes Taken"],
            [totalQuestions,"Questions Done"],
            [`🔥 ${streak}`,"Day Streak"],
          ].map(([v,l])=>(
            <div key={l} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:11,padding:17,textAlign:"center"}}>
              <div style={{fontSize:24,fontWeight:800,fontFamily:"'Syne',sans-serif",color:C.accent}}>{v}</div>
              <div style={{color:C.muted,fontSize:12,marginTop:3}}>{l}</div>
            </div>
          ))}
        </div>

        {/* 14-day trend */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,padding:20,marginTop:18}}>
          <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:4}}>14-Day Score Trend</h3>
          <p style={{color:C.muted,fontSize:12,marginBottom:14}}>Average quiz score per day. Empty bars = no quiz that day.</p>
          <div style={{display:"flex",alignItems:"flex-end",gap:4,height:110}}>
            {last14.map(({label,pct},i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,height:"100%",justifyContent:"flex-end"}}>
                {pct!==null&&<span style={{fontSize:9,color:C.accent,fontWeight:700,marginBottom:2}}>{pct}%</span>}
                <div style={{width:"100%",background:pct!==null?C.accent+(pct>=85?"ff":pct>=70?"bb":"66"):C.border,borderRadius:"3px 3px 0 0",height:pct!==null?`${pct}%`:"4px",minHeight:4,transition:"height .5s"}}/>
                <span style={{fontSize:8,color:C.muted}}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subject breakdown */}
        {subjects.length>0&&(
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,padding:20,marginTop:15}}>
            <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:16}}>Topic Breakdown</h3>
            {subjects.map(({topic,avg})=>(
              <div key={topic} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:14,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"70%"}}>{topic}</span>
                  <span style={{fontSize:13,color:avg>=80?C.accent:avg>=60?C.gold:C.danger,fontFamily:"'DM Mono',monospace",fontWeight:700}}>{avg}%</span>
                </div>
                <div style={{height:7,background:C.surface,borderRadius:4}}>
                  <div style={{height:"100%",borderRadius:4,width:`${avg}%`,background:`linear-gradient(90deg,${C.alt},${C.accent})`,transition:"width .8s ease"}}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent history */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,padding:20,marginTop:15}}>
          <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:14}}>Recent Quiz History</h3>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {recent.map((r,i)=>{
              const pct=Math.round((r.score/r.total)*100);
              const d=new Date(r.date);
              return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:C.surface,borderRadius:9}}>
                  <div style={{width:40,height:40,borderRadius:"50%",border:`2px solid ${pct>=80?C.accent:pct>=60?C.gold:C.danger}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:12,fontWeight:800,fontFamily:"'Syne',sans-serif",color:pct>=80?C.accent:pct>=60?C.gold:C.danger}}>{pct}%</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.topic}</div>
                    <div style={{color:C.muted,fontSize:11,marginTop:2}}>{r.score}/{r.total} correct · {d.toLocaleDateString([],{day:"numeric",month:"short",year:"numeric"})}</div>
                  </div>
                  <span style={{fontSize:18}}>{pct>=80?"🏆":pct>=60?"📈":"💪"}</span>
                </div>
              );
            })}
          </div>
        </div>
      </>}
    </div>
  );
}

// ─── PRICING PAGE ─────────────────────────────────────────────────────────────
function PricingPage({plan,setPlan}){
  const [annual,setAnnual]=useState(false);
  return(
    <div style={{padding:"52px 28px 80px",maxWidth:960,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:40}}>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:32}}>Simple, Transparent Pricing</h2>
        <p style={{color:C.muted,marginTop:7,fontSize:15}}>Start free. Scale when you're ready.</p>
        <div style={{display:"inline-flex",alignItems:"center",gap:11,marginTop:18,background:C.card,border:`1px solid ${C.border}`,borderRadius:99,padding:"7px 14px"}}>
          <span style={{fontSize:13,color:annual?C.muted:C.text}}>Monthly</span>
          <button onClick={()=>setAnnual(a=>!a)} style={{width:40,height:21,borderRadius:11,background:annual?C.accent:C.border,position:"relative",transition:"background .2s"}}>
            <div style={{width:15,height:15,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:annual?22:3,transition:"left .2s"}}/>
          </button>
          <span style={{fontSize:13,color:annual?C.text:C.muted}}>Annual <span style={{color:C.accent,fontSize:11}}>-20%</span></span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
        {PLANS.map(p=>{
          const price=annual&&p.price>0?Math.round(p.price*.8):p.price;
          const active=plan===p.id;
          return(
            <div key={p.id} style={{background:C.card,borderRadius:15,padding:24,border:`2px solid ${active?p.color:p.popular?p.color+"44":C.border}`,position:"relative",transition:"border-color .2s"}}>
              {p.popular&&<div style={{position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",background:C.accent,color:"#0A0E1A",padding:"3px 13px",borderRadius:99,fontSize:11,fontWeight:700}}>MOST POPULAR</div>}
              <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:19,color:p.color}}>{p.name}</h3>
              <div style={{marginTop:13,display:"flex",alignItems:"baseline",gap:4}}>
                <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:30}}>{p.price===0?"Free":`৳${price}`}</span>
                {p.price>0&&<span style={{color:C.muted,fontSize:12}}>/{annual?"mo billed annually":"month"}</span>}
              </div>
              <div style={{height:1,background:C.border,margin:"16px 0"}}/>
              <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:8}}>
                {p.features.map(f=><li key={f} style={{display:"flex",gap:7,alignItems:"center",fontSize:13}}><span style={{color:p.color}}>✓</span><span style={{color:C.muted}}>{f}</span></li>)}
              </ul>
              <button onClick={()=>setPlan(p.id)} style={{marginTop:22,width:"100%",padding:"10px",borderRadius:9,fontWeight:700,fontSize:13,fontFamily:"'Syne',sans-serif",background:active?p.color:"transparent",color:active?"#0A0E1A":p.color,border:`2px solid ${p.color}`,transition:"all .2s",cursor:"pointer"}}>
                {active?"✓ Current Plan":p.cta}
              </button>
            </div>
          );
        })}
      </div>
      <div style={{textAlign:"center",marginTop:28,color:C.muted,fontSize:13}}>🔒 Secure payment · 14-day money-back guarantee · Cancel anytime</div>
      <div style={{marginTop:44}}>
        <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:19,marginBottom:18,textAlign:"center"}}>Frequently Asked Questions</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
          {[["Can I switch plans?","Yes, upgrade or downgrade anytime. Billing is prorated."],["How does the free plan work?","5 AI questions/day, MCQ only, one subject."],["Is there a student discount?","Yes! Contact us with your student ID for 30% off Pro."],["What payment methods?","bKash, Nagad, Rocket, and major debit/credit cards."]].map(([q,a])=>(
            <div key={q} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:17}}>
              <p style={{fontWeight:600,fontSize:14}}>{q}</p>
              <p style={{color:C.muted,fontSize:13,marginTop:4,lineHeight:1.5}}>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App(){
  const [user,setUser] = useState(null);
  const [page,setPage] = useState("home");
  const [plan,setPlan] = useState("free");

  const handleAuth = u => { setUser(u); setPage(u.role==="tutor"?"profile":"home"); };
  const handleLogout = () => { setUser(null); setPage("home"); };
  const handleUpdateUser = u => setUser(u);

  if(!user) return(
    <><style>{CSS}</style><AuthScreen onAuth={handleAuth}/></>
  );

  const pages={
    home:      <HomePage      setPage={setPage} user={user}/>,
    generate:  <GeneratePage  plan={plan} setPage={setPage}/>,
    quiz:      <QuizPage user={user}/>,
    tutors:    <TutorMatchPage plan={plan} setPage={setPage} user={user}/>,
    analytics: <AnalyticsPage key={page==="analytics"?1:0} plan={plan} setPage={setPage} user={user}/>, // Add key here
    pricing:   <PricingPage   plan={plan} setPlan={setPlan}/>,
    profile:   <TutorProfilePage user={user} onUpdateUser={handleUpdateUser}/>,
    messages:  <MessagesPage  user={user}/>,
  };

  return(
    <><style>{CSS}</style>
      <NavBar page={page} setPage={setPage} plan={plan} user={user} onLogout={handleLogout}/>
      {pages[page]||pages.home}
    </>
  );
}
