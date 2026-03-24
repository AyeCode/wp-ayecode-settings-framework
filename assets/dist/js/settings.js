(function(){"use strict";function B(e){e.config?.sections&&(e.sections=e.config.sections.map(t=>({...t})))}function W(e){e.allFields=[];const t=(s,i,n=null)=>{Array.isArray(s)&&s.forEach(o=>{o&&(o.type==="group"&&o.fields?t(o.fields,i,n):o.id&&o.searchable!==!1&&e.allFields.push({type:"field",field:o,sectionId:i.id,sectionName:i.name,subsectionId:n?n.id:null,subsectionName:n?n.name:null,icon:i.icon}))})};e.sections.forEach(s=>{e.allFields.push({type:"section",id:s.id,name:s.name,icon:s.icon,searchable:s.searchable||[]}),t(s.fields,s),s.subsections?.forEach(i=>{e.allFields.push({type:"subsection",id:i.id,name:i.name,icon:s.icon,sectionId:s.id,sectionName:s.name,searchable:i.searchable||[]}),t(i.fields,s,i)})})}function L(e,t){if(!t.show_if)return!0;try{return O(e,t.show_if)}catch(s){return console.error(`Error evaluating show_if for "${t.id}":`,s),!0}}function O(e,t){const s=t.replace(/\[%(\w+)%\]/g,(i,n)=>{const o=e[n];return typeof o=="string"?`'${o.replace(/'/g,"\\'")}'`:typeof o=="boolean"||typeof o=="number"?o:"null"});return S(s)}function S(e){for(e=e.trim();e.includes("(");){const t=/\(([^()]+)\)/,s=e.match(t);if(!s)throw new Error("Mismatched parentheses");const i=s[1],n=S(i);e=e.replace(s[0],n?"true":"false")}if(e.includes("||")){const t=e.split("||");for(const s of t)if(S(s.trim()))return!0;return!1}if(e.includes("&&")){const t=e.split("&&");for(const s of t)if(!S(s.trim()))return!1;return!0}return N(e)}function N(e){if(!["==","!=",">","<",">=","<="].some(c=>e.includes(c))){let c;try{c=JSON.parse(e.toLowerCase())}catch{c=e.trim()!==""}return!!c}const t=e.match(/^(.*?)\s*(==|!=|>|<|>=|<=)\s*(.*)$/);if(!t)throw new Error(`Invalid comparison: "${e}"`);let[,s,i,n]=t;const o=c=>(c=c.trim(),c.startsWith("'")&&c.endsWith("'")||c.startsWith('"')&&c.endsWith('"')?c.slice(1,-1):!isNaN(c)&&c!==""?parseFloat(c):c==="true"?!0:c==="false"?!1:c==="null"?null:c),a=o(s),r=o(n);switch(i){case"==":return a==r;case"!=":return a!=r;case">":return a>r;case"<":return a<r;case">=":return a>=r;case"<=":return a<=r;default:throw new Error("op")}}function F(e){if(Array.isArray(e)){if(e.length===0)return;const t=e.map(F).filter(s=>s!==void 0);return t.length>0?t:void 0}if(typeof e=="object"&&e!==null){const t=Object.entries(e).reduce((s,[i,n])=>{const o=F(n);return o!==void 0&&(s[i]=o),s},{});return Object.keys(t).length===0?void 0:t}return e}function D(e){const t=e.activePageConfig;if(!t||["form_builder","custom_page","action_page","import_page","tool_page","extension_list_page"].includes(t.type))return!1;const i=t.fields,n=Array.isArray(i)?i:typeof i=="object"&&i!==null?Object.values(i):[];if(n.length===0)return!1;const o=a=>{const r=["title","group","alert","action_button"];return a.some(c=>{if(c.type==="group"&&c.fields){const l=Array.isArray(c.fields)?c.fields:Object.values(c.fields);return o(l)}return!r.includes(c.type)})};return o(n)}function G(e){const t=e.activePageConfig;if(!t)return!1;if(t.type==="form_builder"){const s=t.id,i=e.settings[s]||[],n=e.originalSettings[s]||[],o=JSON.parse(JSON.stringify(i)).map(l=>(delete l.fields,l)),a=JSON.parse(JSON.stringify(n)).map(l=>(delete l.fields,l)),r=F(o),c=F(a);return JSON.stringify(r)!==JSON.stringify(c)}if(D(e)){const s=Array.isArray(t.fields)?t.fields:Object.values(t.fields||{}),i=n=>{for(const o of n)if(o.type==="group"&&o.fields){const a=Array.isArray(o.fields)?o.fields:Object.values(o.fields);if(i(a))return!0}else if(o.id){const a=e.settings[o.id],r=e.originalSettings[o.id];if(JSON.stringify(a)!==JSON.stringify(r))return!0}return!1};return i(s)}return!1}function Q(e){if(!e.activePageConfig||!e.activePageConfig.fields)return!0;document.querySelectorAll(".asf-field-error").forEach(s=>s.classList.remove("asf-field-error"));const t=Array.isArray(e.activePageConfig.fields)?e.activePageConfig.fields:Object.values(e.activePageConfig.fields);for(const s of t)if(L(e.settings,s)&&s.extra_attributes?.required){const i=e.settings[s.id];if(i===""||i===null||i===void 0||Array.isArray(i)&&i.length===0){e.showNotification(`Error: The "${s.label||s.id}" field is required.`,"error");const n=document.getElementById(s.id);if(n){const o=n.closest(".row");o&&(o.classList.add("asf-field-error"),o.scrollIntoView({behavior:"smooth",block:"center"}),setTimeout(()=>o.classList.remove("asf-field-error"),3500))}return!1}}return!0}async function K(e){if(!Q(e))return!1;e.isLoading=!0;try{const s=await(await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:window.ayecodeSettingsFramework.action,nonce:window.ayecodeSettingsFramework.nonce,settings:JSON.stringify(e.settings)})})).json();if(s.success){const i=s.data.settings;return Object.keys(e.settings).forEach(n=>{n in i||delete e.settings[n]}),Object.keys(i).forEach(n=>{e.settings[n]=i[n]}),e.originalSettings=JSON.parse(JSON.stringify(e.settings)),e.originalImagePreviews=JSON.parse(JSON.stringify(e.imagePreviews)),e.showNotification(s.data?.message||e.strings.saved,"success"),!0}else return e.showNotification(s.data?.message||e.strings.error,"error"),!1}catch(t){return console.error("Save error:",t),e.showNotification(e.strings.error,"error"),!1}finally{e.isLoading=!1}}async function Y(e){e.isLoading=!0;const t=e.activePageConfig.id,s=e.config.sections.find(a=>a.id===t),i=e.editingField?e.editingField._uid:null,n=JSON.parse(JSON.stringify(e.settings[t]));n.forEach(a=>delete a.fields);const o={[t]:n};try{const r=await(await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:window.ayecodeSettingsFramework.action,nonce:window.ayecodeSettingsFramework.nonce,settings:JSON.stringify(o),is_partial_save:!0})})).json();if(r.success){const c=r.data.settings[t],l=s.templates.flatMap(u=>u.options),d=c.map(u=>{const p=l.find(f=>f.id===u.template_id);return p&&(u.fields=p.fields),u});if(e.settings[t]=d,e.originalSettings[t]=JSON.parse(JSON.stringify(d)),i&&i.toString().startsWith("new_")){const u=d.find(p=>p.template_id===e.editingField.template_id&&!e.originalSettings[t].some(f=>f._uid===p._uid));u&&(e.editingField=u)}return e.leftColumnView="field_list",e.editingField=window.__ASF_NULL_FIELD,e.showNotification(r.data?.message||e.strings.form_saved,"success"),!0}else return e.showNotification(r.data?.message||e.strings.error,"error"),!1}catch(a){return console.error("Save error:",a),e.showNotification(e.strings.error,"error"),!1}finally{e.isLoading=!1}}async function Z(e,t=!0){const s=()=>{e.settings=JSON.parse(JSON.stringify(e.originalSettings)),e.imagePreviews=JSON.parse(JSON.stringify(e.originalImagePreviews))};t?await aui_confirm(e.strings.confirm_discard,"Discard","Cancel",!0,!0)&&s():s()}function E(e,t="settings"){let s="";if(window.asfFieldRenderer){const i="render"+e.type.charAt(0).toUpperCase()+e.type.slice(1)+"Field";typeof window.asfFieldRenderer[i]=="function"?s=window.asfFieldRenderer[i](e):typeof window.asfFieldRenderer.renderField=="function"?s=window.asfFieldRenderer.renderField(e):s=`<div class="alert alert-warning">Field renderer for type "${e.type}" not found.</div>`}else s=`<div class="alert alert-warning">Field renderer for type "${e.type}" not found.</div>`;return s=s.replace(/settings\.([a-zA-Z0-9_-]+)/g,"settings['$1']"),t!=="settings"&&(s=s.replace(/settings\[/g,`${t}[`)),s}async function y(e,t){if(e.loadedContentCache[t])return;const s=e.sections.find(i=>i.id===t);if(s?.ajax_content){e.isContentLoading=!0;try{const n=await(await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:window.ayecodeSettingsFramework.content_pane_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,content_action:s.ajax_content})})).json();e.loadedContentCache[t]=n.success?n.data.html:`<div class="alert alert-danger">Error: ${n.data?.message||"Could not load content."}</div>`}catch{e.loadedContentCache[t]='<div class="alert alert-danger">Request failed while loading content.</div>'}finally{e.isContentLoading=!1}}}function v(e){const t=R(e);t&&window.dispatchEvent(new CustomEvent("asf-section-changed",{detail:{sectionId:t.id,sectionType:t.type,activePageConfig:t}}))}function C(e){return e.sections.find(t=>t.id===e.currentSection)}function M(e){const t=C(e);return t?.subsections?t.subsections.find(s=>s.id===e.currentSubsection):null}function R(e){return M(e)||C(e)||null}function A(e){if(e.sections.length>0){e.currentSection=e.sections[0].id;const t=C(e);t?.subsections?.length>0&&(e.currentSubsection=t.subsections[0].id),t?.type==="custom_page"&&t.ajax_content&&y(e,e.currentSection)}$(e),v(e)}function z(e){const t=window.location.hash.substring(1);if(!t){A(e);return}const s=new URLSearchParams(t),i=s.get("section"),n=s.get("subsection"),o=s.get("field"),a=e.sections.find(r=>r.id===i);a?(e.currentSection=i,a?.type==="custom_page"&&a.ajax_content&&y(e,i),n&&a.subsections?.some(r=>r.id===n)?e.currentSubsection=n:e.currentSubsection=a.subsections?.length?a.subsections[0].id:"",v(e)):A(e),o&&e.highlightField(o)}function $(e,t=null){const s=new URLSearchParams;e.currentSection&&s.set("section",e.currentSection),e.currentSubsection&&s.set("subsection",e.currentSubsection),t&&s.set("field",t);const i=s.toString();history.replaceState(null,"",i?`#${i}`:window.location.pathname+window.location.search)}function X(e,t,s=""){e.changeView(()=>{e.currentSection=t;const i=e.sections.find(n=>n.id===t);e.currentSubsection=s||(i?.subsections?.length?i.subsections[0].id:""),e.searchModal?.hide?.(),$(e),v(e),i?.type==="custom_page"&&i.ajax_content&&y(e,t)})}function ee(e,t){e.changeView(()=>{e.currentSection=t,e.sidebarOpen=!1;const s=e.sections.find(i=>i.id===t);e.currentSubsection=s?.subsections?.length?s.subsections[0].id:"",$(e),v(e),s?.type==="custom_page"&&s.ajax_content&&y(e,t)})}function te(e,t){e.currentSubsection!==t&&e.changeView(()=>{e.currentSubsection=t,$(e),v(e)})}function se(e){e.searchModalEl=document.getElementById("asf-search-modal"),e.searchModalEl&&(e.searchModal=new bootstrap.Modal(e.searchModalEl),e.searchModalEl.addEventListener("shown.bs.modal",()=>document.getElementById("asf-search-input")?.focus()),e.searchModalEl.addEventListener("hidden.bs.modal",()=>e.searchQuery=""))}function ie(e){if(!e.searchQuery.trim())return[];const t=e.searchQuery.toLowerCase().trim(),i=e.allFields.filter(o=>{if(o.type==="field"){const a=o.field;return[a.label,a.description,o.sectionName,o.subsectionName,...a.searchable||[]].join(" ").toLowerCase().includes(t)}else if(o.type==="section"||o.type==="subsection")return[o.name,...o.searchable||[]].join(" ").toLowerCase().includes(t);return!1}).reduce((o,a)=>{if(a.type==="field"){const r=a.subsectionName||a.sectionName,c=a.subsectionName?`${a.sectionName} &raquo; ${a.subsectionName}`:a.sectionName;o[r]||(o[r]={groupTitle:c,sectionIcon:a.sectionIcon,results:[],sectionId:a.sectionId,subsectionId:a.subsectionId}),o[r].results.push(a)}else if(a.type==="section"){const r=a.name;o[r]||(o[r]={groupTitle:a.name,sectionIcon:a.icon,results:[],sectionId:a.id,subsectionId:null}),o[r].results.push(a)}else if(a.type==="subsection"){const r=`${a.sectionName} &raquo; ${a.name}`;o[r]||(o[r]={groupTitle:r,sectionIcon:a.icon,results:[],sectionId:a.sectionId,subsectionId:a.id}),o[r].results.push(a)}return o},{}),n=(e.customSearchLinks||[]).filter(o=>[o.title,o.description,...o.searchable||[]].join(" ").toLowerCase().includes(t));return n.length&&(i.helpful_links={groupTitle:"Helpful Links",sectionIcon:"fas fa-fw fa-external-link-alt",results:n,isCustomGroup:!0}),Object.values(i)}function ne(e,t){e.changeView(()=>{t.type==="field"?(e.currentSection=t.sectionId,e.currentSubsection=t.subsectionId||"",e.searchModal.hide(),e.updateUrlHash(t.field.id),e.$nextTick(()=>e.highlightField(t.field.id))):t.type==="section"?(e.currentSection=t.id,e.currentSubsection="",e.searchModal.hide(),e.updateUrlHash()):t.type==="subsection"&&(e.currentSection=t.sectionId,e.currentSubsection=t.id,e.searchModal.hide(),e.updateUrlHash())})}function oe(e,t){e.searchModal?.hide?.(),t.external?window.open(t.url,"_blank"):window.location.href=t.url}function ae(e){const t=s=>{(s.type==="action_page"||s.type==="import_page"||s.type==="tool_page")&&re(e,s)};e.sections.forEach(s=>{t(s),s.subsections?.forEach(t)}),e.allFields.forEach(s=>{if(s.type==="field"&&s.field.type==="action_button")if(s.field.toggle_config){const i=s.field.has_dummy_data||!1;e.actionStates[s.field.id]={has_dummy_data:i,isLoading:!1,message:"",progress:0,success:null},e.settings[s.field.id]=i}else e.actionStates[s.field.id]={isLoading:!1,message:"",progress:0,success:null}})}function re(e,t){const s=n=>{Array.isArray(n)&&n.forEach(o=>{o&&(o.id&&e.settings[o.id]===void 0&&o.default!==void 0?e.settings[o.id]=o.default:o.id&&e.settings[o.id]===void 0&&(e.settings[o.id]=""),o.type==="group"&&o.fields&&s(o.fields))})};s(t.fields);let i={isLoading:!1,message:"",progress:0,success:null,exportedFiles:[]};t.type==="import_page"&&(i={...i,uploadedFilename:"",uploadProgress:0,processingProgress:0,status:"idle",summary:{}}),e.actionStates[t.id]=i}function ce(e){return Object.values(e.actionStates).some(t=>t.isLoading)}async function le(e){const t=e.activePageConfig;if(!t||!t.ajax_action){console.error("Action page configuration not found.");return}const s=e.actionStates[t.id];s.isLoading=!0,s.message="Starting...",s.progress=0,s.processingProgress=0,s.success=null,s.exportedFiles=[],t.type==="import_page"&&(s.status="processing");const i={};if(t.fields?.forEach(o=>{o.id&&(i[o.id]=e.settings[o.id])}),t.type==="import_page"){const o=e.actionStates[t.id];o?.uploadedFilename&&(i.import_filename=o.uploadedFilename)}const n=async o=>{try{const a={action:window.ayecodeSettingsFramework.tool_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,tool_action:t.ajax_action,step:o,input_data:JSON.stringify(i)},r=await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(a)});if(!r.ok)throw new Error(`Server responded with status: ${r.status}`);const c=await r.json();s.success=c.success,c.data?.message&&(s.message=c.data.message);const l=c.data?.progress||0;c.data?.summary&&(s.summary=c.data.summary),t.type==="import_page"?s.processingProgress=l:s.progress=l,c.success&&c.data?.file&&s.exportedFiles.push(c.data.file),c.success&&c.data?.next_step!==null&&l<100?setTimeout(()=>n(c.data.next_step),20):(s.isLoading=!1,t.type==="import_page"&&(s.status="complete"))}catch(a){s.success=!1,s.message="An error occurred. Please check the console and try again.",s.isLoading=!1,t.type==="import_page"&&(s.status="complete"),console.error("Page action failed:",a)}};n(0)}async function de(e,t){const s=e.allFields.find(d=>d.type==="field"&&d.field.id===t);if(!s){console.error("Action button configuration not found for:",t);return}const i=s.field,n=e.actionStates[t];let o;if(i.toggle_config?o=n.has_dummy_data?i.toggle_config.remove.ajax_action:i.toggle_config.insert.ajax_action:o=i.ajax_action,!o){console.error("No ajax_action defined for:",t);return}n.isLoading=!0,n.message=e.strings.starting,n.progress=0,n.success=null;const a={};let c=document.getElementById(t)?.closest?.(".card-body")||e.$refs["action_container_"+t]||null;c&&c.querySelectorAll("input, select, textarea").forEach(u=>{const p=u.getAttribute("data-id")||u.id;p&&(a[p]=u.type==="checkbox"?u.checked:u.value)});const l=async d=>{try{const u={action:window.ayecodeSettingsFramework.tool_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,tool_action:o,step:d,input_data:JSON.stringify(a)},p=await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(u)});if(!p.ok)throw new Error(`Server responded with an error: ${p.status}`);const f=await p.json();n.success=f.success,f.data?.message&&(n.message=f.data.message),f.data?.progress&&(n.progress=f.data.progress),f.success&&f.data?.next_step!==null&&f.data?.progress<100?setTimeout(()=>l(f.data.next_step),20):(n.isLoading=!1,f.success&&i.toggle_config&&(n.has_dummy_data=!n.has_dummy_data,e.settings[t]=n.has_dummy_data),n.success&&setTimeout(()=>{n.message="",n.success=null},8e3))}catch(u){n.success=!1,n.message=e.strings.something_went_wrong,n.isLoading=!1,console.error("Action failed:",u)}};l(0)}function ue(e,t,s,i){const n=e.actionStates[s],o=t.dataTransfer?t.dataTransfer.files[0]:t.target.files[0];if(!o)return;const r=e.findPageConfigById(s,e.sections)?.accept_file_type;if(r){const d=o.name.split(".").pop().toLowerCase(),p={csv:"text/csv",json:"application/json"}[r];if(d!==r||p&&o.type!==p){n.status="error",n.success=!1,n.message=`Invalid file type. Please upload a .${r} file.`,t.target&&(t.target.value=null);return}}t.target&&(t.target.value=null),n.status="uploading",n.isLoading=!0,n.message="",n.success=null,n.uploadProgress=0;const c=new FormData;c.append("action",window.ayecodeSettingsFramework.file_upload_ajax_action),c.append("nonce",window.ayecodeSettingsFramework.tool_nonce),c.append("import_file",o);const l=new XMLHttpRequest;l.open("POST",window.ayecodeSettingsFramework.ajax_url,!0),l.upload.onprogress=d=>{d.lengthComputable&&(n.uploadProgress=Math.round(d.loaded*100/d.total))},l.onload=()=>{if(n.isLoading=!1,l.status>=200&&l.status<300){const d=JSON.parse(l.responseText);d.success?(n.status="selected",n.uploadedFilename=d.data.filename,n.message=d.data.message,e.settings[i]=d.data.filename):(n.status="error",n.success=!1,n.message=d.data.message||e.strings.file_upload_failed)}else n.status="error",n.success=!1,n.message=`Upload error: ${l.statusText}`},l.onerror=()=>{n.isLoading=!1,n.status="error",n.success=!1,n.message="A network error occurred during upload."},l.send(c)}async function ge(e,t,s){const i=e.actionStates[t];if(!i?.uploadedFilename)return;const n=i.uploadedFilename;i.status="idle",i.uploadedFilename="",i.message="",i.success=null,e.settings[s]="";try{await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:window.ayecodeSettingsFramework.file_delete_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,filename:n})})}catch(o){console.error("Error deleting temp file:",o)}}function _(e,t,s="info"){if(typeof window.aui_toast=="function")window.aui_toast("asf-settings-framework-"+s,s,t);else if(typeof window.aui_modal=="function"){const i=s==="error"?"Error":s==="success"?"Success":"Notice";window.aui_modal(i,t,"",!0,"text-center","","")}else alert(t)}function he(e){const t=localStorage.getItem("asf_theme"),s=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;e.theme=t||(s?"dark":"light"),e.$watch?.("theme",i=>localStorage.setItem("asf_theme",i))}function pe(e){e.theme=e.theme==="light"?"dark":"light"}function j(e){e.$nextTick(()=>{console.log("Re-initializing..."),typeof window.aui_init=="function"&&window.aui_init(),be(e)})}function fe(e,t){if(e.isChangingView)return;e.isChangingView=!0;const s=e.$refs.settingsPane,i=150;s&&(s.classList.remove("fade-in"),s.classList.add("fade-out")),setTimeout(()=>{t(),e.$nextTick(()=>{s&&(s.offsetWidth,s.classList.remove("fade-out"),s.classList.add("fade-in")),j(e),setTimeout(()=>{e.isChangingView=!1},i)})},i)}function me(e){window.addEventListener("beforeunload",t=>{(e.hasUnsavedChanges||e.isActionRunning)&&(t.preventDefault(),t.returnValue="A task is running or you have unsaved changes. Are you sure you want to leave?")}),document.addEventListener("keydown",t=>{(t.ctrlKey||t.metaKey)&&t.key==="k"&&(t.preventDefault(),e.searchModal?.show?.())},!0),window.addEventListener("hashchange",()=>e.handleUrlHash())}window.activeChoicesInstances=window.activeChoicesInstances||{},window.activeChoicesWatchers=window.activeChoicesWatchers||{};function we(e,t){setTimeout(()=>{const s=e.$refs[t];if(!s||!s.classList.contains("aui-select2"))return;window.activeChoicesWatchers[t]&&window.activeChoicesWatchers[t](),window.activeChoicesInstances[t]&&window.activeChoicesInstances[t].destroy();const i=e.editingField&&e.editingField._uid?"editingField":"settings",n=e[i],o=window.aui_get_choices_config?.(s),a=new window.Choices(s,o);window.activeChoicesInstances[t]=a,a.setChoiceByValue(String(n[t])),s.addEventListener("change",()=>{n[t]=a.getValue(!0)});const r=e.$watch(`${i}['${t}']`,c=>{if(!a.initialised)return;const l=a.getValue(!0);c!==l&&a.setChoiceByValue(String(c))});window.activeChoicesWatchers[t]=r},0)}function _e(e,t){setTimeout(()=>{const s=e.$refs[t];if(!s)return;window.activeChoicesWatchers[t]&&window.activeChoicesWatchers[t](),window.activeChoicesInstances[t]&&window.activeChoicesInstances[t].destroy();const i=e.editingField&&e.editingField._uid?"editingField":"settings",n=e[i];Array.isArray(n[t])||(n[t]=[]);const o=window.aui_get_choices_config?.(s),a=new window.Choices(s,o);window.activeChoicesInstances[t]=a,a.setChoiceByValue(n[t]),s.addEventListener("change",()=>{const c=a.getValue(!0),l=n[t];JSON.stringify(l)!==JSON.stringify(c)&&(l.length=0,c.forEach(d=>l.push(d)))});const r=e.$watch(`${i}['${t}']`,c=>{if(!a.initialised)return;const l=a.getValue(!0);JSON.stringify(c)!==JSON.stringify(l)&&a.setChoiceByValue(c)});window.activeChoicesWatchers[t]=r},0)}function be(e){document.querySelectorAll('input[data-aui-init="iconpicker"]').forEach(s=>{const i=()=>{const a=s.id;if(!a)return;const r=s.value;e.editingField&&e.editingField._uid&&Object.prototype.hasOwnProperty.call(e.editingField,a)?e.editingField[a]!==r&&(e.editingField[a]=r):e.settings[a]!==r&&(e.settings[a]=r)},n=()=>{s.dispatchEvent(new Event("change",{bubbles:!0})),i()};s.addEventListener("input",i),s.addEventListener("change",i),s.addEventListener("iconpickerSelected",n),s.addEventListener("iconpickerChange",n),s.addEventListener("change.bs.iconpicker",n),s.addEventListener("iconpicker-selected",n);const o=s.closest(".input-group")?.querySelector(".input-group-addon, .input-group-text");o&&o.addEventListener("click",()=>{setTimeout(n,0)})})}function ye(e,t){if(typeof window.wp>"u"||typeof window.wp.media>"u"){alert("WordPress media library not available.");return}const s=window.wp.media({title:"Select or Upload an Image",button:{text:"Use this image"},multiple:!1});s.on("select",()=>{const i=s.state().get("selection").first().toJSON();e.settings[t]=i.id;const n=i.sizes?.thumbnail?.url||i.sizes?.medium?.url||i.url;e.imagePreviews[t]=n}),s.open()}function ve(e,t){e.settings[t]=null,delete e.imagePreviews[t]}function $e(e,t,s,i){if(typeof window.GeoDirectoryMapManager>"u"||typeof window.geodirMapData>"u"){console.error(`Cannot initialize GD Map for '${t}': GeoDirectory map scripts are not loaded on this page.`);const n=e.$refs[t+"_map_canvas"];n&&(n.innerHTML='<div class="alert alert-danger m-3">Error: GeoDirectory map scripts are not available.</div>');return}e.$nextTick(()=>{const n=e.$refs[t+"_map_canvas"];if(!n){console.error(`Map container not found for field '${t}'.`);return}const o=JSON.parse(JSON.stringify(window.geodirMapData));o.lat=e.settings[s]||o.default_lat,o.lng=e.settings[i]||o.default_lng,o.lat_lng_blank=!e.settings[s]&&!e.settings[i],o.prefix=`${t}_`;const a={onMarkerUpdate:r=>{e.settings[s]=parseFloat(r.lat).toFixed(6),e.settings[i]=parseFloat(r.lng).toFixed(6)}};window.GeoDirectoryMapManager.initMap(n.id,o,a)})}function Se(e,t){e.$nextTick(()=>{const s=document.getElementById(t);if(!s)return;const i=s.closest(".row, .py-4, .border-bottom");i&&(i.scrollIntoView({behavior:"smooth",block:"center"}),i.classList.add("highlight-setting"),setTimeout(()=>i.classList.remove("highlight-setting"),3500))})}function U(e,t){for(const s of t){if(s.id===e)return s;if(s.subsections){const i=U(e,s.subsections);if(i)return i}}return null}window.__ASF_NULL_FIELD=new Proxy({},{get:(e,t)=>t==="hasOwnProperty"?s=>Object.prototype.hasOwnProperty.call(e,s):"",has:()=>!0});function T(e){return e.reduce((t,s)=>(s.id&&(t[s.id]=s.default!==void 0?s.default:null),s.type==="group"&&s.fields&&Object.assign(t,T(s.fields)),s.type==="accordion"&&s.fields&&s.fields.forEach(i=>{i.fields&&Object.assign(t,T(i.fields))}),t),{})}function Fe(){return{config:window.ayecodeSettingsFramework?.config||{},originalSettings:{},settings:{},strings:window.ayecodeSettingsFramework?.strings||{},imagePreviews:{},originalImagePreviews:{},currentSection:"",currentSubsection:"",searchQuery:"",isLoading:!1,sidebarOpen:!1,theme:"light",isChangingView:!1,searchModalEl:null,searchModal:null,allFields:[],customSearchLinks:[],sections:[],actionStates:{},isContentLoading:!1,loadedContentCache:{},accordionStates:{},leftColumnView:"field_list",editingField:null,sortIteration:0,activeSyncListeners:[],initialTargetValues:{},isValidating:!1,lastEditFieldCall:0,init(){he(this),this.editingField=window.__ASF_NULL_FIELD,this.customSearchLinks=window.ayecodeSettingsFramework?.custom_search_links||[],B(this),this.settings=window.ayecodeSettingsFramework?.settings||{},this.imagePreviews=window.ayecodeSettingsFramework?.image_previews||{},W(this),this.sections.forEach(e=>{if(e.type==="form_builder"){Array.isArray(this.settings[e.id])||(this.settings[e.id]=[]);const t=e.templates.flatMap(s=>s.options);this.settings[e.id].forEach(s=>{const i=t.find(n=>n.id===s.template_id);i&&(s.fields=i.fields,s._template_icon=i.icon,i.fields.forEach(n=>{s[n.id]===void 0&&n.default!==void 0&&(s[n.id]=n.default),n.type==="toggle"&&s[n.id]===!0&&(s[n.id]=1)}))})}}),this.originalSettings=JSON.parse(JSON.stringify(this.settings)),this.originalImagePreviews=JSON.parse(JSON.stringify(this.imagePreviews)),ae(this),z(this),se(this),me(this),j(this),this.$watch("leftColumnView",(e,t)=>{e==="field_list"&&t==="field_settings"&&this.clearSyncListeners()})},get activePageConfig(){return R(this)},get hasUnsavedChanges(){return G(this)},get currentSectionData(){return C(this)},get currentSubsectionData(){return M(this)},get isSettingsPage(){return D(this)},get isActionRunning(){return ce(this)},get groupedSearchResults(){return ie(this)},get duplicateKeys(){const e=this.activePageConfig?.unique_key_property;if(!e)return[];const s=(this.settings[this.activePageConfig.id]||[]).reduce((i,n)=>{const o=n[e];return o&&(i[o]=(i[o]||0)+1),i},{});return Object.keys(s).filter(i=>s[i]>1)},get parentFields(){return(this.settings[this.activePageConfig?.id]||[]).filter(t=>!t._parent_id||t._parent_id==0)},childFields(e){return(this.settings[this.activePageConfig?.id]||[]).filter(s=>s._parent_id==e)},get otherFields(){return!this.activePageConfig||this.activePageConfig.type!=="form_builder"||!this.editingField?._uid?[]:(this.settings[this.activePageConfig.id]||[]).filter(t=>t._uid!==this.editingField._uid).map(t=>({label:t.label,value:t.key||t.htmlvar_name||t._uid,_uid:t._uid}))},confirmWithThreeButtons(){return new Promise(e=>{window.asfConfirmResolve=s=>{const i=document.querySelector(".aui-modal.show");if(i){const n=bootstrap.Modal.getInstance(i);n&&n.hide()}e(s)},aui_modal("",`
                    <h3 class='h4 py-3 text-center text-dark'>You have unsaved changes.</h3>
                    <p class='text-center text-muted'>What would you like to do?</p>
                    <div class='d-flex justify-content-center mt-4'>
                        <button class='btn btn-outline-secondary w-100 me-2' onclick='window.asfConfirmResolve("cancel")'>Cancel</button>
                        <button class='btn btn-danger w-100 me-2' onclick='window.asfConfirmResolve("discard")'>Discard</button>
                        <button class='btn btn-primary w-100' onclick='window.asfConfirmResolve("save")'>Save & Continue</button>
                    </div>
                `,"",!1,"","")})},async navigateTo(e){if(this.hasUnsavedChanges){const t=await this.confirmWithThreeButtons();t==="save"?(this.activePageConfig.type==="form_builder"?await this.saveForm():await this.saveSettings())?e():this.showNotification(this.strings.save_failed_navigation_cancelled,"error"):t==="discard"&&(this.discardChanges(!1),e())}else e()},toggleTheme(){pe(this)},reinitializePlugins(){j(this)},changeView(e){fe(this,e)},goToSearchResult(e){this.navigateTo(()=>ne(this,e))},goToSection(e,t=""){this.navigateTo(()=>{this.activePageConfig?.type==="form_builder"&&(this.editingField=window.__ASF_NULL_FIELD,this.leftColumnView="field_list"),X(this,e,t)})},goToCustomLink(e){this.navigateTo(()=>oe(this,e))},switchSection(e){this.navigateTo(()=>{this.activePageConfig?.type==="form_builder"&&(this.editingField=window.__ASF_NULL_FIELD,this.leftColumnView="field_list"),ee(this,e)})},switchSubsection(e){this.navigateTo(()=>te(this,e))},highlightField(e){Se(this,e)},handleUrlHash(){z(this)},updateUrlHash(e=null){$(this,e)},setInitialSection(){A(this)},async saveSettings(){return await K(this)},async discardChanges(e=!0){await Z(this,e)},shouldShowField(e){const t=this.editingField&&this.editingField._uid?this.editingField:this.settings;return L(t,e)},evaluateCondition(e){return O(this,e)},evaluateSimpleComparison(e){return N(e)},renderField(e,t="settings",s=null){return!e||typeof e!="object"||!e.type?"":(s||this.activePageConfig,E(e,t))},selectImage(e){ye(this,e)},removeImage(e){ve(this,e)},initGdMap(e,t,s){$e(this,e,t,s)},initChoice(e){we(this,e)},initChoices(e){_e(this,e)},async executePageAction(){await le(this)},async executeAction(e){await de(this,e)},handleFileUpload(e,t,s){ue(this,e,t,s)},async removeUploadedFile(e,t){await ge(this,e,t)},async loadCustomPageContent(e){await y(this,e)},async saveForm(){if(this.leftColumnView==="field_settings"&&!this.validateEditingField())return!1;const e=this.activePageConfig.id;return(this.settings[e]||[]).forEach(s=>{const i=s._parent_id===null||s._parent_id===void 0?0:s._parent_id;s._parent_id=i,"tab_parent"in s&&(s.tab_parent=i),"tab_level"in s&&(s.tab_level=i?1:0)}),await Y(this)},countFieldsByTemplateId(e){const t=this.settings[this.activePageConfig.id]||[],s=e.defaults&&e.defaults.field_type_key?e.defaults.field_type_key:e.base_id||e.id;return t.filter(i=>(i.field_type_key||i.template_id)===s).length},handleFieldClick(e){if(e.limit&&this.countFieldsByTemplateId(e)>=e.limit){window.aui_toast?.("asf-limit-reached","error",this.strings.field_single_use_limit);return}this.addField(e)},addField(e){let t=e,s=null;if(e.base_id){if(t=this.activePageConfig.templates.flatMap(a=>a.options).find(a=>a.id===e.base_id),!t){alert(this.strings.base_template_not_found.replace("%s",e.base_id));return}s=e.defaults||{}}const i=JSON.parse(JSON.stringify(T(t.fields)));if(i._uid="new_"+Date.now(),i.is_new=!0,i.template_id=t.id,i.fields=JSON.parse(JSON.stringify(t.fields)),i._template_icon=t.icon,i._parent_id=0,"tab_parent"in i&&(i.tab_parent=0),"tab_level"in i&&(i.tab_level=0),s)for(const o in s)Object.prototype.hasOwnProperty.call(i,o)&&(i[o]=JSON.parse(JSON.stringify(s[o])));const n=this.activePageConfig?.unique_key_property;if(n&&i[n]){const o=this.settings[this.activePageConfig.id]||[];let a=i[n],r=2;for(;o.some(c=>c[n]===a);)a=`${i[n]}${r}`,r++;i[n]=a}this.settings[this.activePageConfig.id].push(i),this._internalEditField(i)},slugify(e){return String(e).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase().replace(/[^a-z0-9 -]/g,"").replace(/\s+/g,"_").replace(/-+/g,"_")},findSchemaById(e,t){for(const s of e){if(s.id===t)return s;if(s.fields){const i=this.findSchemaById(s.fields,t);if(i)return i}}return null},validateEditingField(){if(this.isValidating)return!0;this.isValidating=!0;try{if(!this.editingField||!this.editingField.fields)return!0;const e=document.getElementById("asf-field-settings");e&&e.querySelectorAll(".asf-field-error").forEach(s=>s.classList.remove("asf-field-error"));const t=s=>{for(const i of s)if(this.shouldShowField(i)){if(i.extra_attributes?.required){const n=this.editingField[i.id];if(n===""||n===null||n===void 0)return this.showNotification(this.strings.field_required_error.replace("%s",i.label||i.id),"error"),this.$nextTick(()=>{const o=document.getElementById(i.id);if(o){const a=o.closest(".accordion-collapse");a&&!a.classList.contains("show")&&new bootstrap.Collapse(a).show();const r=o.closest(".row");r&&(r.classList.add("asf-field-error"),r.scrollIntoView({behavior:"smooth",block:"center"}),setTimeout(()=>{r.classList.remove("asf-field-error")},3500))}}),!1}if(i.fields&&Array.isArray(i.fields)&&!t(i.fields))return!1}return!0};return t(this.editingField.fields)}finally{this.isValidating=!1}},_internalEditField(e){const t=performance.now();if(!(t-this.lastEditFieldCall<100)&&(this.lastEditFieldCall=t,this.editingField?._uid!==e._uid)){if(this.editingField&&this.editingField._uid&&this.editingField._uid!==e._uid){if(this.clearSyncListeners(),!this.validateEditingField()){this.$nextTick(()=>this.setupWatchersForField(this.editingField));return}}else this.clearSyncListeners();this.editingField=window.__ASF_NULL_FIELD,this.leftColumnView="field_list",this.$nextTick(()=>{const s=this.getTemplateForField(e);s&&(e.fields=s.fields),document.querySelector(".tooltip")?.remove(),this.initialTargetValues={},this.editingField=e,this.leftColumnView="field_settings",this.$nextTick(()=>{this.reinitializePlugins()})})}},editField(e){this.activePageConfig.type==="form_builder"&&this.hasUnsavedChanges?this._internalEditField(e):this.navigateTo(()=>this._internalEditField(e))},handleFocusSync(e){if(!this.editingField||!this.editingField.fields)return;const t=this.editingField,s=this.findSchemaById(t.fields,e);if(!s||!s.syncs_with)return;const i=t[e];if(i&&String(i).trim()!==""||!s.syncs_with.every(a=>{const r=t[a.target];return!r||String(r).trim()===""}))return;const o=this.$watch(`editingField.${e}`,a=>{s.syncs_with.forEach(r=>{const c=r.transform==="slugify"?this.slugify(a):a;this.editingField[r.target]=c})});this.activeSyncListeners.push(o)},clearSyncListeners(){for(;this.activeSyncListeners.length>0;){const e=this.activeSyncListeners.pop();if(typeof e=="function")try{e()}catch(t){console.error("Error clearing watcher:",t)}}},closeEditingField(){this.validateEditingField()&&(this.clearSyncListeners(),this.leftColumnView="field_list",this.$nextTick(()=>{this.editingField=window.__ASF_NULL_FIELD}))},async deleteField(e){if(e._is_default){alert(this.strings.default_field_cannot_delete);return}if(!await aui_confirm("Are you sure you want to delete this field?","Delete Field","Cancel",!0))return;let s=this.settings[this.activePageConfig.id];const i=s.findIndex(n=>n._uid===e._uid);i>-1&&s.splice(i,1),this.settings[this.activePageConfig.id]=s.filter(n=>n._parent_id!==e._uid),this.editingField&&this.editingField._uid===e._uid&&(this.editingField=window.__ASF_NULL_FIELD,this.leftColumnView="field_list")},handleSort(e,t,s=null){const i=this.activePageConfig.id;let n=[...this.settings[i]];const o=n.find(d=>d._uid==e);if(!o)return;if(s){const d=n.find(f=>f._uid==s),u=this.getTemplateForField(d),p=this.getTemplateForField(o);if(u&&u.allowed_children){if(u.allowed_children[0]!=="*"&&(!p||!u.allowed_children.includes(p.id))){alert(`A "${p?.title}" field cannot be placed inside a "${u.title}".`),this.sortIteration++;return}}else if(!this.activePageConfig.nestable){alert(this.strings.nesting_not_enabled),this.sortIteration++;return}}if(s!==null&&n.some(d=>d._parent_id===o._uid)){alert(this.strings.items_with_children_cannot_nest),this.sortIteration++;return}const a=s===null?0:s;o._parent_id=a,"tab_parent"in o&&(o.tab_parent=a),"tab_level"in o&&(o.tab_level=a?1:0);const r=n.indexOf(o);n.splice(r,1);const c=n.filter(d=>(d._parent_id===null?0:d._parent_id)==a);let l;if(t>=c.length){const d=c.length>0?c[c.length-1]:null;if(d){const u=n.indexOf(d),p=n.findLastIndex?n.findLastIndex(f=>f._parent_id===d._uid):-1;l=p!==-1?p+1:u+1}else a?l=n.findIndex(u=>u._uid===a)+1:l=n.length}else{const d=c[t];l=n.indexOf(d)}n.splice(l,0,o),this.settings[i]=n,this.sortIteration++},addCondition(){this.editingField.conditions||(this.editingField.conditions=[]),this.editingField.conditions.push({action:"",field:"",condition:"",value:""})},removeCondition(e){this.editingField.conditions.splice(e,1)},getTemplateForField(e){if(!e||!e.template_id)return null;const t=this.activePageConfig;return t&&t.templates?t.templates.flatMap(i=>i.options).find(i=>i.id===e.template_id):null},findPageConfigById(e,t){return U(e,t)},showNotification(e,t){_(this,e,t)}}}function Ce(e){return{config:e,_lastLoadedSectionId:null,view:"list",items:[],editingItem:{},postCreateItem:{},isLoading:!0,isSaving:!1,isEditing:!1,modalInstance:null,searchQuery:"",sortColumn:"",sortDirection:"asc",currentStatus:"all",currentFilters:{},selectedItems:[],bulkAction:"",get filteredItems(){let t=this.items;if(this.searchQuery.trim()!==""){const s=this.searchQuery.toLowerCase().trim();t=this.items.filter(i=>Object.values(i).some(n=>String(n).toLowerCase().includes(s)))}return this.sortColumn&&t.sort((s,i)=>{let n=s[this.sortColumn],o=i[this.sortColumn];return typeof n=="number"&&typeof o=="number"?this.sortDirection==="asc"?n-o:o-s:this.sortDirection==="asc"?String(n).localeCompare(String(o)):String(o).localeCompare(String(n))}),t},init(){console.log("[List Table] init() called for section:",this.config.id,this.config.name),this.config.modal_config&&this.$refs.editModal&&(this.modalInstance=new bootstrap.Modal(this.$refs.editModal)),this.config.table_config.statuses&&this.config.table_config.statuses.status_key&&(this.config.table_config.statuses.default_status&&(this.currentStatus=this.config.table_config.statuses.default_status),this.config.table_config.statuses.counts||(this.config.table_config.statuses.counts={})),this.config.table_config.filters&&this.config.table_config.filters.forEach(t=>{this.currentFilters[t.id]=""}),console.log("[List Table] About to call load_items()..."),this.load_items(),this.$refs.editModal&&this.$refs.editModal.addEventListener("hidden.bs.modal",()=>{this.editingItem={},this.isEditing=!1}),this.$watch("currentFilters",()=>this.load_items(),{deep:!0}),console.log("[List Table] Setting up section-change listener"),window.addEventListener("asf-section-changed",t=>{console.log("[List Table] Section changed event received!",t.detail);const s=t.detail.sectionId;if(t.detail.sectionType==="list_table"&&s!==this._lastLoadedSectionId){console.log("[List Table] Different list_table section detected!"),console.log("[List Table] Last loaded:",this._lastLoadedSectionId,"New section:",s);const n=t.detail.activePageConfig;n.table_config?.statuses&&!n.table_config.statuses.counts&&(n.table_config.statuses.counts={}),this.config=n,this._lastLoadedSectionId=s,this.load_items()}})},filter_by_status(t){this.currentStatus=t,this.load_items()},update_counts(t){t&&this.config.table_config.statuses&&(this.config.table_config.statuses.counts=t)},toggle_select_all(t){t.target.checked?this.selectedItems=this.filteredItems.map(s=>s.id):this.selectedItems=[]},async apply_bulk_action(){if(!this.bulkAction||this.selectedItems.length===0){_(this,"Please select an action and at least one item.","error");return}if(await window.aui_confirm(`You are about to perform the action "${this.config.table_config.bulk_actions[this.bulkAction]}" on ${this.selectedItems.length} items. Are you sure?`,"Confirm","Cancel",!0,!0)){const s=await this.do_ajax(this.config.table_config.ajax_action_bulk,{action:this.bulkAction,item_ids:this.selectedItems});s&&s.success&&(_(this,s.data?.message||"Action applied successfully!","success"),this.selectedItems=[],this.bulkAction="",this.load_items())}},sort_by(t){this.sortColumn===t?this.sortDirection=this.sortDirection==="asc"?"desc":"asc":(this.sortColumn=t,this.sortDirection="asc")},async do_ajax(t,s={}){this.isSaving=!0;try{const n=await(await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:window.ayecodeSettingsFramework.tool_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,tool_action:t,section_id:this.config.id,data:JSON.stringify(s),status:this.currentStatus,filters:JSON.stringify(this.currentFilters)})})).json();return n.success||_(this,n.data?.message||"An error occurred.","error"),n}catch{_(this,"A network error occurred during the request.","error")}finally{this.isSaving=!1}},async do_ajax_with_files(t,s={}){this.isSaving=!0;try{const i=new FormData;i.append("action",window.ayecodeSettingsFramework.tool_ajax_action),i.append("nonce",window.ayecodeSettingsFramework.tool_nonce),i.append("tool_action",t),i.append("section_id",this.config.id),i.append("status",this.currentStatus),i.append("filters",JSON.stringify(this.currentFilters));const n={};this.$refs.editModal.querySelectorAll('input[type="file"]').forEach(c=>{const l=c.id||c.name;c.files&&c.files[0]&&i.append(l,c.files[0])});for(const[c,l]of Object.entries(s)){const d=this.config.modal_config.fields.find(u=>u.id===c);(!d||d.type!=="file"&&d.type!=="image")&&(n[c]=l)}i.append("data",JSON.stringify(n));const r=await(await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",body:i})).json();return r.success||_(this,r.data?.message||"An error occurred.","error"),r}catch{_(this,"A network error occurred during the request.","error")}finally{this.isSaving=!1}},async load_items(){console.log("[List Table] load_items() called, action:",this.config.table_config.ajax_action_get,"section:",this.config.id),console.log("[List Table] _lastLoadedSectionId:",this._lastLoadedSectionId,"config.id:",this.config.id),this._lastLoadedSectionId&&this._lastLoadedSectionId!==this.config.id&&(console.log("[List Table] Section changed! Resetting state..."),this.items=[],this.searchQuery="",this.sortColumn="",this.sortDirection="asc",this.currentStatus=this.config.table_config.statuses?.default_status||"all",this.currentFilters={},this.selectedItems=[],this.config.table_config.filters&&this.config.table_config.filters.forEach(s=>{this.currentFilters[s.id]=""})),this._lastLoadedSectionId=this.config.id,this.isLoading=!0,this.items=[];const t=await this.do_ajax(this.config.table_config.ajax_action_get);console.log("[List Table] load_items() result:",t),t&&t.success&&(t.data&&t.data.counts&&this.update_counts(t.data.counts),t.data&&t.data.items!==void 0?this.items=t.data.items||[]:this.items=t.data||[]),this.isLoading=!1},open_modal(t=null){t?(this.isEditing=!0,this.editingItem=JSON.parse(JSON.stringify(t))):(this.isEditing=!1,this.editingItem={},this.config.modal_config.fields.forEach(s=>{s.default!==void 0?this.editingItem[s.id]=s.default:s.type==="select"&&s.options&&Object.keys(s.options).length>0&&(this.editingItem[s.id]=Object.keys(s.options)[0])})),this.modalInstance.show()},async save_item(){for(const n of this.config.modal_config.fields)if(this.should_show_field(n,this.editingItem)&&n.extra_attributes?.required){const o=this.editingItem[n.id];if(!o||String(o).trim()===""){_(this,`The "${n.label||n.id}" field is required.`,"error");return}}const t=this.isEditing?this.config.modal_config.ajax_action_update:this.config.modal_config.ajax_action_create,s=this.config.modal_config.fields.some(n=>n.type==="file"||n.type==="image");let i;s?i=await this.do_ajax_with_files(t,this.editingItem):i=await this.do_ajax(t,this.editingItem),i&&i.success&&(this.modalInstance.hide(),!this.isEditing&&this.config.post_create_view?(this.postCreateItem=i.data,this.change_view("post_create")):this.load_items())},async delete_item(t){if(await window.aui_confirm("Are you sure you want to delete this item? This cannot be undone.","Delete","Cancel",!0,!0)){const i=await this.do_ajax(this.config.modal_config.ajax_action_delete,{id:t});i&&i.success&&(_(this,i.data?.message||"Item deleted successfully.","success"),this.load_items())}},change_view(t){this.view=t,t==="list"&&this.load_items()},render_field(t,s){return E(t,s)},should_show_field(t,s){return L(s,t)}}}function ke(e){const t={},s={};return e?.widgets?.forEach(i=>{i.ajax_action&&(t[i.id]={},s[i.id]=!0)}),{config:e,widgetData:t,isLoading:s,init(){this.config?.widgets?.forEach(i=>{i.ajax_action&&this.fetch_widget_data(i.id,i.ajax_action,i.params||{})})},async fetch_widget_data(i,n,o={}){try{const a=window?.ayecodeSettingsFramework?.ajax_url,r=window?.ayecodeSettingsFramework?.tool_ajax_action,c=window?.ayecodeSettingsFramework?.tool_nonce;if(!a||!r||!c){this._set_widget_data(i,{error:"Missing AJAX configuration."});return}const d=await(await fetch(a,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:r,nonce:c,tool_action:n,params:JSON.stringify(o)})})).json();d?.success?this._set_widget_data(i,d.data||{}):this._set_widget_data(i,{error:d?.data?.message||"Failed to load."})}catch{this._set_widget_data(i,{error:"A network error occurred."})}finally{this.isLoading[i]=!1}},_set_widget_data(i,n){this.widgetData={...this.widgetData,[i]:n}}}}function xe(e){return{config:e,isLoading:!0,extensions:[],searchQuery:"",priceFilter:"all",itemActionInProgress:{},isConnecting:!1,connectModal:null,purchaseModal:null,init(){this.$refs.connectModal&&(this.connectModal=new bootstrap.Modal(this.$refs.connectModal)),this.$refs.purchaseModal&&(this.purchaseModal=new bootstrap.Modal(this.$refs.purchaseModal)),this.fetchExtensions()},update_config(t){t&&t.id!==this.config.id&&(this.config=t,this.fetchExtensions())},async connect_site(){this.isConnecting=!0,this.purchaseModal?.hide(),this.connectModal?.show();try{const t=await this.do_ajax("connect_site");if(t.success){if(t.data.already_connected){_(this,t.data.message,"success"),this.connectModal?.hide(),this.isConnecting=!1;return}const s=await this.do_ajax("get_connect_url");s.success&&s.data.redirect_url?window.location.href=s.data.redirect_url:this.connectModal?.hide()}else this.connectModal?.hide()}catch{this.connectModal?.hide()}finally{this.isConnecting=!1}},async fetchExtensions(){if(this.isLoading=!0,this.extensions=[],this.config.source==="static"){this.extensions=(this.config.static_items||[]).map(t=>({...t,type:t.type||this.config.api_config?.item_type||"plugin"})),this.isLoading=!1;return}try{const s=await(await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({action:window.ayecodeSettingsFramework.tool_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,tool_action:"get_extension_data",data:JSON.stringify(this.config.api_config||{})})})).json();s.success?this.extensions=(s.data.items||[]).map(i=>({...i,type:i.type||this.config.api_config?.item_type||"plugin"})):console.error(s.data?.message||"Failed to fetch extensions.")}catch(t){console.error("An error occurred while fetching extensions.",t)}finally{this.isLoading=!1}},get filteredItems(){let t=this.extensions;if(this.priceFilter!=="all"&&(t=t.filter(s=>{const i=s.info.price===0||s.info.price==="0.00";return this.priceFilter==="free"?i:!i})),this.searchQuery.trim()!==""){const s=this.searchQuery.toLowerCase().trim();t=t.filter(i=>i.info.title.toLowerCase().includes(s)||i.info.excerpt&&i.info.excerpt.toLowerCase().includes(s))}return t},get_price_text(t){if(t.info.price===0||t.info.price==="0.00")return"Free";let s=`$${parseFloat(t.info.price).toFixed(2)}`;return t.info.is_subscription&&(s+='<span class="text-sm font-normal text-gray-500"> / year</span>'),s},show_more_info(t){if(t.info.source==="wp.org"){const s=`/wp-admin/plugin-install.php?tab=plugin-information&plugin=${t.info.slug}&TB_iframe=true&width=772&height=551`;typeof aui_modal_iframe=="function"?aui_modal_iframe(t.info.title,s,"",!0,"aui-install-modal","modal-xl"):(console.error("aui_modal_iframe function not found."),window.open(s,"_blank"))}else typeof aui_modal_iframe=="function"?aui_modal_iframe(t.info.title,t.info.link,"",!0,"aui-install-modal","modal-xl"):(console.error("aui_modal_iframe function not found."),window.open(t.info.link,"_blank"))},handle_toggle(t,s){const i=s.target.checked;if(t.type==="theme"&&t.status==="active"&&!i){s.target.checked=!0,_(this,"To switch themes, please activate another one.","info");return}this.itemActionInProgress[t.info.slug]||(this.itemActionInProgress={...this.itemActionInProgress,[t.info.slug]:!0},i?t.status==="not_installed"?this.do_ajax("install_and_activate_item",t).then(n=>{n.success?(_(this,n.data?.message||`${t.info.title} installed & activated!`,"success"),t.type==="theme"?this.extensions=this.extensions.map(o=>o.info.slug===t.info.slug?{...o,status:"active"}:o.type==="theme"&&o.status==="active"?{...o,status:"installed"}:o):t.status="active"):(s.target.checked=!1,n.data?.guidance_needed&&this.show_purchase_modal(t)),this.itemActionInProgress={...this.itemActionInProgress,[t.info.slug]:!1}}):t.status==="installed"?this.do_ajax("activate_item",t).then(n=>{n.success?(_(this,n.data?.message||`${t.info.title} activated!`,"success"),t.type==="theme"?this.extensions=this.extensions.map(o=>o.info.slug===t.info.slug?{...o,status:"active"}:o.type==="theme"&&o.status==="active"?{...o,status:"installed"}:o):(t.status="active",_(this,n.data?.message||`${t.info.title} activated!`,"success"))):s.target.checked=!1,this.itemActionInProgress={...this.itemActionInProgress,[t.info.slug]:!1}}):this.itemActionInProgress={...this.itemActionInProgress,[t.info.slug]:!1}:t.type==="plugin"?this.do_ajax("deactivate_item",t).then(n=>{n.success?(t.status="installed",_(this,n.data?.message||`${t.info.title} deactivated.`,"success")):s.target.checked=!0,this.itemActionInProgress={...this.itemActionInProgress,[t.info.slug]:!1}}):this.itemActionInProgress={...this.itemActionInProgress,[t.info.slug]:!1})},show_purchase_modal(t){this.purchaseModal?.show()},async do_ajax(t,s){let i={action:window.ayecodeSettingsFramework.tool_ajax_action,nonce:window.ayecodeSettingsFramework.tool_nonce,tool_action:t,item_data:JSON.stringify(s)};try{const o=await(await fetch(window.ayecodeSettingsFramework.ajax_url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(i)})).json();return!o.success&&!o.data?.guidance_needed&&_(this,o.data?.message||"An unexpected error occurred. Please try again.","error"),o}catch{return _(this,"A network error occurred. Please check your connection and try again.","error"),{success:!1,data:{message:"Network error."}}}}}}function J(e){return e?{config:e||{},steps:[],currentStepIndex:0,wizardData:{},isConnected:!1,isMemberActive:!1,isPaidUser:!1,isConnecting:!1,isRefreshing:!1,strings:{},wizardConfig:{},theme:"light",init(){console.log("Setup Wizard Component Initialized",this.config);const t=localStorage.getItem("asf_theme"),s=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;this.theme=t||(s?"dark":"light"),this.$watch("theme",i=>localStorage.setItem("asf_theme",i)),this.steps=this.config.steps||[],this.strings=this.config.strings||{},this.wizardConfig=this.config.wizard_config||{},this.isConnected=this.config.is_connected||!1,this.isMemberActive=this.config.is_member_active||!1,this.isPaidUser=this.isConnected&&this.isMemberActive,this.wizardData.user_membership_status=this.isPaidUser?"paid":"free",this.wizardData.is_connected=this.isConnected,this.wizardData.is_member_active=this.isMemberActive,console.log("Membership Status Initialized:",{isConnected:this.isConnected,isMemberActive:this.isMemberActive,isPaidUser:this.isPaidUser,user_membership_status:this.wizardData.user_membership_status,is_connected_in_wizardData:this.wizardData.is_connected,is_member_active_in_wizardData:this.wizardData.is_member_active}),this.steps.forEach(i=>{i.fields&&Array.isArray(i.fields)&&i.fields.forEach(n=>{n.id&&(n.default!==void 0?this.wizardData[n.id]=n.default:n.type==="checkbox_group"||n.type==="checkbox_card_group"||n.type==="multiselect"?this.wizardData[n.id]=[]:n.type==="toggle"||n.type==="checkbox"?this.wizardData[n.id]=!1:n.type==="number"?this.wizardData[n.id]=0:this.wizardData[n.id]="")})}),console.log("Wizard Data Initialized:",this.wizardData)},get currentStep(){return this.steps[this.currentStepIndex]||null},nextStep(){this.currentStepIndex<this.steps.length-1&&(this.currentStepIndex++,this.scrollToTop())},prevStep(){this.currentStepIndex>0&&(this.currentStepIndex--,this.scrollToTop())},goToStep(t){t>=0&&t<this.steps.length&&(this.currentStepIndex=t,this.scrollToTop())},scrollToTop(){const t=document.querySelector(".wizard-content");t&&(t.scrollTop=0)},toggleTheme(){this.theme=this.theme==="light"?"dark":"light"},continueFree(){this.isPaidUser=!1,this.nextStep()},async connectSite(){this.isConnecting=!0;try{const t=new FormData;t.append("action",this.config.tool_ajax_action||"asf_tool_action_"+this.config.page_slug),t.append("tool_action","connect_site"),t.append("nonce",this.config.tool_nonce||"");const i=await(await fetch(this.config.ajax_url||window.ajaxurl,{method:"POST",body:t})).json();i.success?i.data.already_connected?(this.isConnected=!0,this.isMemberActive=!0,this.isPaidUser=!0,this.wizardData.is_connected=!0,this.wizardData.is_member_active=!0,this.wizardData.user_membership_status="paid",this.showNotification(i.data.message||this.strings.already_connected||"Site is already connected!","success"),setTimeout(()=>this.nextStep(),1500)):i.data.redirect_url?window.location.href=i.data.redirect_url:await this.getConnectUrl():this.showNotification(i.data?.message||this.strings.connection_failed||"Connection failed","error")}catch(t){console.error("Connect site error:",t),this.showNotification(this.strings.connection_failed||"Connection failed. Please try again.","error")}finally{this.isConnecting=!1}},async getConnectUrl(){try{const t=new FormData;t.append("action",this.config.tool_ajax_action||"asf_tool_action_"+this.config.page_slug),t.append("tool_action","get_connect_url"),t.append("nonce",this.config.tool_nonce||"");const i=await(await fetch(this.config.ajax_url||window.ajaxurl,{method:"POST",body:t})).json();i.success&&i.data.redirect_url?window.location.href=i.data.redirect_url:this.showNotification(i.data?.message||"Could not get connect URL","error")}catch(t){console.error("Get connect URL error:",t),this.showNotification("Failed to get connect URL","error")}},async refreshMembershipStatus(){this.isRefreshing=!0;try{const t=new FormData;t.append("action",this.config.tool_ajax_action||"asf_tool_action_"+this.config.page_slug),t.append("tool_action","refresh_membership_status"),t.append("nonce",this.config.tool_nonce||"");const i=await(await fetch(this.config.ajax_url||window.ajaxurl,{method:"POST",body:t})).json();i.success?(this.isMemberActive=i.data.is_member_active||!1,this.isPaidUser=this.isConnected&&this.isMemberActive,this.wizardData.user_membership_status=this.isPaidUser?"paid":"free",this.wizardData.is_member_active=this.isMemberActive,this.showNotification(i.data.message||this.strings.membership_refreshed||"Status refreshed!","success"),this.isMemberActive&&setTimeout(()=>this.nextStep(),1500)):this.showNotification(i.data?.message||"Failed to refresh status","error")}catch(t){console.error("Refresh membership status error:",t),this.showNotification("Failed to refresh status. Please try again.","error")}finally{this.isRefreshing=!1}},async completeWizard(){console.log("Wizard Completed with data:",this.wizardData);const t=this.steps.findIndex(s=>s.template==="complete"||s.id==="complete");t!==-1?this.goToStep(t):this.currentStepIndex=this.steps.length-1},goToDashboard(){const t=this.wizardConfig.dashboard_url||window.location.origin+"/wp-admin/";window.location.href=t},renderField(t){if(!t||!t.type)return'<div class="alert alert-warning">Invalid field configuration</div>';if(typeof window.asfFieldRenderer<"u"&&typeof window.asfFieldRenderer.renderField=="function")try{let s=window.asfFieldRenderer.renderField(t,"wizardData");return s=s.replace(/settings\./g,"wizardData."),s}catch(s){return console.error("Error rendering field:",t.type,s),`<div class="alert alert-danger">Error rendering field: ${t.type}</div>`}return`<div class="alert alert-info">Renderer not available for field type: ${t.type}</div>`},shouldShowField(t){if(!t.show_if)return!0;if(typeof window.asfFieldRenderer<"u"&&typeof window.asfFieldRenderer.evaluateConditions=="function"){const n=window.asfFieldRenderer.evaluateConditions(t.show_if,this.wizardData);return(t.id==="premium_templates"||t.id==="advanced_seo"||t.id==="upgrade_prompt")&&console.log("Field visibility check:",{fieldId:t.id,show_if:t.show_if,wizardData:{user_membership_status:this.wizardData.user_membership_status,is_connected:this.wizardData.is_connected,is_member_active:this.wizardData.is_member_active},result:n}),n}const i=(Array.isArray(t.show_if)?t.show_if:[t.show_if]).every(n=>{const o=this.wizardData[n.field],a=n.value;switch(n.comparison||"==="){case"===":return o===a;case"!==":return o!==a;case">":return o>a;case"<":return o<a;case">=":return o>=a;case"<=":return o<=a;case"includes":return Array.isArray(o)&&o.includes(a);case"!includes":return Array.isArray(o)&&!o.includes(a);default:return!0}});return(t.id==="premium_templates"||t.id==="advanced_seo"||t.id==="upgrade_prompt")&&console.log("Field visibility check (fallback):",{fieldId:t.id,show_if:t.show_if,wizardData:{user_membership_status:this.wizardData.user_membership_status,is_connected:this.wizardData.is_connected,is_member_active:this.wizardData.is_member_active},result:i}),i},showNotification(t,s="info"){typeof window.aui_toast=="function"?window.aui_toast("wizard-notification",s,t):typeof window.aui_alert=="function"?window.aui_alert(t,s==="error"?"danger":s,5):alert(t)}}:(console.error("Setup Wizard: No framework config provided"),{})}const P=new Map;let k=typeof window<"u"?window.asfFieldRenderer:void 0;function g(e,t){P.set(e,t)}function Le(e,t="settings"){if(!e||!e.type)return'<div class="alert alert-warning">Invalid field configuration</div>';const s=P.get(e.type);if(typeof s=="function")try{return s(e,t)}catch(n){return console.error(`Renderer for type "${e.type}" threw:`,n),`<div class="alert alert-danger">Error rendering field type: ${e.type}</div>`}const i=window.__asfFieldRendererLegacy||k;return i&&typeof i.renderField=="function"?i.renderField(e,t):`<div class="alert alert-info">Unsupported field type: ${e.type}</div>`}const H=e=>"render"+e.charAt(0).toUpperCase()+e.slice(1)+"Field";function h(e,t,s="settings"){const i=P.get(e);if(typeof i=="function")try{return i(t,s)}catch(o){console.error(`Renderer "${e}" error:`,o)}const n=window.__asfFieldRendererLegacy||k;return n&&typeof n[H(e)]=="function"?n[H(e)](t,s):n&&typeof n.renderField=="function"?n.renderField(t,s):`<div class="alert alert-info">Unsupported field type: ${e}</div>`}const Ae=(e,t)=>h("text",e,t),je=(e,t)=>h("email",e,t),Te=(e,t)=>h("url",e,t),Pe=(e,t)=>h("alert",e,t),Ie=(e,t)=>h("password",e,t),Oe=(e,t)=>h("google_api_key",e,t),Ne=(e,t)=>h("number",e,t),De=(e,t)=>h("textarea",e,t),Ee=(e,t)=>h("toggle",e,t),Me=(e,t)=>h("select",e,t),Re=(e,t)=>h("color",e,t),ze=(e,t)=>h("range",e,t),Ue=(e,t)=>h("checkbox",e,t),Je=(e,t)=>h("radio",e,t),He=(e,t)=>h("radio_group",e,t),Ve=(e,t)=>h("radio_card_group",e,t),qe=(e,t)=>h("multiselect",e,t),Be=(e,t)=>h("checkbox_group",e,t),We=(e,t)=>h("checkbox_card_group",e,t),Ge=(e,t)=>h("group",e,t),Qe=(e,t)=>h("image",e,t),Ke=(e,t)=>h("hidden",e,t),Ye=(e,t)=>h("file",e,t),Ze=(e,t)=>h("slug",e,t),Xe=(e,t)=>h("font-awesome",e,t),et=(e,t)=>h("gd_map",e,t),tt=(e,t)=>h("helper_tags",e,t),st=(e,t)=>h("action_button",e,t),it=(e,t)=>h("link_button",e,t),nt=(e,t)=>h("custom_renderer",e,t);(function(){typeof window>"u"||(k&&(window.__asfFieldRendererLegacy=k),window.asfFieldRenderer={renderField:Le,renderTextField:Ae,renderEmailField:je,renderUrlField:Te,renderAlertField:Pe,renderPasswordField:Ie,renderGoogleApiKeyField:Oe,renderNumberField:Ne,renderTextareaField:De,renderToggleField:Ee,renderSelectField:Me,renderColorField:Re,renderRangeField:ze,renderCheckboxField:Ue,renderRadioField:Je,renderRadioGroupField:He,renderRadioCardGroupField:Ve,renderMultiselectField:qe,renderCheckboxGroupField:Be,renderCheckboxCardGroupField:We,renderGroupField:Ge,renderImageField:Qe,renderHiddenField:Ke,renderFileField:Ye,renderSlugField:Ze,renderIconField:Xe,renderGdMapField:et,renderHelperTagsField:tt,renderActionButtonField:st,renderLinkButtonField:it,renderCustomField:nt,__registerRenderer:g})})();function ot(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function V(e){return String(e).replace(/"/g,"&quot;")}function w(e){if(!e?.extra_attributes||typeof e.extra_attributes!="object")return"";const t=[];for(const[s,i]of Object.entries(e.extra_attributes)){const n=s.replace(/[^a-zA-Z0-9-]/g,"");n&&(i===!0?t.push(n):t.push(`${n}="${ot(i)}"`))}return t.join(" ")}g("hidden",e=>{const t=w(e);return`<input type="hidden" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" ${t}>`}),g("alert",e=>`
    <div class="alert alert-${e.alert_type||"info"} mb-0">
      ${e.label?`<h6 class="alert-heading">${e.label}</h6>`:""}
      ${e.description||""}
    </div>
  `);function m(e){return e?.custom_desc?`<div class="form-text mt-2">${e.custom_desc}</div>`:""}g("text",x),g("email",x),g("url",x),g("slug",x);function x(e,t="settings"){const s=e.class||"",i=w(e),n=V(e.placeholder||"");let o="";if(e.active_placeholder&&e.placeholder){const u=JSON.stringify(e.placeholder);o=`
      @focus='if (!${t}.${e.id}) { ${t}.${e.id} = ${u}; }'
      @blur='if (${t}.${e.id} === ${u}) { ${t}.${e.id} = ""; }'
    `}let a="";e.type==="slug"&&(a=`@input="${t}['${e.id}'] = $event.target.value.toLowerCase().replace(/[^-a-z0-9]/g, '-').replace(/-+/g, '-')"`);const c=`<input type="${e.type==="slug"?"text":e.type||"text"}" class="form-control ${s}" id="${e.id}" name="${e.id}" x-model="${t}['${e.id}']" placeholder="${n}" ${i} ${o} ${a} @focus="handleFocusSync('${e.id}')">`,l=e.input_group_right?`<div class="input-group">${c}${e.input_group_right}</div>`:c,d=m(e);return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        ${l}
        ${d}
      </div>
    </div>
  `}g("password",e=>{const t=e.class||"",s=w(e),i=m(e),n=`<input type="password" autocomplete="new-password" class="form-control ${t}" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" placeholder="${e.placeholder||""}" ${s}>`,o=e.input_group_right?`<div class="input-group">${n}${e.input_group_right}</div>`:n;return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        ${o}
        ${i}
      </div>
    </div>
  `}),g("number",e=>{const t=e.min!==void 0?`min="${e.min}"`:"",s=e.max!==void 0?`max="${e.max}"`:"",i=e.step!==void 0?`step="${e.step}"`:"",n=e.class||"",o=w(e),a=m(e),r=`<input type="number" class="form-control ${n}" id="${e.id}" name="${e.id}" x-model.number="settings.${e.id}" ${t} ${s} ${i} placeholder="${e.placeholder||""}" ${o}>`,c=e.input_group_right?`<div class="input-group">${r}${e.input_group_right}</div>`:r;return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        ${c}
        ${a}
      </div>
    </div>
  `}),g("textarea",e=>{const t=e.rows||5,s=e.class||"",i=w(e),n=V(e.placeholder||""),o=m(e);let a="";if(e.active_placeholder&&e.placeholder){const r=JSON.stringify(e.placeholder);a=`
      @focus='if (!settings.${e.id}) { settings.${e.id} = ${r}; }'
      @blur='if (settings.${e.id} === ${r}) { settings.${e.id} = ""; }'
    `}return`
    <div class="row">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <textarea class="form-control ${s}" id="${e.id}" name="${e.id}" rows="${t}" x-model="settings.${e.id}" placeholder="${n}" ${i} ${a}></textarea>
        ${o}
      </div>
    </div>
  `}),g("toggle",(e,t="settings")=>{const s=w(e),i=m(e),o=`${`${t}.${e.id}`} = $event.target.checked ? 1 : 0;`;return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <div class="form-check form-switch">
          <input 
            x-model="settings.${e.id}" 
            :checked="settings.${e.id} == '1' || settings.${e.id} === true"
            class="form-check-input" 
            type="checkbox" 
            role="switch" 
            id="${e.id}" 
            name="${e.id}"
            @change="${o}"
            ${s}
          >
        </div>
        ${i}
      </div>
    </div>
  `}),g("select",e=>{let t="";if(e.placeholder&&(t+='<option value=""></option>'),e.options)for(const[r,c]of Object.entries(e.options))if(typeof c=="object"&&c!==null){t+=`<optgroup label="${r}">`;for(const[l,d]of Object.entries(c))t+=`<option value="${l}">${d}</option>`;t+="</optgroup>"}else t+=`<option value="${r}">${c}</option>`;const s=e.placeholder?`data-placeholder="${e.placeholder}"`:"",i=e.class||"",n=w(e),o=m(e),a=e.class&&e.class.includes("aui-select2")?`x-ref="${e.id}" x-init="initChoice('${e.id}')"`:`x-model="settings.${e.id}"`;return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <select 
          class="form-select w-100 mw-100 ${i}" 
          id="${e.id}" 
          name="${e.id}"
          ${a}
          ${s}
          ${n}
        >${t}</select>
        ${o}
      </div>
    </div>
  `}),g("range",e=>{const t=e.min||0,s=e.max||100,i=e.step||1,n=w(e),o=m(e);return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <div class="d-flex align-items-center">
          <input type="range" class="form-range" id="${e.id}" name="${e.id}" min="${t}" max="${s}" step="${i}" x-model.number="settings.${e.id}" ${n}>
          <span class="badge bg-secondary ms-3" x-text="settings.${e.id}"></span>
        </div>
        ${o}
      </div>
    </div>
  `}),g("checkbox",e=>{const t=w(e),s=m(e);return`
    <div class="row">
      <div class="col-md-4">
        <label class="form-label fw-bold mb-0">${e.label||e.id}</label>
      </div>
      <div class="col-md-8">
        <div class="form-check">
          <input 
            class="form-check-input" 
            type="checkbox" id="${e.id}" 
            name="${e.id}"
            x-model="settings.${e.id}" 
            :checked="settings.${e.id} == '1' || settings.${e.id} === true"
            ${t}
          >
          <label class="form-check-label" for="${e.id}">${e.description||""}</label>
        </div>
        ${s}
      </div>
    </div>
  `}),g("radio",e=>{let t="";const s=w(e);if(e.options)for(const[n,o]of Object.entries(e.options))t+=`
        <div class="form-check">
          <input class="form-check-input" type="radio" name="${e.id}" id="${e.id}_${n}" value="${n}" x-model="settings.${e.id}" ${s}>
          <label class="form-check-label" for="${e.id}_${n}">${o}</label>
        </div>
      `;const i=m(e);return`
    <div class="row">
      <div class="col-md-4">
        <label class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        ${t}
        ${i}
      </div>
    </div>
  `}),g("radio_group",(e,t="settings")=>{let s="";const i=w(e),n=e.button_style||"outline-primary",o=e.button_size||"";if(e.options)for(const[r,c]of Object.entries(e.options))s+=`
                <input type="radio" class="btn-check" name="${e.id}" id="${e.id}_${r}" value="${r}" x-model="${t}['${e.id}']" ${i} autocomplete="off">
                <label class="btn btn-${n}" :class="{'active': ${t}['${e.id}'] === '${r}'}" for="${e.id}_${r}">${c}</label>
            `;const a=m(e);return`
    <div class="row align-items-center">
      <div class="col-md-4">
        <label class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <div class="btn-group ${o}" role="group" aria-label="${e.label||e.id}">
          ${s}
        </div>
        ${a}
      </div>
    </div>
  `}),g("radio_card_group",(e,t="settings")=>{const s=w(e);let i="";if(e.options)for(const[o,a]of Object.entries(e.options)){const r=typeof a=="object"&&a!==null,c=r?a.label:a,l=r?a.icon:null,d=r?a.icon_color:null,u=r?a.image:null,p=r?a.html:null,f=r?a.description:null;let b="";if(p)b=`<div class="card-img-top d-flex align-items-center justify-content-center p-3">${p}</div>`;else if(u)b=`<img src="${u}" class="card-img-top" alt="${c}" style="height: 120px; object-fit: cover;">`;else if(l){const ct=d?`style="color: ${d};"`:"";b=`<div class="card-img-top d-flex align-items-center justify-content-center pt-3 pb-0 fs-3"><i class="${l}" ${ct}></i></div>`}i+=`
                <div class="col">
                    <input
                        type="radio"
                        class="btn-check d-none"
                        id="${e.id}_${o}"
                        name="${e.id}"
                        value="${o}"
                        x-model="${t}['${e.id}']"
                        ${s}
                        autocomplete="off">
                    <label
                        class="card px-0 pb-3 mt-0 h-100 cursor-pointer border-2 asf-radio-card cursor-pointer hover-shadow"
                        for="${e.id}_${o}"
                        style="transition: all 0.2s ease;">
                        ${b}
                        <div class="card-body p-1 text-center">
                            <h6 class="card-title fw-bold mb-1">${c}</h6>
                            ${f?`<p class="card-text text-muted small mb-0">${f}</p>`:""}
                        </div>

                    </label>
                </div>
            `}const n=m(e);return`
    <div class="row mb-4">
      <div class="col-12">
        <label class="form-label fw-bold mb-2">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-3">${e.description}</p>`:""}
      </div>
      <div class="col-12">
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4x g-3">
          ${i}
        </div>
        ${n}
      </div>
    </div>
    <style>
      .asf-radio-card {
        transition: all 0.2s ease;
      }
      .btn-check:checked + .asf-radio-card {
        border-color: var(--bs-primary) !important;
        background-color: var(--bs-primary-bg-subtle);
      }
    </style>
  `}),g("multiselect",e=>{const t=e.placeholder?`data-placeholder="${e.placeholder}"`:"",s=e.class||"",i=w(e),n=m(e);let o="";if(e.options)for(const[a,r]of Object.entries(e.options))if(typeof r=="object"&&r!==null){o+=`<optgroup label="${a}">`;for(const[c,l]of Object.entries(r))o+=`<option value="${c}">${l}</option>`;o+="</optgroup>"}else o+=`<option value="${a}">${r}</option>`;return`
    <div class="row">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <select 
          class="form-select w-100 mw-100 ${s}" 
          id="${e.id}" 
          name="${e.id}"
          multiple 
          x-ref="${e.id}"
          x-init="initChoices('${e.id}')"
          ${t}
          ${i}
        >${o}</select>
        ${n}
      </div>
    </div>
  `}),g("checkbox_group",e=>{let t="";const s=w(e);if(e.options)for(const[n,o]of Object.entries(e.options))t+=`
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="${n}" id="${e.id}_${n}" name="${e.id}" x-model="settings.${e.id}" ${s}>
          <label class="form-check-label" for="${e.id}_${n}">${o}</label>
        </div>
      `;const i=m(e);return`
    <div class="row">
      <div class="col-md-4">
        <label class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        ${t}
        ${i}
      </div>
    </div>
  `}),g("checkbox_card_group",e=>{const t=w(e);let s="";if(e.options)for(const[n,o]of Object.entries(e.options)){const a=typeof o=="object"&&o!==null,r=a?o.label:o,c=a?o.icon:null,l=a?o.icon_color:null,d=a?o.image:null,u=a?o.html:null,p=a?o.description:null;let f="";if(u)f=`<div class="card-img-top d-flex align-items-center justify-content-center p-3">${u}</div>`;else if(d)f=`<img src="${d}" class="card-img-top" alt="${r}" style="height: 120px; object-fit: cover;">`;else if(c){const b=l?`style="color: ${l};"`:"";f=`<div class="card-img-top d-flex align-items-center justify-content-center pt-3 pb-0 fs-3"><i class="${c}" ${b}></i></div>`}s+=`
                <div class="col">
                    <input
                        type="checkbox"
                        class="btn-check d-none"
                        id="${e.id}_${n}"
                        name="${e.id}"
                        value="${n}"
                        x-model="settings.${e.id}"
                        ${t}
                        autocomplete="off">
                    <label
                        class="card px-0 pb-3 mt-0 h-100 cursor-pointer border-2 asf-checkbox-card cursor-pointer hover-shadow "
                        for="${e.id}_${n}"
                        style="transition: all 0.2s ease;">
                        ${f}
                        <div class="card-body p-1 text-center">
                            <h6 class="card-title fw-bold mb-1">${r}</h6>
                            ${p?`<p class="card-text text-muted small mb-0">${p}</p>`:""}
                        </div>
                     
                    </label>
                </div>
            `}const i=m(e);return`
    <div class="row mb-4">
      <div class="col-12">
        <label class="form-label fw-bold mb-2">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-3">${e.description}</p>`:""}
      </div>
      <div class="col-12">
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4x g-3">
          ${s}
        </div>
        ${i}
      </div>
    </div>
    <style>
      .asf-checkbox-card {
        transition: all 0.2s ease;
      }   
      .btn-check:checked + .asf-checkbox-card {
        border-color: var(--bs-primary) !important;
        background-color: var(--bs-primary-bg-subtle);
      }
    </style>
  `}),g("group",e=>{let t="";return e.fields&&e.fields.forEach(s=>{const i=JSON.stringify(s).replace(/"/g,"&quot;");t+=`
        <div :class="${i}.type === 'hidden' ? '' : 'py-4'" 
             x-show="shouldShowField(${i})" 
             x-transition 
             x-cloak>
          ${window.asfFieldRenderer.renderField(s)}
        </div>
      `}),`
    <div class="card mb-4 w-100 mw-100 p-0">
      <div class="card-header bg-light-subtle">
        <h6 class="fw-bold mb-0">${e.label||""}</h6>
        ${e.description?`<p class="text-muted small mb-0 mt-1">${e.description}</p>`:""}
      </div>
      <div class="card-body">
        ${t}
      </div>
    </div>
  `}),g("accordion",e=>{if(!e.fields||!Array.isArray(e.fields))return'<div class="alert alert-warning">Accordion field requires a "fields" array.</div>';const t=`accordion-${e.id}`;let s=`<div class="accordion" id="${t}" x-data="{ isChoicesOpen: false }">`;return e.fields.forEach(i=>{if(!i.id||!i.fields||!Array.isArray(i.fields))return;const n=i.id,o=`heading-${n}`,a=`collapse-${n}`,r=e.default_open===n;s+=`
        <div class="accordion-item">
            <h2 class="accordion-header" id="${o}">
                <button
                    class="accordion-button ${r?"":"collapsed"}"
                    type="button"
                    :data-bs-toggle="isChoicesOpen ? '' : 'collapse'"
                    data-bs-target="#${a}"
                    aria-expanded="${r}"
                    aria-controls="${a}"
                >
                    ${i.label||"Panel"}
                </button>
            </h2>
            <div
                id="${a}"
                class="accordion-collapse collapse ${r?"show":""}"
                aria-labelledby="${o}"
                data-bs-parent="#${t}"
            >
                <div class="accordion-body" @mousedown.stop @click.stop @keydown.stop>
        `,i.fields.forEach(c=>{const l=JSON.stringify(c).replace(/"/g,"&quot;");s+=`
                <div :class="${l}.type === 'hidden' ? '' : 'py-4'" 
                     x-show="shouldShowField(${l})" 
                     x-transition 
                     x-cloak>
                    ${window.asfFieldRenderer.renderField(c)}
                </div>
            `}),s+=`
                </div>
            </div>
        </div>`}),s+="</div>",s}),g("image",e=>{const t=m(e);return`
    <div class="row">
      <div class="col-md-4">
        <label class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <div class="asf-image-uploader">
          <div class="asf-image-preview mb-2 border rounded d-flex justify-content-center align-items-center bg-light" style="width: 150px; height: 150px;">
            <template x-if="settings.${e.id} && imagePreviews[field.id]">
              <img :src="imagePreviews[field.id]" style="max-width: 100%; max-height: 100%; object-fit: cover;" alt="Preview" x-cloak>
            </template>
            <template x-if="!settings.${e.id} || !imagePreviews[field.id]">
              <i class="fa-solid fa-image fa-2x text-muted" x-cloak></i>
            </template>
          </div>
          <div>
            <button type="button" class="btn btn-sm btn-secondary" @click.prevent="selectImage('${e.id}')">
              <i class="fa-solid fa-pen-to-square me-1"></i> Select Image
            </button>
            <button type="button" class="btn btn-sm btn-danger ms-2" @click.prevent="removeImage('${e.id}')" x-show="settings.${e.id}" x-cloak>
              <i class="fa-solid fa-trash-can me-1"></i> Remove
            </button>
          </div>
        </div>
        ${t}
      </div>
    </div>
  `}),g("color",e=>{const t=w(e),s=m(e),i=e.default?`
    <button 
      type="button" 
      class="btn btn-outline-secondary ms-2" 
      title="Reset to default"
      x-cloak
      x-show="settings.${e.id} && settings.${e.id}.toLowerCase() !== '${e.default}'.toLowerCase()"
      @click="settings.${e.id} = '${e.default}'"
      data-bs-toggle="tooltip"
    >
      <i class="fa-solid fa-rotate-left"></i>
    </button>
  `:"";return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <div class="d-flex align-items-center">
          <input type="color" class="form-control form-control-color me-2" id="${e.id}-color" x-model="settings.${e.id}">
          <input 
            type="text" 
            class="form-control" 
            id="${e.id}" 
            name="${e.id}"
            x-model="settings.${e.id}" 
            style="max-width: 120px;" 
            pattern="^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$" 
            ${t}
          >
          ${i}
        </div>
        ${s}
      </div>
    </div>
  `}),g("font-awesome",e=>{const t=e.class||"",s=w(e),i=m(e),n=e.input_group_right||"";return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <div class="input-group">
          <input data-aui-init="iconpicker" type="text" class="form-control ${t}" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" placeholder="${e.placeholder||""}" ${s}>
          ${n}
          <span class="input-group-addon input-group-text top-0 end-0 c-pointer"><i class="fas fa-icons"></i></span>
        </div>
        ${i}
      </div>
    </div>
  `}),g("action_button",e=>{const t=m(e),s=`actionStates['${e.id}']`;if(e.toggle_config){const n=e.toggle_config.insert||{},o=e.toggle_config.remove||{};return`
      <div class="row align-items-center rounded" x-ref="action_container_${e.id}">
        <div class="col-md-4">
          <label class="form-label fw-bold mb-0">${e.label||""}</label>
          ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
        </div>
        <div class="col-md-8">
          <div class="d-flex align-items-center justify-content-end">
            <div class="me-3" x-show="${s}?.message" x-cloak>
              <span :class="${s}?.success ? 'text-success' : 'text-danger'" x-text="${s}?.message"></span>
            </div>
            <button type="button" 
                    id="${e.id}" 
                    class="btn"
                    :class="${s}?.has_dummy_data ? '${o.button_class||"btn-danger"}' : '${n.button_class||"btn-primary"}'"
                    @click="executeAction('${e.id}')" 
                    :disabled="${s}?.isLoading">
              <span x-show="${s}?.isLoading" class="spinner-border spinner-border-sm me-2" x-cloak></span>
              <span x-text="${s}?.isLoading ? strings.processing : (${s}?.has_dummy_data ? '${o.button_text}' : '${n.button_text}')"></span>
            </button>
          </div>
        </div>
        <div class="col-md-12">
          ${t}
          <div class="progress mt-2" style="height: 5px;" x-show="${s}?.progress > 0 && ${s}?.progress < 100" x-cloak>
            <div class="progress-bar" role="progressbar" :style="{ width: ${s}?.progress + '%' }"></div>
          </div>
        </div>
      </div>
    `}const i=e.button_class||"btn-secondary";return`
    <div class="row align-items-center rounded" x-ref="action_container_${e.id}">
      <div class="col-md-4">
        <label class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <div class="d-flex align-items-center justify-content-end">
          <div class="me-3" x-show="${s}?.message" x-cloak>
            <span :class="${s}?.success ? 'text-success' : 'text-danger'" x-text="${s}?.message"></span>
          </div>
          <button type="button" id="${e.id}" class="btn ${i}" @click="executeAction('${e.id}')" :disabled="${s}?.isLoading">
            <span x-show="${s}?.isLoading" class="spinner-border spinner-border-sm me-2" x-cloak></span>
            <span x-text="${s}?.isLoading ? strings.processing : '${e.button_text||"Run"}'"></span>
          </button>
        </div>
      </div>
      <div class="col-md-12">
        ${t}
        <div class="progress mt-2" style="height: 5px;" x-show="${s}?.progress > 0 && ${s}?.progress < 100" x-cloak>
          <div class="progress-bar" role="progressbar" :style="{ width: ${s}?.progress + '%' }"></div>
        </div>
      </div>
    </div>
  `}),g("link_button",e=>{const t=e.url||"#",s=e.button_text||"Click Here",i=e.button_class||"btn-secondary",n=e.target?`target="${e.target}"`:"",o=e.target==="_blank"?'rel="noopener noreferrer"':"",a=`<a href="${t}" class="btn ${i}" ${n} ${o}>${s}</a>`,r=m(e);return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8 d-flex align-items-center justify-content-end">
        ${a}
        ${r}
      </div>
    </div>
  `}),g("gd_map",e=>{if(!e.lat_field||!e.lng_field)return`<div class="alert alert-danger">Error: 'gd_map' field type requires 'lat_field' and 'lng_field' properties.</div>`;const t=`${e.id}_map_canvas`,s=w(e),i=m(e);return`
    <div x-init="initGdMap('${e.id}', '${e.lat_field}', '${e.lng_field}')">
      <div class="row">
        <div class="col-md-4">
          <label class="form-label fw-bold mb-0">${e.label||e.id}</label>
          ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
        </div>
        <div class="col-md-8">
          <div class="row g-3 mb-3">
            <div class="col">
              <label for="${e.lat_field}" class="form-label small">Latitude</label>
              <input type="text" class="form-control" id="${e.lat_field}" name="${e.lat_field}" x-model="settings.${e.lat_field}" ${s}>
            </div>
            <div class="col">
              <label for="${e.lng_field}" class="form-label small">Longitude</label>
              <input type="text" class="form-control" id="${e.lng_field}" name="${e.lng_field}" x-model="settings.${e.lng_field}" ${s}>
            </div>
          </div>
          <div id="${t}" x-ref="${e.id}_map_canvas" style="height: 350px; width: 100%;" class="border rounded bg-light"></div>
          ${i}
        </div>
      </div>
    </div>
  `}),g("helper_tags",e=>{if(!e.options||typeof e.options!="object")return'<div class="alert alert-warning">Helper tags field requires an "options" object.</div>';let t="";for(const[i,n]of Object.entries(e.options)){const o=String(n).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"),a=String(i).replace(/'/g,"\\'");t+=`
      <div class="d-inline-flex align-items-center border rounded-pill px-2 py-1 me-2 mb-2 bg-light-subtle text-body fs-xs">
        <span 
          class="c-pointer" 
          @click="navigator.clipboard.writeText('${a}'); aui_toast('aui-settings-tag-copied','success',strings.copied_to_clipboard);"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Click to copy"
        >${i}</span>
        <i 
          class="fa-solid fa-circle-question ms-2 text-muted c-pointer" 
          data-bs-toggle="tooltip" 
          data-bs-placement="top"
          title="${o}"
        ></i>
      </div>
    `}const s=e.custom_desc?`<div class="form-text mt-2">${e.custom_desc}</div>`:"";return`
    <div class="row">
      <div class="col-12">
        <label class="form-label fw-bold mb-2">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-0 mb-2">${e.description}</p>`:""}
        <div class="d-flex flex-wrap align-items-center">
          ${t}
        </div>
        ${s}
      </div>
    </div>
  `}),g("custom_renderer",e=>!e.renderer_function||typeof e.renderer_function!="string"?`<div class="alert alert-danger">Error: 'custom_renderer' field type requires a 'renderer_function' property specifying the function name.</div>`:typeof window[e.renderer_function]!="function"?`<div class="alert alert-danger">Error: The specified renderer function '${e.renderer_function}' was not found or is not a function.</div>`:window[e.renderer_function](e)),g("conditions",e=>{const t=e&&e.warning_key?String(e.warning_key):null,s=Array.isArray(e&&e.warning_fields)?e.warning_fields.slice(0):[],i=t&&/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(t)?t:null,n=i&&s.length?s.map(a=>`editingField && editingField.${i}===${JSON.stringify(a)}`).join(" || "):"",o=n.replace(/"/g,"&quot;");return`
    <div>
        ${n?`
        <div class="alert alert-warning small" x-show="${o}">
            This is a mandatory field. If hidden when submitted, it will fail.
        </div>`:""}

        <template x-for="(condition, index) in editingField.conditions" :key="index">
            <div class="row g-2 mb-2 align-items-center">
                <div class="col">
                    <select class="form-select form-select-sm" x-model="condition.action">
                        <option value="">ACTION</option>
                        <option value="show">show</option>
                        <option value="hide">hide</option>
                    </select>
                </div>
                <div class="col-auto">if</div>
                <div class="col">
                    <select
                        class="form-select form-select-sm"
                        x-model="condition.field"
                        x-effect="$nextTick(()=>($el.value!==condition.field)&&($el.value=condition.field))"
                    >
                        <option value="">FIELD</option>
                        <template x-for="otherField in otherFields" :key="otherField._uid">
                            <option :value="otherField.value" x-text="otherField.label"></option>
                        </template>
                    </select>
                </div>
                <div class="col">
                    <select class="form-select form-select-sm" x-model="condition.condition">
                        <option value="">CONDITION</option>
                        <option value="empty">empty</option>
                        <option value="not empty">not empty</option>
                        <option value="equals to">equals to</option>
                        <option value="not equals">not equals</option>
                        <option value="greater than">greater than</option>
                        <option value="less than">less than</option>
                        <option value="contains">contains</option>
                    </select>
                </div>
                <div class="col">
                    <input type="text" class="form-control form-control-sm"
                        x-model="condition.value"
                        placeholder="VALUE"
                        :disabled="condition.condition === 'empty' || condition.condition === 'not empty'">
                </div>
                <div class="col-auto">
                    <button class="btn btn-sm btn-outline-danger" @click="removeCondition(index)">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        </template>

        <button class="btn btn-sm btn-primary mt-2" @click="addCondition()">
            <i class="fa-solid fa-plus me-1"></i> Add Rule
        </button>
    </div>
    `}),g("file",e=>{const t=w(e),s=e.accept||"",i=m(e);return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        <input type="file" class="form-control p-2" id="${e.id}" name="${e.id}" accept="${s}" ${t}>
        ${i}
      </div>
    </div>
  `}),g("google_api_key",e=>{const t=e.class||"",s=w(e),i=m(e),n=`<input type="password" autocomplete="new-password" class="form-control ${t}" id="${e.id}" name="${e.id}" x-model="settings.${e.id}" @focus="$event.target.type = 'text'" @blur="$event.target.type = 'password'" placeholder="${e.placeholder||"••••••••••••••••••••••••••••"}" ${s}>`,o=e.input_group_right?`<div class="input-group">${n}${e.input_group_right}</div>`:n;return`
    <div class="row align-items-center rounded">
      <div class="col-md-4">
        <label for="${e.id}" class="form-label fw-bold mb-0">${e.label||e.id}</label>
        ${e.description?`<p class="form-text text-muted mt-1 mb-0">${e.description}</p>`:""}
      </div>
      <div class="col-md-8">
        ${o}
        ${i}
      </div>
    </div>
  `});function at(e){let t="";for(const s in e){if(!e.hasOwnProperty(s))continue;const i=e[s];t+=`### ${i.title} ###

`;const n=typeof i.debug_data=="object"&&i.debug_data!==null||Array.isArray(i.debug_data)?i.debug_data:i.data;if(s==="active_plugins"&&Array.isArray(n)){let o=n.map(a=>{if(typeof a=="object"&&a!==null&&a.plugin){let r=`${a.name||"N/A"} (Version: ${a.version||"N/A"}`;return a.author_name&&(r+=`, Author: ${a.author_name}`),a.network_activated&&(r+=", Network Activated"),r+=")",r}return String(a)}).join(`
	`);t+=`Plugins: ${o?`
	${o}`:"None"}
`}else if(s==="theme"&&typeof n=="object"&&n!==null){for(const o in n)if(o!=="overrides"&&n.hasOwnProperty(o)){let a=n[o];if(typeof a=="boolean"&&(a=a?"Yes":"No"),o==="author_url"&&n.author_name||o==="parent_author_url"&&n.parent_author_name)continue;t+=`${I(o)}: ${String(a).replace(/<[^>]+>/g,"").trim()}
`}if(Array.isArray(n.overrides)){const o=n.overrides.map(a=>typeof a=="object"&&a!==null&&a.file?`${a.file} (Theme Version: ${a.version||"-"}, Core Version: ${a.core_version||"-"})`:String(a)).join(`
	`);t+=`Template Overrides: ${o?`
	${o}`:"None"}
`}}else if(s==="database"&&typeof n=="object"&&n!==null){for(const o in n)if(o!=="database_tables"&&n.hasOwnProperty(o)){let a=n[o];o==="database_size"&&typeof a=="object"&&a!==null&&(a=`Data: ${a.data||0}MB, Index: ${a.index||0}MB`),t+=`${I(o)}: ${String(a).replace(/<[^>]+>/g,"").trim()}
`}if(typeof n.database_tables=="object"&&n.database_tables!==null){const o=(r,c)=>{let l="";if(c&&Object.keys(c).length>0){l+=`
	${r}:
`;for(const d in c){const u=c[d];l+=`		${d}: ${typeof u=="object"&&u!==null?`Data: ${u.data||0}MB, Index: ${u.index||0}MB`:"Missing/Error"}
`}}return l};let a=o("Framework Tables",n.database_tables.framework);a+=o("Other Tables",n.database_tables.other),a&&(t+=`Database Tables: ${a}
`)}}else if(s==="post_types"&&Array.isArray(n)){let o=n.map(a=>`${a.type}: ${a.count}`).join(`
	`);t+=`Counts: ${o?`
	${o}`:"None"}
`}else if(typeof n=="object"&&n!==null)for(const o in n){if(!n.hasOwnProperty(o)||o.startsWith("---"))continue;let a=n[o];typeof a=="boolean"?a=a?"Yes":"No":Array.isArray(a)?a=a.join(", "):typeof a=="object"&&a!==null&&(a=JSON.stringify(a)),t+=`${I(o)}: ${String(a).replace(/<[^>]+>/g,"").trim()}
`}else t+=`Data: ${String(n).replace(/<[^>]+>/g,"").trim()}
`;t+=`
`}return t+=`### User Agent ###

`,t+=`User Agent: ${navigator.userAgent}
`,t.trim()}function I(e){return e.replace(/_/g," ").replace(/\b\w/g,t=>t.toUpperCase())}function q(e,t){t.classList.remove("visually-hidden"),t.style.position="fixed",t.style.opacity="0",t.style.pointerEvents="none",t.select(),t.setSelectionRange(0,99999);let s=!1;try{s=document.execCommand("copy")}catch(o){console.error("ASF Status Report: fallback execCommand copy failed",o)}t.classList.add("visually-hidden"),t.style.position="",t.style.opacity="",t.style.pointerEvents="",window.getSelection?window.getSelection().removeAllRanges():document.selection&&document.selection.empty();const i=e.innerHTML,n=e.className;s?(e.innerHTML='<i class="fa-solid fa-check me-2"></i> Copied!',e.className="btn btn-success btn-sm"):(e.innerHTML='<i class="fa-solid fa-xmark me-2"></i> Failed!',e.className="btn btn-danger btn-sm",alert("Automatic copy failed. Please manually select and copy the text from the status report area.")),setTimeout(()=>{e.innerHTML=i,e.className=n},2500)}function rt(e){const t=document.getElementById("asf-status-report-data"),s=document.getElementById("asf-status-report-textarea");if(!t||!s){console.error("ASF Status Report: Missing data or textarea element."),alert("Copy failed: Could not find necessary elements.");return}let i;try{i=JSON.parse(t.textContent||"{}")}catch(o){console.error("ASF Status Report: Failed to parse status data.",o),alert("Copy failed: Could not read status data.");return}const n=at(i);s.value=n,navigator.clipboard&&window.isSecureContext?navigator.clipboard.writeText(n).then(()=>{const o=e.innerHTML,a=e.className;e.innerHTML='<i class="fa-solid fa-check me-2"></i> Copied!',e.className="btn btn-success btn-sm",setTimeout(()=>{e.innerHTML=o,e.className=a},2500)}).catch(o=>{console.warn("ASF Status Report: Clipboard API copy failed, attempting fallback.",o),q(e,s)}):(console.warn("ASF Status Report: Using fallback copy method."),q(e,s))}typeof window<"u"&&(window.ayecodeSettingsApp=Fe,window.setupWizardComponent=J,window.asfCopyStatusReport=rt),document.addEventListener("DOMContentLoaded",function(){if(typeof window.Alpine>"u"){console.error("Alpine.js is required for AyeCode Settings Framework");return}console.log("AyeCode Settings Framework ready")}),document.addEventListener("alpine:init",()=>{Alpine.directive("sort")?(console.log("x-sort directive is available ✅"),window.Alpine.data("listTableComponent",Ce),window.Alpine.data("dashboardComponent",ke),window.Alpine.data("extensionListComponent",xe),window.Alpine.data("setupWizardComponent",J)):console.log("x-sort directive not found ❌")})})();
