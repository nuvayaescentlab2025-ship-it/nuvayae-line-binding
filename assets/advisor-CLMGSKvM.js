import"./modulepreload-polyfill-B5Qt9EMX.js";import a from"https://cdn.jsdelivr.net/npm/@line/liff@2.23.2/+esm";const k="https://kvqkjtyhbbcivwlexgcn.supabase.co",B=`${k}/functions/v1/fragrance-advisor`;let c=null,w=crypto.randomUUID(),l="active",u=!1;const r=document.getElementById("chatTimeline"),y=document.getElementById("scrollArea"),d=document.getElementById("msgInput"),v=document.getElementById("sendBtn"),f=document.getElementById("inputArea"),g=document.getElementById("completedBanner");async function T(){try{if(await a.init({liffId:"2009177086-5AGq54Qb"}),!a.isLoggedIn()){a.login();return}c=(await a.getProfile()).userId}catch(e){console.warn("LIFF init failed, using fallback userId",e),c=localStorage.getItem("nuvayae_uid")||crypto.randomUUID(),localStorage.setItem("nuvayae_uid",c)}i("不知道這個月該選哪一款嗎？","告訴我您最近的心情或偏好的氣味，我來幫您找到最合適的香氣。"),m()}async function S(e){const t=await fetch(B,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:c,sessionId:w,message:e})});if(!t.ok){if(t.status===409)throw new Error("SESSION_COMPLETED");const o=await t.json().catch(()=>({}));throw new Error(o.error||`HTTP ${t.status}`)}return t.json()}function i(e,t,o){const n=document.createElement("div");n.className="chat-row agent";let s=`
            <div class="step-title">
                <div class="title-dot"></div>
                <span>煖意選香師｜Honoka</span>
            </div>
            <div class="memory-card agent-card">
                <div class="scent-color-bar bar-agent"></div>
                ${e?`<h4 style="margin:0 0 6px;font-size:14px;font-weight:500;color:var(--text-main);letter-spacing:0.5px;">${e}</h4>`:""}
                <p>${I(t)}</p>
        `;s+="</div>",n.innerHTML=s,r.appendChild(n),n.querySelectorAll(".option-btn").forEach(p=>{p.addEventListener("click",()=>{const L=p.dataset.quick;p.closest(".options-group").classList.add("hidden"),h(L)})}),m()}function b(e){const t=document.createElement("div");t.className="chat-row user",t.innerHTML=`
            <div class="step-title">
                <span>您</span>
                <div class="title-dot"></div>
            </div>
            <div class="memory-card user-card">
                <div class="scent-color-bar bar-user"></div>
                <p>${I(e)}</p>
            </div>
        `,r.appendChild(t),m()}function A(){const e=document.createElement("div");e.className="chat-row agent",e.id="typingRow",e.innerHTML=`
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
        `,r.appendChild(e),m()}function E(){const e=document.getElementById("typingRow");e&&e.remove()}function H(e){if(!e)return;const t={space:e.space,mood:e.mood,preferences:e.preferences&&e.preferences.length>0?"filled":null,dislikes:e.dislikes&&e.dislikes.length>0?"filled":null,occasion:e.occasion,health_conditions:e.health_conditions&&e.health_conditions.length>0?"filled":null};Object.entries(t).forEach(([o,n])=>{const s=document.getElementById(`slot-${o}`);s&&s.classList.toggle("filled",!!n)})}async function h(e){if(!(!e||!e.trim()||u||l==="completed")){e=e.trim(),u=!0,v.disabled=!0,b(e),A();try{const t=await S(e);E(),i(null,t.reply),H(t.state),t.status==="completed"&&(l="completed",f.classList.add("hidden"),g.classList.remove("hidden"))}catch(t){E(),t.message==="SESSION_COMPLETED"?(l="completed",f.classList.add("hidden"),g.classList.remove("hidden"),i(null,"此次諮詢已完成，感謝您的信任。")):i(null,"系統暫時無法回應，請稍後再試。")}finally{u=!1,v.disabled=!1,d.value=""}}}function I(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function m(){requestAnimationFrame(()=>{y.scrollTop=y.scrollHeight})}v.addEventListener("click",()=>h(d.value));d.addEventListener("keydown",e=>{e.key==="Enter"&&!e.isComposing&&(e.preventDefault(),h(d.value))});document.getElementById("backBtn").addEventListener("click",()=>{window.history.length>1?window.history.back():window.location.href="./index.html"});document.getElementById("restartBtn").addEventListener("click",()=>{w=crypto.randomUUID(),l="active",r.innerHTML="",g.classList.add("hidden"),f.classList.remove("hidden"),document.querySelectorAll(".slot-dot").forEach(e=>e.classList.remove("filled")),i("不知道這個月該選哪一款嗎？","告訴我您最近的心情或偏好的氣味，我來幫您找到最合適的香氣。")});T();
