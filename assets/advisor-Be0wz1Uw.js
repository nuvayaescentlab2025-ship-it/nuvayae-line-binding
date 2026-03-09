import"./modulepreload-polyfill-B5Qt9EMX.js";import c from"https://cdn.jsdelivr.net/npm/@line/liff@2.23.2/+esm";const b="https://kvqkjtyhbbcivwlexgcn.supabase.co",B=`${b}/functions/v1/fragrance-advisor`;let d=null,I=crypto.randomUUID(),l="active",v=!1;const p=document.getElementById("chatTimeline"),E=document.getElementById("scrollArea"),m=document.getElementById("msgInput"),f=document.getElementById("sendBtn"),g=document.getElementById("inputArea"),h=document.getElementById("completedBanner");async function T(){try{if(await c.init({liffId:"2009177086-5AGq54Qb"}),!c.isLoggedIn()){c.login();return}d=(await c.getProfile()).userId}catch(e){console.warn("LIFF init failed, using fallback userId",e),d=localStorage.getItem("nuvayae_uid")||crypto.randomUUID(),localStorage.setItem("nuvayae_uid",d)}a("不知道這個月該選哪一款嗎？",`不管是「最近的心情」（例如：需要專注、想好好睡一覺），還是「偏好的氣味」（例如：喜歡沉穩木質、想找清新果香），請用簡單的幾個字告訴我。

我會分析您的狀態與喜好，精準匹配出最適合您的氣味。`,["需要專注","想要好眠","沉穩木質","清新花香"]),u()}async function k(e){const t=await fetch(B,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:d,sessionId:I,message:e})});if(!t.ok){if(t.status===409)throw new Error("SESSION_COMPLETED");const s=await t.json().catch(()=>({}));throw new Error(s.error||`HTTP ${t.status}`)}return t.json()}function a(e,t,s){const i=document.createElement("div");i.className="chat-row agent";let n=`
            <div class="step-title">
                <div class="title-dot"></div>
                <span>煖意選香師｜Honoka</span>
            </div>
            <div class="memory-card agent-card">
                <div class="scent-color-bar bar-agent"></div>
                ${e?`<h4 style="margin:0 0 6px;font-size:14px;font-weight:500;color:var(--text-main);letter-spacing:0.5px;">${e}</h4>`:""}
                <p>${r(t)}</p>
        `;s&&s.length>0&&(n+='<div class="options-group">',s.forEach(o=>{n+=`<button class="option-btn" data-quick="${r(o)}">${r(o)}</button>`}),n+="</div>"),n+="</div>",i.innerHTML=n,p.appendChild(i),i.querySelectorAll(".option-btn").forEach(o=>{o.addEventListener("click",()=>{const L=o.dataset.quick;o.closest(".options-group").classList.add("hidden"),y(L)})}),u()}function S(e){const t=document.createElement("div");t.className="chat-row user",t.innerHTML=`
            <div class="step-title">
                <span>您</span>
                <div class="title-dot"></div>
            </div>
            <div class="memory-card user-card">
                <div class="scent-color-bar bar-user"></div>
                <p>${r(e)}</p>
            </div>
        `,p.appendChild(t),u()}function A(){const e=document.createElement("div");e.className="chat-row agent",e.id="typingRow",e.innerHTML=`
            <div class="step-title">
                <div class="title-dot"></div>
                <span>煖意選香師｜Honoka</span>
            </div>
            <div class="memory-card agent-card">
                <div class="scent-color-bar bar-agent"></div>
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `,p.appendChild(e),u()}function w(){const e=document.getElementById("typingRow");e&&e.remove()}function H(e){if(!e)return;const t={space:e.space,mood:e.mood,preferences:e.preferences&&e.preferences.length>0?"filled":null,dislikes:e.dislikes&&e.dislikes.length>0?"filled":null,occasion:e.occasion,health_conditions:e.health_conditions&&e.health_conditions.length>0?"filled":null};Object.entries(t).forEach(([s,i])=>{const n=document.getElementById(`slot-${s}`);n&&n.classList.toggle("filled",!!i)})}async function y(e){if(!(!e||!e.trim()||v||l==="completed")){e=e.trim(),v=!0,f.disabled=!0,S(e),A();try{const t=await k(e);w(),a(null,t.reply),H(t.state),t.status==="completed"&&(l="completed",g.classList.add("hidden"),h.classList.remove("hidden"))}catch(t){w(),t.message==="SESSION_COMPLETED"?(l="completed",g.classList.add("hidden"),h.classList.remove("hidden"),a(null,"此次諮詢已完成，感謝您的信任。")):a(null,"系統暫時無法回應，請稍後再試。")}finally{v=!1,f.disabled=!1,m.value=""}}}function r(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function u(){requestAnimationFrame(()=>{E.scrollTop=E.scrollHeight})}f.addEventListener("click",()=>y(m.value));m.addEventListener("keydown",e=>{e.key==="Enter"&&!e.isComposing&&(e.preventDefault(),y(m.value))});document.getElementById("backBtn").addEventListener("click",()=>{window.history.length>1?window.history.back():window.location.href="./index.html"});document.getElementById("restartBtn").addEventListener("click",()=>{I=crypto.randomUUID(),l="active",p.innerHTML="",h.classList.add("hidden"),g.classList.remove("hidden"),document.querySelectorAll(".slot-dot").forEach(e=>e.classList.remove("filled")),a("不知道這個月該選哪一款嗎？",`不管是「最近的心情」（例如：需要專注、想好好睡一覺），還是「偏好的氣味」（例如：喜歡沉穩木質、想找清新果香），請用簡單的幾個字告訴我。

我會分析您的狀態與喜好，精準匹配出最適合您的氣味。`,["需要專注","想要好眠","沉穩木質","清新花香"])});T();
